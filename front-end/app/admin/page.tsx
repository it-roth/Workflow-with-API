"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Workflow, FileText, ArrowRight, Shield, Building } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
// Types for API data
interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}
interface Department {
  id: string
  name: string
}
interface Request {
  id: string
  status: string
  department: string
  type: string
  employeeName?: string
}

export default function AdminRoleSelectionPage() {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState<"system" | "department" | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaveRequests, setLeaveRequests] = useState<Request[]>([])
  const [missionRequests, setMissionRequests] = useState<Request[]>([])

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data))
    api.get("/departments").then(res => setDepartments(res.data))
    api.get("/leave-requests").then(res => setLeaveRequests(res.data))
    api.get("/mission-requests").then(res => setMissionRequests(res.data))
  }, [])

  const pendingRequests = [...leaveRequests, ...missionRequests].filter((req) => req.status === "pending")
  const userDepartmentRequests = pendingRequests.filter((req) => req.department === user?.department)

  if (selectedRole === "system") {
    return (
      <ProtectedRoute allowedRoles={["system_admin"]}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
              ← Back to Role Selection
            </Button>
            <h1 className="text-3xl font-bold">System Administrator Dashboard</h1>
            <p className="text-muted-foreground">Complete system administration workflow</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Administration Workflow
                </CardTitle>
                <CardDescription>Follow the complete admin process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/admin/users">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium">1. Create Users</h3>
                        <p className="text-sm text-muted-foreground">Add new user accounts</p>
                        <Badge variant="secondary" className="mt-2">
                          {users.length} users
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/users">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Settings className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">2. Assign Roles</h3>
                        <p className="text-sm text-muted-foreground">Set user permissions</p>
                        <Badge variant="secondary" className="mt-2">
                          Role Management
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/departments">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Building className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-medium">3. Assign Departments</h3>
                        <p className="text-sm text-muted-foreground">Organize users by department</p>
                        <Badge variant="secondary" className="mt-2">
                          {departments.length} departments
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/departments">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Workflow className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <h3 className="font-medium">4. Configure Workflows</h3>
                        <p className="text-sm text-muted-foreground">Set approval processes</p>
                        <Badge variant="secondary" className="mt-2">
                          Workflow Setup
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <Badge>{users.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Departments:</span>
                      <Badge>{departments.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Requests:</span>
                      <Badge variant="destructive">{pendingRequests.length}</Badge>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/admin/settings">View Details</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create, edit, and manage user accounts with role assignments
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Department Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure departments and their approval workflows
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/admin/departments">
                      <Building className="w-4 h-4 mr-2" />
                      Manage Departments
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (selectedRole === "department") {
    return (
      <ProtectedRoute allowedRoles={["department_admin", "system_admin"]}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="mb-4">
              ← Back to Role Selection
            </Button>
            <h1 className="text-3xl font-bold">Department Administrator Dashboard</h1>
            <p className="text-muted-foreground">Manage workflows and requests for your department</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Workflow Management
                </CardTitle>
                <CardDescription>Create and configure approval workflows for your department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Link href="/admin/workflow/create">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Workflow className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium">1. Create Workflow</h3>
                        <p className="text-sm text-muted-foreground">Design approval process</p>
                        <Badge variant="secondary" className="mt-2">
                          Setup
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/workflow/configure">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Settings className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">2. Configure Steps</h3>
                        <p className="text-sm text-muted-foreground">Set approval sequence</p>
                        <Badge variant="secondary" className="mt-2">
                          Configure
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/workflow/deploy">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <ArrowRight className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-medium">3. Deploy Workflow</h3>
                        <p className="text-sm text-muted-foreground">Activate for department</p>
                        <Badge variant="secondary" className="mt-2">
                          Deploy
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/workflow/apply">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <h3 className="font-medium">4. Apply Requests</h3>
                        <p className="text-sm text-muted-foreground">Submit for department</p>
                        <Badge variant="secondary" className="mt-2">
                          Apply
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Request Management
                </CardTitle>
                <CardDescription>Review and process pending requests</CardDescription>
              </CardHeader>
              <CardContent>
                {userDepartmentRequests.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Pending Requests Available</h3>
                        <p className="text-sm text-muted-foreground">
                          {userDepartmentRequests.length} requests waiting for your review
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/approvals">
                          View Pending Requests
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {userDepartmentRequests.slice(0, 4).map((request) => (
                        <Card key={request.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{request.type} Request</h4>
                              <Badge variant="secondary">{request.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">From: {request.employeeName}</p>
                            <p className="text-sm text-muted-foreground">Department: {request.department}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">No Pending Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      All requests for your department have been processed
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/approvals">View All Requests</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Department Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <Badge>{user?.department}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Requests:</span>
                      <Badge variant="destructive">{userDepartmentRequests.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Role:</span>
                      <Badge variant="outline">{user?.role.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild className="w-full" variant="default">
                      <Link href="/admin/departments">Manage Workflows</Link>
                    </Button>
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href="/approvals">Review Requests</Link>
                    </Button>
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href="/admin/department-users">Manage Users</Link>
                    </Button>
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href="/requests/leave">Submit Department Request</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Department workflows are configured and active</p>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Workflows Active
                  </Badge>
                  <Button asChild className="w-full mt-2 bg-transparent" variant="outline" size="sm">
                    <Link href="/admin/departments">Configure Workflows</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["system_admin", "department_admin"]}>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Select your administrative role to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500"
              onClick={() => setSelectedRole("system")}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>System Administrator</CardTitle>
                <CardDescription>Complete system management and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Create and manage user accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Assign roles and permissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Organize users by departments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Configure approval workflows</span>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Continue as System Admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500"
              onClick={() => setSelectedRole("department")}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Department Administrator</CardTitle>
                <CardDescription>Manage requests and approvals for your department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Review pending requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Approve or reject submissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Manage department workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Send approval notifications</span>
                  </div>
                </div>
                <div className="mt-4">
                  {userDepartmentRequests.length > 0 && (
                    <Badge variant="destructive" className="mb-2">
                      {userDepartmentRequests.length} pending requests
                    </Badge>
                  )}
                  <Button className="w-full bg-transparent" variant="outline">
                    Continue as Department Admin
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">← Back to Main Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
