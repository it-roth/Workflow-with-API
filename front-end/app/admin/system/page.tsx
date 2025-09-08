'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Building2, Plus, Edit, Trash2, UserPlus, Settings } from 'lucide-react'
import { api } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
}

interface Department {
  id: number
  name: string
  leave_workflow: string[]
  mission_workflow: string[]
}

export default function SystemAdminPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateDepartment, setShowCreateDepartment] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  })

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    leave_workflow: ['team_leader', 'hr_manager'],
    mission_workflow: ['team_leader', 'cfo', 'hr_manager', 'ceo']
  })

  const availableRoles = [
    'employee',
    'team_leader', 
    'hr_manager',
    'cfo',
    'ceo',
    'department_admin',
    'system_admin'
  ]

  const workflowRoles = ['team_leader', 'hr_manager', 'cfo', 'ceo']

  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'system_admin') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [user, router, authLoading])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      const [usersResponse, departmentsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/departments')
      ])

      setUsers(usersResponse.data || [])
      // Remove duplicates by name and id
      const uniqueDepartments = (departmentsResponse.data || []).reduce((acc: Department[], dept: Department) => {
        const exists = acc.find(d => d.id === dept.id || d.name === dept.name)
        if (!exists) {
          acc.push(dept)
        }
        return acc
      }, [])
      setDepartments(uniqueDepartments)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/users', newUser)
      setUsers([...users, response.data])
      setNewUser({ name: '', email: '', password: '', role: '', department: '' })
      setShowCreateUser(false)
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const response = await api.put(`/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department
      })
      
      setUsers(users.map(u => u.id === editingUser.id ? response.data : u))
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/departments', newDepartment)
      setDepartments([...departments, response.data])
      setNewDepartment({
        name: '',
        leave_workflow: ['team_leader', 'hr_manager'],
        mission_workflow: ['team_leader', 'cfo', 'hr_manager', 'ceo']
      })
      setShowCreateDepartment(false)
    } catch (error) {
      console.error('Error creating department:', error)
    }
  }

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return

    try {
      const updateData = {
        name: editingDepartment.name
      }
      const response = await api.put(`/departments/${editingDepartment.id}`, updateData)
      setDepartments(departments.map(d => d.id === editingDepartment.id ? response.data : d))
      setEditingDepartment(null)
    } catch (error) {
      console.error('Error updating department:', error)
    }
  }


  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getDepartmentStats = () => {
    if (!departments || !users) return []
    
    // Get unique departments from both departments table and user departments
    const uniqueDepartments = new Set([
      ...departments.map(d => d.name),
      ...users.map(u => u.department)
    ])
    
    const stats = Array.from(uniqueDepartments).map(deptName => ({
      name: deptName,
      userCount: users.filter(u => u.department === deptName).length
    })).filter(stat => stat.userCount > 0) // Only show departments with users
    
    return stats
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system admin panel...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Manage users, departments, and system settings</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                SYSTEM ADMIN
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">System-wide users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role.includes('admin')).length}
              </div>
              <p className="text-xs text-muted-foreground">System & dept admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length * 2}</div>
              <p className="text-xs text-muted-foreground">Total workflows</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="departments">Department Management</TabsTrigger>
            <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Create and manage system users with roles</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Badge variant="outline">{user.role.replace('_', ' ')}</Badge>
                          <Badge variant="secondary">{user.department}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      Department Management
                    </h2>
                    <p className="text-gray-600 mt-1">Configure departments and their approval workflows</p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateDepartment(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </div>

              {/* Departments Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {departments.filter(dept => dept.name !== 'Admin').map(dept => (
                  <Card key={dept.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-900">{dept.name}</CardTitle>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {users.filter(u => u.department === dept.name).length} employees
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Leave Workflow Section */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center mb-3">
                            <h4 className="font-semibold text-green-800 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Leave Approval Workflow
                            </h4>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {dept.leave_workflow.map((step, index) => (
                              <div key={index} className="flex items-center">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                                  {index + 1}. {step.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {index < dept.leave_workflow.length - 1 && (
                                  <div className="w-4 h-0.5 bg-green-300 mx-1"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mission Workflow Section */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center mb-3">
                            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Mission Approval Workflow
                            </h4>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {dept.mission_workflow.map((step, index) => (
                              <div key={index} className="flex items-center">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
                                  {index + 1}. {step.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {index < dept.mission_workflow.length - 1 && (
                                  <div className="w-4 h-0.5 bg-purple-300 mx-1"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {departments.length === 0 && (
                <Card className="p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Departments Found</h3>
                  <p className="text-gray-500 mb-4">Create your first department to get started</p>
                  <Button onClick={() => setShowCreateDepartment(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Department
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>User Department Assignments</CardTitle>
                <CardDescription>View and manage user-department allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getDepartmentStats().map((stat, index) => (
                    <div key={`${stat.name}-${index}`} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">{stat.name} Department</h3>
                      <p className="text-sm text-gray-600 mb-4">{stat.userCount} users assigned</p>
                      
                      <div className="space-y-2">
                        {users
                          .filter(u => u.department === stat.name)
                          .map((user, userIndex) => (
                            <div key={`${user.id}-${userIndex}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{user.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {user.role.replace('_', ' ')}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingUser(user)}
                              >
                                Reassign
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system with specified role</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and department assignment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select value={editingUser.department} onValueChange={(value) => setEditingUser({...editingUser, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Department Dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Update department information</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateDepartment()
            }} className="space-y-4">
              <div>
                <Label htmlFor="edit-dept-name">Department Name</Label>
                <Input
                  id="edit-dept-name"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingDepartment(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Department</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Department Dialog */}
      <Dialog open={showCreateDepartment} onOpenChange={setShowCreateDepartment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>Add a new department with default workflows</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDepartment} className="space-y-4">
            <div>
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDepartment(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Department</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
