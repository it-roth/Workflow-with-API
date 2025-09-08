"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Database, Shield, Bell } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

// Add types for API data
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
  workflows: {
    leave: string[]
    mission: string[]
  }
}
interface LeaveRequest {
  id: string
  status: string
  department: string
  // ...other fields as needed
}
interface MissionRequest {
  id: string
  status: string
  department: string
  // ...other fields as needed
}

export default function SystemSettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>([])

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data))
    api.get("/departments").then(res => setDepartments(res.data))
    api.get("/leave-requests").then(res => setLeaveRequests(res.data))
    api.get("/mission-requests").then(res => setMissionRequests(res.data))
  }, [])

  const systemStats = {
    totalUsers: users.length,
    totalDepartments: departments.length,
    totalRequests: leaveRequests.length + missionRequests.length,
    pendingRequests: [...leaveRequests, ...missionRequests].filter((req) => req.status === "pending").length,
    approvedRequests: [...leaveRequests, ...missionRequests].filter((req) => req.status === "approved").length,
    rejectedRequests: [...leaveRequests, ...missionRequests].filter((req) => req.status === "rejected").length,
  }

  return (
    <ProtectedRoute allowedRoles={["system_admin"]}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">System configuration and monitoring</p>
        </div>

        <div className="grid gap-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Overview
              </CardTitle>
              <CardDescription>Current system statistics and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{systemStats.totalDepartments}</p>
                  <p className="text-sm text-muted-foreground">Departments</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{systemStats.totalRequests}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{systemStats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Request Statistics</CardTitle>
              <CardDescription>Breakdown of request statuses across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Approved Requests</p>
                    <p className="text-2xl font-bold text-green-600">{systemStats.approvedRequests}</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {systemStats.totalRequests > 0
                      ? Math.round((systemStats.approvedRequests / systemStats.totalRequests) * 100)
                      : 0}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{systemStats.pendingRequests}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {systemStats.totalRequests > 0
                      ? Math.round((systemStats.pendingRequests / systemStats.totalRequests) * 100)
                      : 0}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Rejected Requests</p>
                    <p className="text-2xl font-bold text-red-600">{systemStats.rejectedRequests}</p>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    {systemStats.totalRequests > 0
                      ? Math.round((systemStats.rejectedRequests / systemStats.totalRequests) * 100)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>System security and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Role-Based Access Control</p>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Department Workflows</p>
                    <p className="text-sm text-muted-foreground">Custom approval chains</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Configured
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Authentication</p>
                    <p className="text-sm text-muted-foreground">Email/Password</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  System Features
                </CardTitle>
                <CardDescription>Available system capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Leave Request Management</p>
                    <p className="text-sm text-muted-foreground">Multiple leave types</p>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mission Request Management</p>
                    <p className="text-sm text-muted-foreground">Travel and business trips</p>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time Status Tracking</p>
                    <p className="text-sm text-muted-foreground">Live approval updates</p>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Department Configuration</CardTitle>
              <CardDescription>Current department setup and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept: Department) => {
                  const deptUsers = users.filter((user: User) => user.department === dept.name)
                  return (
                    <div key={dept.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{dept.name} Department</h4>
                        <Badge variant="outline">{deptUsers.length} users</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Leave Workflow:</p>
                          <div className="flex flex-wrap gap-1">
                            {dept.workflows.leave.map((role: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {index + 1}. {role.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Mission Workflow:</p>
                          <div className="flex flex-wrap gap-1">
                            {dept.workflows.mission.map((role: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {index + 1}. {role.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
