<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LeaveRequest;
use App\Models\MissionRequest;
use App\Models\ApprovalHistory;
use App\Models\User;

class FixItWorkflows extends Command
{
    protected $signature = 'fix:it-workflows';
    protected $description = 'Fix IT department workflows to correct approval sequence';

    public function handle()
    {
        $this->info('Fixing IT department workflows...');

        // Fix existing approval histories by replacing hr_manager with ceo for IT department
        $this->info('Updating approval histories...');
        
        // Get IT department user IDs
        $itUserIds = User::where('department', 'IT')->pluck('id');
        
        // Update leave request approval histories
        $leaveRequestIds = LeaveRequest::whereIn('user_id', $itUserIds)->pluck('id');
        $updatedLeaveHistories = ApprovalHistory::where('approvable_type', LeaveRequest::class)
            ->whereIn('approvable_id', $leaveRequestIds)
            ->where('approver_role', 'hr_manager')
            ->update(['approver_role' => 'ceo']);
        
        $this->info("Updated {$updatedLeaveHistories} leave approval histories");
        
        // Update mission request approval histories
        $missionRequestIds = MissionRequest::whereIn('user_id', $itUserIds)->pluck('id');
        $updatedMissionHistories = ApprovalHistory::where('approvable_type', MissionRequest::class)
            ->whereIn('approvable_id', $missionRequestIds)
            ->where('approver_role', 'hr_manager')
            ->update(['approver_role' => 'ceo']);
        
        $this->info("Updated {$updatedMissionHistories} mission approval histories");
        
        // Update current_approver for pending requests
        $updatedLeaveRequests = LeaveRequest::whereIn('user_id', $itUserIds)
            ->where('current_approver', 'hr_manager')
            ->update(['current_approver' => 'ceo']);
        
        $updatedMissionRequests = MissionRequest::whereIn('user_id', $itUserIds)
            ->where('current_approver', 'hr_manager')
            ->update(['current_approver' => 'ceo']);
        
        $this->info("Updated current_approver for {$updatedLeaveRequests} leave requests and {$updatedMissionRequests} mission requests");
        
        $this->info('IT department workflows fixed successfully!');
        return 0;
    }
}
