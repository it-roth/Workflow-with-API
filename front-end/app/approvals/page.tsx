"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, MapPin, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

// Helper functions
function getLeaveTypeLabel(type: string) {
  if (type === "vacation") return "Vacation"
  if (type === "sick") return "Sick Leave"
  if (type === "personal") return "Personal Leave"
  if (type === "emergency") return "Emergency Leave"
  return type
}
function getTransportationLabel(mode: string) {
  if (mode === "car") return "Car"
  if (mode === "plane") return "Plane"
  if (mode === "train") return "Train"
  return mode
}

// Types
interface LeaveRequest {
  id: string
  status: string
  type: string
  userName: string
  userDepartment: string
  startDate: string
  endDate: string
  reason: string
  createdAt: string
}
interface MissionRequest {
  id: string
  status: string
  userName: string
  userDepartment: string
  destination: string
  estimatedBudget: number
  transportationMode: string
  accommodationNeeded: boolean
  purpose: string
  startDate: string
  endDate: string
  createdAt: string
}

export default function ApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [pendingApprovals, setPendingApprovals] = useState<{ leave: LeaveRequest[]; mission: MissionRequest[] }>({
    leave: [],
    mission: [],
  })
  const [selectedRequest, setSelectedRequest] = useState<{
    request: LeaveRequest | MissionRequest
    type: "leave" | "mission"
  } | null>(null)
  const [comments, setComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (authLoading) return
    
    if (user) {
      Promise.all([
  api.get(`/approvals/leave?role=${user.role}&department=${user.department}`),
  api.get(`/approvals/mission?role=${user.role}&department=${user.department}`)
      ]).then(([leaveRes, missionRes]) => {
        setPendingApprovals({ leave: leaveRes.data, mission: missionRes.data })
      })
    }
  }, [user, authLoading])

  const handleApproval = async (action: "approved" | "rejected") => {
    if (!selectedRequest || !user) return
    setIsProcessing(true)
    try {
      await api.post(`/approvals/${selectedRequest.type}/${selectedRequest.request.id}/process`, {
        approver_role: user.role,
        action,
        comments: comments.trim() || undefined,
      })
      // Refresh pending approvals
      const [leaveRes, missionRes] = await Promise.all([
        api.get(`/approvals/leave?role=${user.role}&department=${user.department}`),
        api.get(`/approvals/mission?role=${user.role}&department=${user.department}`)
      ])
      setPendingApprovals({ leave: leaveRes.data, mission: missionRes.data })
      setSelectedRequest(null)
      setComments("")
    } catch {
      // handle error if needed
    }
    setIsProcessing(false)
  }

  const openApprovalDialog = (request: LeaveRequest | MissionRequest, type: "leave" | "mission") => {
    setSelectedRequest({ request, type })
    setComments("")
  }

  if (!user || !["team_leader", "hr_manager", "cfo", "ceo"].includes(user.role)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have approval permissions.</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["team_leader", "hr_manager", "cfo", "ceo"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Pending Approvals</h1>
            <p className="text-muted-foreground">Review and approve requests requiring your attention</p>
          </div>

          <Tabs defaultValue="leave" className="space-y-6">
            <TabsList>
              <TabsTrigger value="leave">Leave Requests ({pendingApprovals.leave.length})</TabsTrigger>
              <TabsTrigger value="mission">Mission Requests ({pendingApprovals.mission.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="leave" className="space-y-4">
              {pendingApprovals.leave.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <p className="text-muted-foreground">No pending leave requests</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApprovals.leave.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {getLeaveTypeLabel(request.type)} - {request.userName}
                          </CardTitle>
                          <CardDescription>
                            {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                            {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Your Approval
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p>
                              <strong>Employee:</strong> {request.userName}
                            </p>
                            <p>
                              <strong>Department:</strong> {request.userDepartment}
                            </p>
                            <p>
                              <strong>Submitted:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Leave Type:</strong> {getLeaveTypeLabel(request.type)}
                            </p>
                            <p>
                              <strong>Duration:</strong>{" "}
                              {Math.ceil(
                                (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                              days
                            </p>
                          </div>
                        </div>
                        <div>
                          <strong>Reason:</strong>
                          <p className="mt-1 text-muted-foreground">{request.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => openApprovalDialog(request, "leave")}>Review Request</Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="mission" className="space-y-4">
              {pendingApprovals.mission.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <p className="text-muted-foreground">No pending mission requests</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApprovals.mission.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Mission to {request.destination} - {request.userName}
                          </CardTitle>
                          <CardDescription>
                            {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                            {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Your Approval
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p>
                              <strong>Employee:</strong> {request.userName}
                            </p>
                            <p>
                              <strong>Department:</strong> {request.userDepartment}
                            </p>
                            <p>
                              <strong>Destination:</strong> {request.destination}
                            </p>
                            <p>
                              <strong>Budget:</strong> ${request.estimatedBudget.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Transportation:</strong> {getTransportationLabel(request.transportationMode)}
                            </p>
                            <p>
                              <strong>Accommodation:</strong>{" "}
                              {request.accommodationNeeded ? "Required" : "Not required"}
                            </p>
                            <p>
                              <strong>Submitted:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <strong>Purpose:</strong>
                          <p className="mt-1 text-muted-foreground">{request.purpose}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => openApprovalDialog(request, "mission")}>Review Request</Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Approval Dialog */}
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Request</DialogTitle>
                <DialogDescription>
                  {selectedRequest?.type === "leave" ? "Leave" : "Mission"} request from{" "}
                  {selectedRequest?.request.userName}
                </DialogDescription>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Request Details</h4>
                    {selectedRequest.type === "leave" ? (
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Type:</strong> {getLeaveTypeLabel((selectedRequest.request as LeaveRequest).type)}
                        </p>
                        <p>
                          <strong>Dates:</strong> {selectedRequest.request.startDate ? new Date(selectedRequest.request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                          {selectedRequest.request.endDate ? new Date(selectedRequest.request.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p>
                          <strong>Reason:</strong> {(selectedRequest.request as LeaveRequest).reason}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Destination:</strong> {(selectedRequest.request as MissionRequest).destination}
                        </p>
                        <p>
                          <strong>Purpose:</strong> {(selectedRequest.request as MissionRequest).purpose}
                        </p>
                        <p>
                          <strong>Budget:</strong> $
                          {(selectedRequest.request as MissionRequest).estimatedBudget.toLocaleString()}
                        </p>
                        <p>
                          <strong>Dates:</strong> {selectedRequest.request.startDate ? new Date(selectedRequest.request.startDate).toLocaleDateString() : 'N/A'} -{" "}
                          {selectedRequest.request.endDate ? new Date(selectedRequest.request.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add any comments or feedback..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleApproval("approved")}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isProcessing ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleApproval("rejected")}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isProcessing ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
