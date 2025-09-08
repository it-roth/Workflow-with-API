<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\MissionRequestController;
use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!', 'time' => now()]);
});

// Public users endpoint
Route::get('/users', function () {
    $users = \App\Models\User::all();
    return response()->json($users);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Leave requests
    Route::apiResource('leave-requests', LeaveRequestController::class);
    Route::post('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve']);
    
    // Mission requests  
    Route::apiResource('mission-requests', MissionRequestController::class);
    Route::post('mission-requests/{missionRequest}/approve', [MissionRequestController::class, 'approve']);
    
    // Departments
    Route::get('/departments', [DepartmentController::class, 'index']);
    
    // Dashboard
    Route::get('/pending-approvals', function () {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        if (!$user->role) {
            return response()->json(['error' => 'User role not found'], 400);
        }
        $workflowService = new \App\Services\WorkflowService();
        try {
            $pending = $workflowService->getPendingApprovalsForUser($user->role, $user->department);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Workflow error', 'details' => $e->getMessage()], 500);
        }
        return response()->json($pending ?? []);
    });

    // Approvals endpoints for frontend compatibility
    Route::get('/approvals/leave', function () {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $workflowService = new \App\Services\WorkflowService();
        $pending = $workflowService->getPendingApprovalsForUser($user->role, $user->department);
        
        // Transform data to match frontend expectations
        $leaveRequests = array_map(function($request) {
            return [
                'id' => $request['id'],
                'status' => $request['status'],
                'type' => $request['type'],
                'userName' => $request['user_name'],
                'userDepartment' => $request['user_department'] ?? 'Unknown',
                'startDate' => $request['start_date'],
                'endDate' => $request['end_date'],
                'reason' => $request['reason'],
                'createdAt' => $request['created_at'],
            ];
        }, $pending['leave']);
        
        return response()->json($leaveRequests);
    });
    
    Route::get('/approvals/mission', function () {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $workflowService = new \App\Services\WorkflowService();
        $pending = $workflowService->getPendingApprovalsForUser($user->role, $user->department);
        
        // Transform data to match frontend expectations
        $missionRequests = array_map(function($request) {
            return [
                'id' => $request['id'],
                'status' => $request['status'],
                'userName' => $request['user_name'],
                'userDepartment' => $request['user_department'] ?? 'Unknown',
                'destination' => $request['destination'],
                'estimatedBudget' => $request['estimated_budget'],
                'transportationMode' => $request['transportation_mode'] ?? 'car',
                'accommodationNeeded' => $request['accommodation_needed'] ?? false,
                'purpose' => $request['purpose'],
                'startDate' => $request['start_date'],
                'endDate' => $request['end_date'],
                'createdAt' => $request['created_at'],
            ];
        }, $pending['mission']);
        
        return response()->json($missionRequests);
    });
    
    // Process approval endpoints
    Route::post('/approvals/leave/{id}/process', function ($id) {
        $request = request();
        $leaveRequest = \App\Models\LeaveRequest::findOrFail($id);
        
        $workflowService = new \App\Services\WorkflowService();
        $result = $workflowService->processApproval(
            $leaveRequest,
            $request->approver_role,
            $request->action,
            $request->comments
        );
        
        if (!$result) {
            return response()->json(['message' => 'Unable to process approval'], 400);
        }
        
        return response()->json(['message' => 'Approval processed successfully']);
    });
    
    Route::post('/approvals/mission/{id}/process', function ($id) {
        $request = request();
        $missionRequest = \App\Models\MissionRequest::findOrFail($id);
        
        $workflowService = new \App\Services\WorkflowService();
        $result = $workflowService->processApproval(
            $missionRequest,
            $request->approver_role,
            $request->action,
            $request->comments
        );
        
        if (!$result) {
            return response()->json(['message' => 'Unable to process approval'], 400);
        }
        
        return response()->json(['message' => 'Approval processed successfully']);
    });

    // User management endpoints (protected version removed since public version exists above)

    Route::post('/users', function () {
        $request = request();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:employee,team_leader,hr_manager,cfo,ceo,department_admin,system_admin',
            'department' => 'required|string|max:255',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'department' => $request->department,
        ]);

        return response()->json($user, 201);
    });

    Route::put('/users/{id}', function ($id) {
        $request = request();
        $user = \App\Models\User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|in:employee,team_leader,hr_manager,cfo,ceo,department_admin,system_admin',
            'department' => 'required|string|max:255',
        ]);

        $user->update($request->only(['name', 'email', 'role', 'department']));
        
        if ($request->password) {
            $user->update(['password' => bcrypt($request->password)]);
        }

        return response()->json($user);
    });

    Route::delete('/users/{id}', function ($id) {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    });

    // Department management endpoints
    Route::get('/departments', function () {
        $departments = \App\Models\Department::all();
        return response()->json($departments);
    });

    Route::post('/departments', function () {
        $request = request();
        $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'leave_workflow' => 'array',
            'mission_workflow' => 'array',
        ]);

        $department = \App\Models\Department::create([
            'name' => $request->name,
            'leave_workflow' => $request->leave_workflow ?? ['team_leader', 'hr_manager', 'ceo'],
            'mission_workflow' => $request->mission_workflow ?? ['team_leader', 'cfo', 'hr_manager', 'ceo'],
        ]);

        return response()->json($department, 201);
    });

    Route::put('/departments/{id}', function ($id) {
        $request = request();
        $department = \App\Models\Department::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'leave_workflow' => 'array',
            'mission_workflow' => 'array',
        ]);

        $department->update($request->only(['name', 'leave_workflow', 'mission_workflow']));
        return response()->json($department);
    });

    Route::delete('/departments/{id}', function ($id) {
        $department = \App\Models\Department::findOrFail($id);
        $department->delete();
        return response()->json(['message' => 'Department deleted successfully']);
    });
});