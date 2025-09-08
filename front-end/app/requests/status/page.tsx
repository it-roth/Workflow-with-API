"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Eye,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

// Local types
type ApprovalStep = {
  approverRole: string
  approverName?: string
  status: "pending" | "approved" | "rejected"
  timestamp?: string
  comments?: string
}

type LeaveRequest = {
  id: number
  type: string
  startDate: string
  endDate: string
  reason: string
  createdAt: string
  status: "pending" | "approved" | "rejected"
  userDepartment: string
  userName: string
  approvalHistory?: ApprovalStep[]
}

type MissionRequest = {
  id: number
  destination: string
  purpose: string
  startDate: string
  endDate: string
  estimatedBudget: number
  transportationMode: string
  accommodationNeeded: boolean
  createdAt: string
  status: "pending" | "approved" | "rejected"
  userDepartment: string
  userName: string
  approvalHistory?: ApprovalStep[]
}

const getLeaveTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    emergency: "Emergency Leave",
    maternity: "Maternity Leave",
    other: "Other",
  }
  return typeMap[type] || type
}

const getTransportationLabel = (mode: string): string => {
  const modeMap: Record<string, string> = {
    flight: "Flight",
    car: "Car",
    train: "Train",
    bus: "Bus",
  }
  return modeMap[mode] || mode
}

const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    team_leader: "Team Leader",
    hr_manager: "HR Manager",
    cfo: "CFO",
    ceo: "CEO",
  }
  return roleMap[role] || role
}

