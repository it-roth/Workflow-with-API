'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings, Users, FileText, Plus, Edit, Save, X } from 'lucide-react'
import { api } from '@/lib/api'

interface Department {
  id: number
  name: string
  leave_workflow: string[]
  mission_workflow: string[]
}

interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
}

export default function DepartmentAdminPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([])
  const [editingWorkflow, setEditingWorkflow] = useState<{ type: 'leave' | 'mission', deptId: number } | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState({ leave: [], mission: [] })

  const availableRoles = ['team_leader', 'hr_manager', 'cfo', 'ceo']

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'department_admin') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [user, router, authLoading])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch departments
      const deptResponse = await api.get('/departments')
      const allDepartments = deptResponse.data || []
      
      // Filter to user's department only
      const userDepartments = allDepartments.filter((dept: Department) => dept.name === user?.department)
      setDepartments(userDepartments)

      // Fetch users in department
      const usersResponse = await api.get('/users')
      const allUsers = usersResponse.data || []
      const deptUsers = allUsers.filter((u: User) => u.department === user?.department)
      setDepartmentUsers(deptUsers)

      // Fetch pending requests for department
      const approvalsResponse = await api.get('/pending-approvals')
      if (approvalsResponse.data) {
        setPendingRequests(approvalsResponse.data)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditWorkflow = (type: 'leave' | 'mission', deptId: number) => {
    const dept = departments.find(d => d.id === deptId)
    if (dept) {
      setWorkflowSteps(type === 'leave' ? dept.leave_workflow : dept.mission_workflow)
      setEditingWorkflow({ type, deptId })
    }
  }

  const handleSaveWorkflow = async () => {
    if (!editingWorkflow) return

    try {
      const dept = departments.find(d => d.id === editingWorkflow.deptId)
      if (!dept) return

      const updatedWorkflow = {
        ...dept,
        [editingWorkflow.type === 'leave' ? 'leave_workflow' : 'mission_workflow']: workflowSteps
      }

      await api.put(`/departments/${editingWorkflow.deptId}`, updatedWorkflow)
      
      // Update local state
      setDepartments(prev => prev.map(d => 
        d.id === editingWorkflow.deptId ? updatedWorkflow : d
      ))
      
      setEditingWorkflow(null)
      setWorkflowSteps([])
    } catch (error) {
      console.error('Error saving workflow:', error)
    }
  }

  const addWorkflowStep = (role: string) => {
    if (!workflowSteps.includes(role)) {
      setWorkflowSteps([...workflowSteps, role])
    }
  }

  const removeWorkflowStep = (index: number) => {
    setWorkflowSteps(workflowSteps.filter((_, i) => i !== index))
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading department admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Admin Panel</h1>
              <p className="text-gray-600">Managing {user?.department} Department</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Settings className="w-4 h-4 mr-1" />
                {user?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Overview Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentUsers.length}</div>
                <p className="text-xs text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <FileText className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingRequests.leave.length + pendingRequests.mission.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingRequests.leave.length} leave, {pendingRequests.mission.length} mission
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length * 2}</div>
                <p className="text-xs text-muted-foreground">Leave & Mission workflows</p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Management */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <CardDescription>Configure approval workflows for your department</CardDescription>
            </CardHeader>
            <CardContent>
              {departments.map(dept => (
                <div key={dept.id} className="space-y-4">
                  <h3 className="text-lg font-semibold">{dept.name} Department</h3>
                  
                  {/* Leave Workflow */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Leave Request Workflow</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditWorkflow('leave', dept.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {dept.leave_workflow.map((step, index) => (
                        <Badge key={index} variant="secondary">
                          {index + 1}. {step.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Mission Workflow */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Mission Request Workflow</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditWorkflow('mission', dept.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {dept.mission_workflow.map((step, index) => (
                        <Badge key={index} variant="secondary">
                          {index + 1}. {step.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Users */}
          <Card>
            <CardHeader>
              <CardTitle>Department Users</CardTitle>
              <CardDescription>Users in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="outline">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Edit Dialog */}
      {editingWorkflow && (
        <Dialog open={!!editingWorkflow} onOpenChange={() => setEditingWorkflow(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Edit {editingWorkflow.type} Workflow
              </DialogTitle>
              <DialogDescription>
                Configure the approval steps for {editingWorkflow.type} requests
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Current Workflow Steps</Label>
                <div className="space-y-2 mt-2">
                  {workflowSteps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{index + 1}. {step.replace('_', ' ')}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWorkflowStep(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Add Approval Step</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableRoles.map(role => (
                    <Button
                      key={role}
                      size="sm"
                      variant="outline"
                      onClick={() => addWorkflowStep(role)}
                      disabled={workflowSteps.includes(role)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {role.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingWorkflow(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveWorkflow}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
