<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\LeaveRequest;
use App\Services\WorkflowService;

class TestRequestSeeder extends Seeder
{
    public function run()
    {
        $workflowService = new WorkflowService();
        
        // Find an employee user
        $employee = User::where('role', 'employee')->first();
        
        if ($employee) {
            // Create a test leave request
            $leaveRequest = LeaveRequest::create([
                'user_id' => $employee->id,
                'type' => 'annual',
                'start_date' => now()->addDays(7),
                'end_date' => now()->addDays(10),
                'reason' => 'Family vacation',
                'status' => 'pending',
            ]);
            
            // Initialize workflow for this request
            $workflowService->initializeWorkflow($leaveRequest, 'leave');
            
            $this->command->info("Created test leave request with ID: {$leaveRequest->id}");
        } else {
            $this->command->error("No employee user found to create test request");
        }
    }
}
