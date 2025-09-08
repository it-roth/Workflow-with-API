<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Services\WorkflowService;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    protected $workflowService;

    public function __construct(WorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if (in_array($user->role, ['system_admin', 'hr_manager'])) {
            $requests = LeaveRequest::with(['user', 'approvalHistory'])->get();
        } else {
            $requests = LeaveRequest::with(['user', 'approvalHistory'])
                ->where('user_id', $user->id)
                ->get();
        }

        // Transform data to match frontend expectations
        $transformedRequests = $requests->map(function($request) {
            return [
                'id' => $request->id,
                'user_id' => $request->user_id,
                'type' => $request->type,
                'startDate' => $request->start_date,
                'endDate' => $request->end_date,
                'reason' => $request->reason,
                'status' => $request->status,
                'createdAt' => $request->created_at,
                'userDepartment' => $request->user->department ?? 'Unknown',
                'userName' => $request->user->name ?? 'Unknown',
                'approvalHistory' => $request->approvalHistory->map(function($history) {
                    return [
                        'id' => $history->id,
                        'approver_role' => $history->approver_role,
                        'approver_name' => $history->approver_name,
                        'status' => $history->status,
                        'comments' => $history->comments,
                        'created_at' => $history->created_at,
                    ];
                }),
            ];
        });

        return response()->json($transformedRequests);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:annual,sick,personal,maternity,emergency',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|max:1000',
        ]);

        $leaveRequest = LeaveRequest::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
        ]);

        $this->workflowService->initializeWorkflow($leaveRequest, 'leave');

        return response()->json($leaveRequest->load(['user', 'approvalHistory']), 201);
    }

    public function show(LeaveRequest $leaveRequest)
    {
        return response()->json($leaveRequest->load(['user', 'approvalHistory']));
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'action' => 'required|in:approved,rejected',
            'comments' => 'nullable|string|max:500',
        ]);

        $result = $this->workflowService->processApproval(
            $leaveRequest,
            $request->user()->role,
            $request->action,
            $request->comments
        );

        if (!$result) {
            return response()->json(['message' => 'Unable to process approval'], 400);
        }

        return response()->json($leaveRequest->fresh()->load(['user', 'approvalHistory']));
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        // Only allow updates if request is pending and belongs to user
        if ($leaveRequest->status !== 'pending' || $leaveRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Cannot update this request'], 403);
        }

        $request->validate([
            'type' => 'required|in:annual,sick,personal,maternity,emergency',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|max:1000',
        ]);

        $leaveRequest->update([
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
        ]);

        return response()->json($leaveRequest->fresh()->load(['user', 'approvalHistory']));
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        // Allow deletion if request belongs to user (pending or approved)
        if ($leaveRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Cannot delete this request'], 403);
        }
        
        $leaveRequest->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }
}