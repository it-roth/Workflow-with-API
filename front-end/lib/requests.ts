// NEW requests.ts - API calls instead of mock data
import { api } from './api'

// Keep interfaces but remove mock arrays
export interface LeaveRequest {
  id: string; // bigint in DB, use string in TS
  user_id: string; // bigint in DB, use string in TS
  type: "annual" | "sick" | "personal" | "maternity" | "emergency";
  start_date: string; // date (YYYY-MM-DD)
  end_date: string; // date (YYYY-MM-DD)
  reason: string;
  status: "pending" | "approved" | "rejected";
  current_approver?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Replace with API calls
export const createLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>): Promise<LeaveRequest> => {
  // Only send required fields and ensure correct values (with type)
  const payload = {
    type: requestData.type,
    start_date: requestData.start_date,
    end_date: requestData.end_date,
    reason: requestData.reason,
  }
  try {
    const response = await api.post('/leave-requests', payload)
    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      // Pass validation errors or backend errors up to the caller
      throw error
    }
    throw new Error('Failed to create leave request')
  }
}

export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const response = await api.get('/leave-requests')
  return response.data
}

export const approveLeaveRequest = async (requestId: string, action: 'approved' | 'rejected', comments?: string): Promise<boolean> => {
  try {
    await api.post(`/leave-requests/${requestId}/approve`, { action, comments })
    return true
  } catch (error) {
    return false
  }
}

export const getPendingApprovals = async () => {
  const response = await api.get('/pending-approvals')
  return response.data
}


