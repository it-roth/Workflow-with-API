<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MissionRequest;
use App\Services\WorkflowService;
use Illuminate\Http\Request;

class MissionRequestController extends Controller
{
    protected $workflowService;

    public function __construct(WorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if (in_array($user->role, ['system_admin', 'ceo', 'cfo'])) {
            $requests = MissionRequest::with(['user', 'approvalHistory'])->get();
        } else {
            $requests = MissionRequest::with(['user', 'approvalHistory'])
                ->where('user_id', $user->id)
                ->get();
        }

        // Transform data to match frontend expectations
        $transformedRequests = $requests->map(function($request) {
            return [
                'id' => $request->id,
                'user_id' => $request->user_id,
                'destination' => $request->destination,
                'purpose' => $request->purpose,
                'startDate' => $request->start_date,
                'endDate' => $request->end_date,
                'estimatedBudget' => $request->estimated_budget,
                'transportationMode' => $request->transportation_mode,
                'accommodationNeeded' => $request->accommodation_needed,
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
            'destination' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'estimated_budget' => 'required|numeric|min:0',
            'transportation_mode' => 'required|in:flight,car,train,bus',
            'accommodation_needed' => 'boolean',
        ]);

        $missionRequest = MissionRequest::create([
            'user_id' => $request->user()->id,
            'destination' => $request->destination,
            'purpose' => $request->purpose,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'estimated_budget' => $request->estimated_budget,
            'transportation_mode' => $request->transportation_mode,
            'accommodation_needed' => $request->accommodation_needed ?? false,
        ]);

        $this->workflowService->initializeWorkflow($missionRequest, 'mission');

        // Transform response to match frontend expectations
        $transformedRequest = [
            'id' => $missionRequest->id,
            'user_id' => $missionRequest->user_id,
            'destination' => $missionRequest->destination,
            'purpose' => $missionRequest->purpose,
            'startDate' => $missionRequest->start_date,
            'endDate' => $missionRequest->end_date,
            'estimatedBudget' => $missionRequest->estimated_budget,
            'transportationMode' => $missionRequest->transportation_mode,
            'accommodationNeeded' => $missionRequest->accommodation_needed,
            'status' => $missionRequest->status,
            'createdAt' => $missionRequest->created_at,
            'userDepartment' => $missionRequest->user->department ?? 'Unknown',
            'userName' => $missionRequest->user->name ?? 'Unknown',
            'approvalHistory' => $missionRequest->approvalHistory->map(function($history) {
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

        return response()->json($transformedRequest, 201);
    }

    public function show(MissionRequest $missionRequest)
    {
        // Transform response to match frontend expectations
        $transformedRequest = [
            'id' => $missionRequest->id,
            'user_id' => $missionRequest->user_id,
            'destination' => $missionRequest->destination,
            'purpose' => $missionRequest->purpose,
            'startDate' => $missionRequest->start_date,
            'endDate' => $missionRequest->end_date,
            'estimatedBudget' => $missionRequest->estimated_budget,
            'transportationMode' => $missionRequest->transportation_mode,
            'accommodationNeeded' => $missionRequest->accommodation_needed,
            'status' => $missionRequest->status,
            'createdAt' => $missionRequest->created_at,
            'userDepartment' => $missionRequest->user->department ?? 'Unknown',
            'userName' => $missionRequest->user->name ?? 'Unknown',
            'approvalHistory' => $missionRequest->approvalHistory->map(function($history) {
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

        return response()->json($transformedRequest);
    }

    public function approve(Request $request, MissionRequest $missionRequest)
    {
        $request->validate([
            'action' => 'required|in:approved,rejected',
            'comments' => 'nullable|string|max:500',
        ]);

        $result = $this->workflowService->processApproval(
            $missionRequest,
            $request->user()->role,
            $request->action,
            $request->comments
        );

        if (!$result) {
            return response()->json(['message' => 'Unable to process approval'], 400);
        }

        return response()->json($missionRequest->fresh()->load(['user', 'approvalHistory']));
    }

    public function update(Request $request, MissionRequest $missionRequest)
    {
        // Only allow updates if request is pending and belongs to user
        if ($missionRequest->status !== 'pending' || $missionRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Cannot update this request'], 403);
        }

        $request->validate([
            'destination' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'estimated_budget' => 'required|numeric|min:0',
            'transportation_mode' => 'required|in:flight,car,train,bus',
            'accommodation_needed' => 'boolean',
        ]);

        $missionRequest->update([
            'destination' => $request->destination,
            'purpose' => $request->purpose,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'estimated_budget' => $request->estimated_budget,
            'transportation_mode' => $request->transportation_mode,
            'accommodation_needed' => $request->accommodation_needed ?? false,
        ]);

        return response()->json($missionRequest->fresh()->load(['user', 'approvalHistory']));
    }

    public function destroy(MissionRequest $missionRequest)
    {
        // Allow deletion if request belongs to user (pending or approved)
        if ($missionRequest->user_id !== auth()->id()) {
            return response()->json(['message' => 'Cannot delete this request'], 403);
        }
        
        $missionRequest->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }
}