export default function RequestStatusPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<{ leave: LeaveRequest[]; mission: MissionRequest[] }>({
    leave: [],
    mission: [],
  })
  const [selectedRequest, setSelectedRequest] = useState<{
    request: LeaveRequest | MissionRequest
    type: "leave" | "mission"
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState({ leave: 1, mission: 1 })
  const itemsPerPage = 2

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        const [leaveRes, missionRes] = await Promise.all([
          api.get(`/leave-requests`),
          api.get(`/mission-requests`),
        ])
        setRequests({
          leave: (leaveRes.data || []).sort((a: any, b: any) => {
            const dateA = new Date(b.createdAt || b.created_at || 0).getTime()
            const dateB = new Date(a.createdAt || a.created_at || 0).getTime()
            return dateA - dateB
          }),
          mission: (missionRes.data || []).sort((a: any, b: any) => {
            const dateA = new Date(b.createdAt || b.created_at || 0).getTime()
            const dateB = new Date(a.createdAt || a.created_at || 0).getTime()
            return dateA - dateB
          }),
        })
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError('Failed to load requests. Please try again.')
        setRequests({ leave: [], mission: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const handleDeleteRequest = async (requestId: number, type: 'leave' | 'mission') => {
    if (!confirm('Are you sure you want to delete this request?')) return
    
    try {
      await api.delete(`/${type}-requests/${requestId}`)
      // Refresh requests after deletion
      const [leaveRes, missionRes] = await Promise.all([
        api.get(`/leave-requests`),
        api.get(`/mission-requests`),
      ])
      setRequests({
        leave: (leaveRes.data || []).sort((a: any, b: any) => {
          const dateA = new Date(b.createdAt || b.created_at || 0).getTime()
          const dateB = new Date(a.createdAt || a.created_at || 0).getTime()
          return dateA - dateB
        }),
        mission: (missionRes.data || []).sort((a: any, b: any) => {
          const dateA = new Date(b.createdAt || b.created_at || 0).getTime()
          const dateB = new Date(a.createdAt || a.created_at || 0).getTime()
          return dateA - dateB
        }),
      })
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Failed to delete request. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getWorkflowProgress = (approvalHistory?: ApprovalStep[]) => {
    if (!Array.isArray(approvalHistory) || approvalHistory.length === 0) return 0
    const completedSteps = approvalHistory.filter((step) => step.status !== "pending").length
    return (completedSteps / approvalHistory.length) * 100
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
    if (!startDate || !endDate) return 'N/A'
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? `${diffDays} days` : 'Invalid duration'
    } catch {
      return 'Invalid duration'
    }
  }

  const openRequestDetails = (request: LeaveRequest | MissionRequest, type: "leave" | "mission") => {
    setSelectedRequest({ request, type })
  }

  // Pagination functions
  const getPaginatedData = (data: any[], type: "leave" | "mission") => {
    const startIndex = (currentPage[type] - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage)
  }

  const handlePageChange = (type: "leave" | "mission", page: number) => {
    setCurrentPage(prev => ({ ...prev, [type]: page }))
  }

  const PaginationControls = ({ type, data }: { type: "leave" | "mission", data: any[] }) => {
    if (getTotalPages(data) <= 1) return null
    
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(type, currentPage[type] - 1)}
          disabled={currentPage[type] === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage[type]} of {getTotalPages(data)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(type, currentPage[type] + 1)}
          disabled={currentPage[type] === getTotalPages(data)}
        >
          Next
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your requests...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Request Status</h1>
            <p className="text-muted-foreground">Track your leave and mission requests with detailed progress</p>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="leave" className="space-y-6">
            <TabsList>
              <TabsTrigger value="leave">Leave Requests ({requests.leave.length})</TabsTrigger>
              <TabsTrigger value="mission">Mission Requests ({requests.mission.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="leave" className="space-y-4">
              {requests.leave.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No leave requests found</p>
                    <Button asChild className="mt-4">
                      <Link href="/requests/leave">Submit Leave Request</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {getPaginatedData(requests.leave, "leave").map((request) => {
                    const approvalHistory = Array.isArray(request.approvalHistory) ? request.approvalHistory : [];
                    const progress = getWorkflowProgress(approvalHistory)
                    const currentStep = approvalHistory.find((step: ApprovalStep) => step.status === "pending")

                    return (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {getLeaveTypeLabel(request.type)}
                              </CardTitle>
                              <CardDescription>
                                {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                                {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(request.status)}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1 capitalize">{request.status}</span>
                              </Badge>
                              {request.status === "pending" && (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/requests/leave/edit/${request.id}`}>
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id, 'leave')}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                              {request.status === "approved" && (
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id, 'leave')}>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Request Summary</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p><strong>Type:</strong> {getLeaveTypeLabel(request.type)}</p>
                                        <p><strong>Start Date:</strong> {formatDate(request.startDate)}</p>
                                        <p><strong>End Date:</strong> {formatDate(request.endDate)}</p>
                                        <p><strong>Duration:</strong> {calculateDuration(request.startDate, request.endDate)}</p>
                                      </div>
                                      <div>
                                        <p><strong>Status:</strong> <Badge className={getStatusColor(request.status)}>{request.status}</Badge></p>
                                        <p><strong>Submitted:</strong> {formatDate(request.createdAt)}</p>
                                        <p><strong>Department:</strong> {request.userDepartment}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p><strong>Reason:</strong></p>
                                      <p className="bg-gray-50 p-2 rounded text-sm">{request.reason}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Approval Timeline
                                      </h4>
                                      <p className="text-sm text-muted-foreground mb-3">Progress through your department's approval workflow</p>
                                      <div className="space-y-2">
                                        {approvalHistory.map((step: ApprovalStep, index: number) => (
                                          <div key={index} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                              step.status === "approved" ? "bg-green-100 text-green-700" :
                                              step.status === "rejected" ? "bg-red-100 text-red-700" :
                                              "bg-yellow-100 text-yellow-700"
                                            }`}>
                                              {index + 1}
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-medium">Step {index + 1}</p>
                                              <p className="text-sm text-muted-foreground">Status: {step.status}</p>
                                              {step.comments && (
                                                <div className="mt-1">
                                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Comments:
                                                  </p>
                                                  <p className="text-sm bg-gray-50 p-1 rounded">{step.comments}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Approval Progress</span>
                              <span>{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {currentStep && (
                              <p className="text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Currently with: {getRoleDisplayName(currentStep.approverRole)}
                              </p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              <p>
                                <strong>Reason:</strong> {request.reason}
                              </p>
                              <p>
                                <strong>Submitted:</strong> {formatDate(request.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Department:</strong> {request.userDepartment}
                              </p>
                              <p>
                                <strong>Duration:</strong> {calculateDuration(request.startDate, request.endDate)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  <PaginationControls type="leave" data={requests.leave} />
                </>
              )}
            </TabsContent>

            <TabsContent value="mission" className="space-y-4">
              {requests.mission.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No mission requests found</p>
                    <Button asChild className="mt-4">
                      <Link href="/requests/mission">Submit Mission Request</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {getPaginatedData(requests.mission, "mission").map((request) => {
                    const approvalHistory = Array.isArray(request.approvalHistory) ? request.approvalHistory : [];
                    const progress = getWorkflowProgress(approvalHistory)
                    const currentStep = approvalHistory.find((step: ApprovalStep) => step.status === "pending")

                    return (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Mission to {request.destination}
                              </CardTitle>
                              <CardDescription>
                                {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                                {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(request.status)}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1 capitalize">{request.status}</span>
                              </Badge>
                              {request.status === "pending" && (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/requests/mission/edit/${request.id}`}>
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id, 'mission')}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                              {request.status === "approved" && (
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id, 'mission')}>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Request Summary</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p><strong>Destination:</strong> {request.destination}</p>
                                        <p><strong>Transportation:</strong> {getTransportationLabel(request.transportationMode)}</p>
                                        <p><strong>Accommodation:</strong> {request.accommodationNeeded ? "Required" : "Not Required"}</p>
                                        <p><strong>Status:</strong> <Badge className={getStatusColor(request.status)}>{request.status}</Badge></p>
                                      </div>
                                      <div>
                                        <p><strong>Start Date:</strong> {formatDate(request.startDate)}</p>
                                        <p><strong>End Date:</strong> {formatDate(request.endDate)}</p>
                                        <p><strong>Budget:</strong> ${request.estimatedBudget?.toLocaleString() || 'N/A'}</p>
                                        <p><strong>Created:</strong> {formatDate(request.createdAt)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p><strong>Purpose:</strong></p>
                                      <p className="bg-gray-50 p-2 rounded text-sm">{request.purpose}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Approval Timeline
                                      </h4>
                                      <p className="text-sm text-muted-foreground mb-3">Progress through your department's approval workflow</p>
                                      <div className="space-y-2">
                                        {approvalHistory.map((step: ApprovalStep, index: number) => (
                                          <div key={index} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                              step.status === "approved" ? "bg-green-100 text-green-700" :
                                              step.status === "rejected" ? "bg-red-100 text-red-700" :
                                              "bg-yellow-100 text-yellow-700"
                                            }`}>
                                              {index + 1}
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-medium">Step {index + 1}</p>
                                              <p className="text-sm text-muted-foreground">Status: {step.status}</p>
                                              {step.comments && (
                                                <div className="mt-1">
                                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Comments:
                                                  </p>
                                                  <p className="text-sm bg-gray-50 p-1 rounded">{step.comments}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Approval Progress</span>
                              <span>{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {currentStep && (
                              <p className="text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Currently with: {getRoleDisplayName(currentStep.approverRole)}
                              </p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              <p>
                                <strong>Purpose:</strong> {request.purpose}
                              </p>
                              <p>
                                <strong>Budget:</strong> ${request.estimatedBudget?.toLocaleString() || 'N/A'}
                              </p>
                              <p>
                                <strong>Transportation:</strong> {getTransportationLabel(request.transportationMode)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  <PaginationControls type="mission" data={requests.mission} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
