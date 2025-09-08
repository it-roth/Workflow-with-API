"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function CreateWorkflowPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [workflowName, setWorkflowName] = useState("")
  const [workflowType, setWorkflowType] = useState("")
  const [description, setDescription] = useState("")
  const [approvalSteps, setApprovalSteps] = useState([{ role: "", order: 1, required: true }])

  const addApprovalStep = () => {
    setApprovalSteps([
      ...approvalSteps,
      {
        role: "",
        order: approvalSteps.length + 1,
        required: true,
      },
    ])
  }

  const removeApprovalStep = (index: number) => {
    if (approvalSteps.length > 1) {
      setApprovalSteps(approvalSteps.filter((_, i) => i !== index))
    }
  }

  const updateApprovalStep = (index: number, field: string, value: any) => {
    const updated = [...approvalSteps]
    updated[index] = { ...updated[index], [field]: value }
    setApprovalSteps(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating workflow:", { workflowName, workflowType, description, approvalSteps })
    router.push("/admin?role=department&step=configure")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Workflow</CardTitle>
            <CardDescription>Design approval process for {user?.department} department</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workflowName">Workflow Name</Label>
                  <Input
                    id="workflowName"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g., Leave Approval Process"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workflowType">Request Type</Label>
                  <Select value={workflowType} onValueChange={setWorkflowType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leave">Leave Request</SelectItem>
                      <SelectItem value="mission">Mission Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose and scope of this workflow"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Approval Steps</Label>
                  <Button type="button" onClick={addApprovalStep} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {approvalSteps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      {approvalSteps.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeApprovalStep(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Approver Role</Label>
                        <Select value={step.role} onValueChange={(value) => updateApprovalStep(index, "role", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="team_leader">Team Leader</SelectItem>
                            <SelectItem value="hr_manager">HR Manager</SelectItem>
                            <SelectItem value="cfo">CFO</SelectItem>
                            <SelectItem value="ceo">CEO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={step.order}
                          onChange={(e) => updateApprovalStep(index, "order", Number.parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  Create Workflow
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
