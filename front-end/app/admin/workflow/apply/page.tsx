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
import { ArrowLeft, Send, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ApplyWorkflowPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [requestType, setRequestType] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Applying workflow for employee request:", {
      requestType,
      employeeName,
      startDate,
      endDate,
      reason,
    })
    setSubmitted(true)
    setTimeout(() => {
      router.push("/admin?role=department")
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              The workflow has been applied and the request is now in the approval process.
            </p>
            <Button onClick={() => router.push("/admin?role=department")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/admin/workflow/deploy")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deploy
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply User Request</CardTitle>
            <CardDescription>Submit a request on behalf of department employees</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select value={requestType} onValueChange={setRequestType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leave">Leave Request</SelectItem>
                      <SelectItem value="mission">Mission Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Purpose</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for the request"
                  rows={4}
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Workflow Preview</h4>
                <p className="text-sm text-muted-foreground">
                  This request will follow the {user?.department} department workflow:
                  {requestType === "leave" && user?.department === "IT" && " Team Leader → HR Manager"}
                  {requestType === "mission" && user?.department === "IT" && " Team Leader → CEO"}
                  {requestType === "leave" && user?.department === "Sales" && " Team Leader → CFO → HR Manager"}
                  {requestType === "mission" && user?.department === "Sales" && " Team Leader → CFO → HR Manager → CEO"}
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
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
