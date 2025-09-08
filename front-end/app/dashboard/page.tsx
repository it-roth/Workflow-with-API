"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Users,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  LogOut,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

// Helper to display role safely
const getRoleDisplayName = (role?: string): string => {
  if (!role) return "UNKNOWN"
  return role.replace("_", " ").toUpperCase()
}

// Helper to get leave type label
const getLeaveTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    personal: "Personal Leave",
    maternity: "Maternity Leave",
    emergency: "Emergency Leave",
  }
  return typeMap[type] || type
}

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // Handle logout button click
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  }
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    userRequests: { leave: any[]; mission: any[] };
    pendingApprovals: { leave: any[]; mission: any[] };
    systemStats: {
      totalUsers: number;
      totalDepartments: number;
      totalRequests: number;
      pendingRequests: number;
    };
  }>({
    userRequests: { leave: [], mission: [] },
    pendingApprovals: { leave: [], mission: [] },
    systemStats: {
      totalUsers: 0,
      totalDepartments: 0,
      totalRequests: 0,
      pendingRequests: 0,
    },
  })

  // Redirect admins to their respective panels
  useEffect(() => {
    if (authLoading) return
    
    if (user && user.role === 'department_admin') {
      router.push('/admin/department')
    } else if (user && user.role === 'system_admin') {
      router.push('/admin/system')
    }
  }, [user, router, authLoading])

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        // Fetch user's own requests
        const [leaveResponse, missionResponse] = await Promise.allSettled([
          api.get('/leave-requests'),
          api.get('/mission-requests')
        ])

        const allLeaveRequests = leaveResponse.status === 'fulfilled' && Array.isArray(leaveResponse.value.data) ? leaveResponse.value.data : []
        const allMissionRequests = missionResponse.status === 'fulfilled' && Array.isArray(missionResponse.value.data) ? missionResponse.value.data : []

        // Filter user's own requests and sort by newest first
        const userRequests = {
          leave: allLeaveRequests
            .filter((req: any) => req.user_id === user.id)
            .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()),
          mission: allMissionRequests
            .filter((req: any) => req.user_id === user.id)
            .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())
        }

        // Fetch pending approvals for approvers
        let pendingApprovals = { leave: [], mission: [] }
        if (["team_leader", "hr_manager", "cfo", "ceo"].includes(user.role)) {
          try {
            const approvalResponse = await api.get('/pending-approvals')
            if (approvalResponse.status === 200 && approvalResponse.data) {
              pendingApprovals = {
                leave: Array.isArray(approvalResponse.data.leave) ? approvalResponse.data.leave : [],
                mission: Array.isArray(approvalResponse.data.mission) ? approvalResponse.data.mission : []
              }
            }
          } catch (error) {
            console.error('Error fetching pending approvals:', error)
          }
        }

        // Fetch departments for admin stats
        let totalDepartments = 0
        try {
          const deptResponse = await api.get('/departments')
          totalDepartments = Array.isArray(deptResponse.data) ? deptResponse.data.length : 0
        } catch (error) {
          console.error('Error fetching departments:', error)
        }

        // System stats
        const totalUsers = 0 // TODO: implement
        const totalRequests = allLeaveRequests.length + allMissionRequests.length
        const pendingRequests = pendingApprovals.leave.length + pendingApprovals.mission.length
        const systemStats = {
          totalUsers,
          totalDepartments,
          totalRequests,
          pendingRequests,
        }

        setDashboardData({
          userRequests,
          pendingApprovals,
          systemStats,
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Show loading state (after all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  if (!user) return null

  const isAdmin = user.role === "system_admin"
  const isApprover = ["team_leader", "hr_manager", "cfo", "ceo"].includes(user.role)
  const isDepartmentAdmin = user.role === "department_admin"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{user.department}</Badge>
                <Badge variant="secondary">{getRoleDisplayName(user.role)}</Badge>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Overview Stats */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Employee Stats */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Requests</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData.userRequests.leave.length + dashboardData.userRequests.mission.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.userRequests.leave.length} leave, {dashboardData.userRequests.mission.length} mission
                    </p>
                  </CardContent>
                </Card>

                {/* Approver Stats */}
                {isApprover && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.pendingApprovals.leave.length + dashboardData.pendingApprovals.mission.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Require your attention</p>
                    </CardContent>
                  </Card>
                )}

                {/* System Admin Stats */}
                {isAdmin && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.systemStats.totalDepartments}</div>
                        <p className="text-xs text-muted-foreground">Active departments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Requests</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.systemStats.totalRequests}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardData.systemStats.pendingRequests} pending
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button asChild className="h-auto p-4 flex-col gap-2">
                      <Link href="/requests/leave">
                        <Calendar className="w-6 h-6" />
                        <span>Request Leave</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                      <Link href="/requests/mission">
                        <MapPin className="w-6 h-6" />
                        <span>Request Mission</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                      <Link href="/requests/status">
                        <FileText className="w-6 h-6" />
                        <span>Track Requests</span>
                      </Link>
                    </Button>
                    {isApprover && (
                      <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
                        <Link href="/approvals">
                          <BarChart3 className="w-6 h-6" />
                          <span>Pending Approvals</span>
                          {dashboardData.pendingApprovals.leave.length + dashboardData.pendingApprovals.mission.length >
                            0 && (
                            <Badge variant="destructive" className="text-xs">
                              {dashboardData.pendingApprovals.leave.length +
                                dashboardData.pendingApprovals.mission.length}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Approver Dashboard */}
              {isApprover &&
                (dashboardData.pendingApprovals.leave.length > 0 ||
                  dashboardData.pendingApprovals.mission.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        Urgent: Pending Approvals
                      </CardTitle>
                      <CardDescription>Requests waiting for your approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.pendingApprovals.leave.slice(0, 3).map((request: any) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-yellow-600" />
                              <div>
                                <p className="font-medium">
                                  {request.user_name} - {getLeaveTypeLabel(request.type)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'N/A'} -{" "}
                                  {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <Link href="/approvals">Review</Link>
                            </Button>
                          </div>
                        ))}
                        {dashboardData.pendingApprovals.mission.slice(0, 2).map((request: any) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  {request.user_name} - Mission to {request.destination}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Budget: ${request.estimated_budget?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <Link href="/approvals">Review</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Admin Section */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>System Administration</CardTitle>
                    <CardDescription>Manage users, departments, and system settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button asChild className="h-auto p-6 flex-col gap-3">
                        <Link href="/admin">
                          <Settings className="w-8 h-8" />
                          <span className="text-lg font-medium">Admin Portal</span>
                          <span className="text-sm text-muted-foreground">
                            Access system and department administration
                          </span>
                        </Link>
                      </Button>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Departments</span>
                          </div>
                          <Badge variant="secondary">{dashboardData.systemStats.totalDepartments}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">Pending Requests</span>
                          </div>
                          <Badge variant="destructive">{dashboardData.systemStats.pendingRequests}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Total Requests</span>
                          </div>
                          <Badge variant="secondary">{dashboardData.systemStats.totalRequests}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest requests and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.userRequests.leave.length === 0 && dashboardData.userRequests.mission.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Your requests and approvals will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Combine and show recent requests (5 total) */}
                      {[...dashboardData.userRequests.leave, ...dashboardData.userRequests.mission]
                        .slice(0, 5)
                        .map((request: any) => (
                        <div key={`${request.destination ? 'mission' : 'leave'}-${request.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {request.destination ? (
                              <MapPin className="w-4 h-4 text-green-600" />
                            ) : (
                              <Calendar className="w-4 h-4 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {request.destination ? `Mission to ${request.destination}` : getLeaveTypeLabel(request.type)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(request.start_date || request.startDate) && (request.end_date || request.endDate)
                                  ? `${new Date(request.start_date || request.startDate).toLocaleDateString()} - ${new Date(request.end_date || request.endDate).toLocaleDateString()}`
                                  : (request.start_date || request.startDate)
                                    ? new Date(request.start_date || request.startDate).toLocaleDateString()
                                    : 'Date not set'
                                }
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="flex items-center gap-1"
                          >
                            {request.status === "approved" && <CheckCircle className="w-3 h-3" />}
                            {request.status === "rejected" && <XCircle className="w-3 h-3" />}
                            {request.status === "pending" && <Clock className="w-3 h-3" />}
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                      <div className="text-center pt-2">
                        <Button variant="outline" asChild>
                          <Link href="/requests/status">View All Requests</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Health for Admin */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Overview of system activity and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Request Processing</span>
                          <span>
                            {Math.round(
                              ((dashboardData.systemStats.totalRequests - dashboardData.systemStats.pendingRequests) /
                                Math.max(dashboardData.systemStats.totalRequests, 1)) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            ((dashboardData.systemStats.totalRequests - dashboardData.systemStats.pendingRequests) /
                              Math.max(dashboardData.systemStats.totalRequests, 1)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.systemStats.totalRequests - dashboardData.systemStats.pendingRequests}
                          </p>
                          <p className="text-xs text-muted-foreground">Processed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {dashboardData.systemStats.pendingRequests}
                          </p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}