"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Edit, Plus, Users, Search, ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

// Local helper for role display
function getRoleDisplayName(role: string) {
  if (role === "employee") return "Employee"
  if (role === "team_leader") return "Team Leader"
  if (role === "hr_manager") return "HR Manager"
  if (role === "cfo") return "CFO"
  if (role === "ceo") return "CEO"
  if (role === "department_admin") return "Department Admin"
  if (role === "system_admin") return "System Admin"
  return role
}

// User type
interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  password?: string
}

// Department type
interface Department {
  id: string
  name: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    password: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
  api.get("/users").then(res => setUsers(res.data))
  api.get("/departments").then(res => setDepartments(res.data))
  }, [])

  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "team_leader", label: "Team Leader" },
    { value: "hr_manager", label: "HR Manager" },
    { value: "cfo", label: "CFO" },
    { value: "ceo", label: "CEO" },
    { value: "department_admin", label: "Department Admin" },
    { value: "system_admin", label: "System Admin" },
  ]

  const departmentOptions = departments.map((dept: Department) => ({
    value: dept.name,
    label: dept.name,
  }))

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || user.department === filterDepartment
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesDepartment && matchesRole
  })

  const handleCreateUser = async () => {
    setError("")

    if (!formData.name || !formData.email || !formData.role || !formData.department || !formData.password) {
      setError("All fields are required")
      return
    }

    // Check if email already exists
    if (users.some((user) => user.email === formData.email)) {
      setError("Email already exists")
      return
    }

    try {
      await api.post("/users", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        password: formData.password,
      })
      const res = await api.get("/users")
      setUsers(res.data)
      setFormData({ name: "", email: "", role: "", department: "", password: "" })
      setIsCreateOpen(false)
    } catch (err) {
      setError("Failed to create user")
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    setError("")

    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      setError("All fields except password are required")
      return
    }

    // Check if email already exists (excluding current user)
    if (users.some((user) => user.email === formData.email && user.id !== editingUser.id)) {
      setError("Email already exists")
      return
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      await api.put(`/users/${editingUser.id}`, updateData)
      const res = await api.get("/users")
      setUsers(res.data)
      setEditingUser(null)
      setFormData({ name: "", email: "", role: "", department: "", password: "" })
    } catch (err) {
      setError("Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await api.delete(`/users/${userId}`)
      const res = await api.get("/users")
      setUsers(res.data)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: "",
    })
    setError("")
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "", department: "", password: "" })
    setError("")
    setEditingUser(null)
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage system users and their permissions</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the system with specified role and department</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleCreateUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Manage user accounts, roles, and department assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.department}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update user information and permissions</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={formData.name}
                                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                      value={formData.role}
                                      onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {roleOptions.map((role) => (
                                          <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-department">Department</Label>
                                    <Select
                                      value={formData.department}
                                      onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departmentOptions.map((dept) => (
                                          <SelectItem key={dept.value} value={dept.value}>
                                            {dept.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="edit-password">New Password (optional)</Label>
                                  <Input
                                    id="edit-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                    placeholder="Leave blank to keep current password"
                                  />
                                </div>

                                {error && (
                                  <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                  </Alert>
                                )}

                                <Button onClick={handleUpdateUser} className="w-full">
                                  Update User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
