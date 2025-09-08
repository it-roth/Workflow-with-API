"use client"

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, CheckCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { createLeaveRequest } from "@/lib/requests"
import Link from "next/link"

export default function LeaveRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Frontend validation for dates
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert("End date must be after start date.")
      return
    }

    setIsSubmitting(true)

    try {
      await createLeaveRequest({
        user_id: user.id,
        user_name: user.name,
        user_department: user.department,
        type: formData.type as "annual" | "sick" | "personal" | "maternity" | "emergency",
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        status: "pending",
      } as any)
      setSubmitted(true)
      setTimeout(() => {
        router.push("/requests/status")
      }, 2000)
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        alert("Validation error: " + JSON.stringify(error.response.data.errors))
      } else {
        alert("Error submitting leave request. Please check your input and try again.")
      }
      console.error("Error submitting leave request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Your leave request has been submitted successfully and is now pending approval.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to status page...</p>
            </CardContent>
          </Card>
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
            <h1 className="text-3xl font-bold">Request Leave</h1>
            <p className="text-muted-foreground">Submit a new leave request for approval</p>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Leave Request Form
                </CardTitle>
                <CardDescription>
                  Fill out the details for your leave request. It will be routed through your department's approval
                  workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Leave Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">Annual Leave</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Leave</SelectItem>
                          <SelectItem value="maternity">Maternity Leave</SelectItem>
                          <SelectItem value="emergency">Emergency Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={user?.department || ""} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Leave</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      placeholder="Please provide a brief explanation for your leave request..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Submitting..." : "Submit Leave Request"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
