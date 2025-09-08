<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\LeaveRequest;
use App\Models\ApprovalHistory;
use App\Services\WorkflowService;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-data', function () {
    $output = [];
    
    // Check users
    $users = User::all();
    $output[] = "Users: " . $users->count();
    foreach($users as $user) {
        $output[] = "- {$user->name} ({$user->role}, dept: {$user->department})";
    }
    
    // Check leave requests
    $leaves = LeaveRequest::with('user')->get();
    $output[] = "\nLeave requests: " . $leaves->count();
    foreach($leaves as $leave) {
        $output[] = "- ID: {$leave->id}, User: {$leave->user->name}, Dept: {$leave->user->department}, Status: {$leave->status}, Current Approver: {$leave->current_approver}";
    }
    
    // Check mission requests
    $missions = MissionRequest::with('user')->get();
    $output[] = "\nMission requests: " . $missions->count();
    foreach($missions as $mission) {
        $output[] = "- ID: {$mission->id}, User: {$mission->user->name}, Dept: {$mission->user->department}, Status: {$mission->status}, Current Approver: {$mission->current_approver}";
    }
    
    // Check approval histories
    $approvals = ApprovalHistory::all();
    $output[] = "\nApproval histories: " . $approvals->count();
    foreach($approvals as $approval) {
        $output[] = "- Role: {$approval->approver_role}, Status: {$approval->status}, Type: {$approval->approvable_type}, ID: {$approval->approvable_id}";
    }
    
    // Test pending approvals for HR Manager
    $workflowService = new \App\Services\WorkflowService();
    $pending = $workflowService->getPendingApprovalsForUser('hr_manager', null);
    
    if ($pending) {
        $output[] = "\nPending for HR Manager:";
        $output[] = "- Leave requests: " . count($pending['leave']);
        $output[] = "- Mission requests: " . count($pending['mission']);
        
        foreach($pending['leave'] as $request) {
            $output[] = "  * Leave ID {$request['id']} from {$request['user_name']} ({$request['user_department']}) - {$request['type']}";
        }
        
        foreach($pending['mission'] as $request) {
            $output[] = "  * Mission ID {$request['id']} from {$request['user_name']} ({$request['user_department']}) - {$request['destination']}";
        }
    }
    
    return '<pre>' . implode("\n", $output) . '</pre>';
});

