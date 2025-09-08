<?php

namespace App\Services;

use App\Models\Department;
use App\Models\User;
use App\Models\ApprovalHistory;

class WorkflowService
{
    public function initializeWorkflow($request, $type)
    {
        $user = User::find($request->user_id);
        $department = Department::where('name', $user->department)->first();
        
        // If department doesn't exist, create a default workflow or use fallback
        if (!$department) {
            // Create default workflow for leave requests
            $workflow = $type === 'leave' ? ['team_leader', 'hr_manager'] : ['team_leader', 'department_admin'];
        } else {
            $workflow = $type === 'leave' ? $department->leave_workflow : $department->mission_workflow;
        }

        // Ensure workflow is an array and not empty
        if (!is_array($workflow) || empty($workflow)) {
            $workflow = $type === 'leave' ? ['team_leader', 'hr_manager'] : ['team_leader', 'department_admin'];
        }
        
        foreach ($workflow as $role) {
            ApprovalHistory::create([
                'approvable_id' => $request->id,
                'approvable_type' => get_class($request),
                'approver_role' => $role,
                'status' => 'pending',
            ]);
        }

        if (count($workflow) > 0) {
            $request->update(['current_approver' => $workflow[0]]);
        }

        return true;
    }

    public function processApproval($request, $approverRole, $action, $comments = null)
    {
        if ($request->current_approver !== $approverRole) {
            return false;
        }

        $currentStep = $request->approvalHistory()
            ->where('approver_role', $approverRole)
            ->where('status', 'pending')
            ->first();

        if (!$currentStep) {
            return false;
        }

        $approver = User::where('role', $approverRole)->first();
        
        $currentStep->update([
            'status' => $action,
            'comments' => $comments,
            'approver_name' => $approver->name ?? 'Unknown',
        ]);

        if ($action === 'rejected') {
            $request->update([
                'status' => 'rejected',
                'current_approver' => null,
            ]);
        } else {
            $nextStep = $request->approvalHistory()
                ->where('status', 'pending')
                ->orderBy('id')
                ->first();

            if ($nextStep) {
                $request->update(['current_approver' => $nextStep->approver_role]);
            } else {
                $request->update([
                    'status' => 'approved',
                    'current_approver' => null,
                ]);
            }
        }

        return true;
    }
    
    public function getPendingApprovalsForUser($role, $userDepartment = null)
    {
        // Build query for leave requests
        $leaveQuery = \App\Models\LeaveRequest::where('current_approver', $role)
            ->where('status', 'pending')
            ->with('user');
            
        // For team leaders, only show requests from their department
        if ($role === 'team_leader' && $userDepartment) {
            $leaveQuery->whereHas('user', function($query) use ($userDepartment) {
                $query->where('department', $userDepartment);
            });
        }
        
        $leaveRequests = $leaveQuery->get()
            ->map(function($request) {
                return [
                    'id' => $request->id,
                    'user_id' => $request->user_id,
                    'user_name' => $request->user->name ?? 'Unknown',
                    'user_department' => $request->user->department ?? 'Unknown',
                    'type' => $request->type,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'reason' => $request->reason,
                    'status' => $request->status,
                    'current_approver' => $request->current_approver,
                    'created_at' => $request->created_at,
                ];
            })->toArray();

        // Build query for mission requests
        $missionQuery = \App\Models\MissionRequest::where('current_approver', $role)
            ->where('status', 'pending')
            ->with('user');
            
        // For team leaders, only show requests from their department
        if ($role === 'team_leader' && $userDepartment) {
            $missionQuery->whereHas('user', function($query) use ($userDepartment) {
                $query->where('department', $userDepartment);
            });
        }
        
        $missionRequests = $missionQuery->get()
            ->map(function($request) {
                return [
                    'id' => $request->id,
                    'user_id' => $request->user_id,
                    'user_name' => $request->user->name ?? 'Unknown',
                    'user_department' => $request->user->department ?? 'Unknown',
                    'destination' => $request->destination ?? '',
                    'purpose' => $request->purpose ?? '',
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'estimated_budget' => $request->estimated_budget ?? 0,
                    'transportation_mode' => $request->transportation_mode ?? 'car',
                    'accommodation_needed' => $request->accommodation_needed ?? false,
                    'status' => $request->status,
                    'current_approver' => $request->current_approver,
                    'created_at' => $request->created_at,
                ];
            })->toArray();

        return [
            'leave' => $leaveRequests,
            'mission' => $missionRequests
        ];
    }
}