"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, ArrowLeft, CheckCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

export default function MissionRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    destination: "",
    purpose: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    transportationMode: "",
    accommodationNeeded: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      await api.post("/mission-requests", {
        user_id: user.id,
        user_name: user.name,
        user_department: user.department,
        destination: formData.destination,
        purpose: formData.purpose,
        start_date: formData.startDate,
        end_date: formData.endDate,
        estimated_budget: Number.parseFloat(formData.estimatedBudget) || 0,
        transportation_mode: formData.transportationMode,
        accommodation_needed: formData.accommodationNeeded,
        status: "pending",
      } as any)
      setSubmitted(true)
      setTimeout(() => {
        router.push("/requests/status")
      }, 2000)
    } catch (error) {
      console.error("Error submitting mission request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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
                Your mission request has been submitted successfully and is now pending approval.
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container max-w-2xl p-6">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Request Mission</h1>
            <p className="text-muted-foreground">Submit a new mission request for approval</p>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mission Request Form
                </CardTitle>
                <CardDescription>
                  Fill out the details for your mission request. It will be routed through your department's approval
                  workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => handleInputChange("destination", e.target.value)}
                        placeholder="City, Country"
                        required
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={user?.department || ""} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose of Mission</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange("purpose", e.target.value)}
                      placeholder="Describe the business purpose and objectives of this mission..."
                      rows={3}
                      required
                    />
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Estimated Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.estimatedBudget}
                        onChange={(e) => handleInputChange("estimatedBudget", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="transportation">Transportation Mode</Label>
                      <Select
                        value={formData.transportationMode}
                        onValueChange={(value) => handleInputChange("transportationMode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transportation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight">Flight</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodation"
                      checked={formData.accommodationNeeded}
                      onCheckedChange={(checked) => handleInputChange("accommodationNeeded", checked as boolean)}
                    />
                    <Label htmlFor="accommodation">Accommodation needed</Label>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Your request will be sent to your department's approval workflow:
                      {user?.department === "IT" && " Team Leader → CEO"}
                      {user?.department === "Sales" && " Team Leader → CFO → HR Manager → CEO"}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Submitting..." : "Submit Mission Request"}
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
