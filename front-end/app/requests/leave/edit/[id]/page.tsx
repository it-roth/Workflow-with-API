"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

export default function EditLeaveRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const requestId = params.id

  const [formData, setFormData] = useState({
    type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return
      
      try {
        const response = await api.get(`/leave-requests/${requestId}`)
        const request = response.data
        
        // Check if user owns this request and it's pending
        if (request.user_id !== user?.id || request.status !== 'pending') {
          router.push('/requests/status')
          return
        }

        setFormData({
          type: request.type,
          start_date: request.start_date,
          end_date: request.end_date,
          reason: request.reason,
        })
      } catch (error) {
        console.error('Error fetching request:', error)
        setError('Failed to load request')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [requestId, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.put(`/leave-requests/${requestId}`, formData)
      router.push('/requests/status')
    } catch (error: any) {
      console.error('Error updating request:', error)
      setError(error.response?.data?.message || 'Failed to update request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading request...</p>
              </div>
            </div>
          </div>
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
              <Link href="/requests/status">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requests
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Edit Leave Request</h1>
            <p className="text-muted-foreground">Update your leave request details</p>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Leave Request Details</CardTitle>
              <CardDescription>Update the information for your leave request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Leave Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {submitting ? "Updating..." : "Update Request"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/requests/status">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
