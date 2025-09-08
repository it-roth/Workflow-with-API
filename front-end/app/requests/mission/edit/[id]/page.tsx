"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

export default function EditMissionRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const requestId = params.id

  const [formData, setFormData] = useState({
    destination: "",
    purpose: "",
    start_date: "",
    end_date: "",
    estimated_budget: "",
    transportation_mode: "",
    accommodation_needed: false,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return
      
      try {
        const response = await api.get(`/mission-requests/${requestId}`)
        const request = response.data
        
        // Check if user owns this request and it's pending
        if (request.user_id !== user?.id || request.status !== 'pending') {
          router.push('/requests/status')
          return
        }

        setFormData({
          destination: request.destination,
          purpose: request.purpose,
          start_date: request.start_date,
          end_date: request.end_date,
          estimated_budget: request.estimated_budget?.toString() || "",
          transportation_mode: request.transportation_mode,
          accommodation_needed: request.accommodation_needed || false,
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
      const submitData = {
        ...formData,
        estimated_budget: parseFloat(formData.estimated_budget),
      }
      await api.put(`/mission-requests/${requestId}`, submitData)
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
            <h1 className="text-3xl font-bold">Edit Mission Request</h1>
            <p className="text-muted-foreground">Update your mission request details</p>
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
              <CardTitle>Mission Request Details</CardTitle>
              <CardDescription>Update the information for your mission request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Enter destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_budget">Estimated Budget ($)</Label>
                    <Input
                      id="estimated_budget"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.estimated_budget}
                      onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                      required
                    />
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

                  <div className="space-y-2">
                    <Label htmlFor="transportation_mode">Transportation Mode</Label>
                    <Select value={formData.transportation_mode} onValueChange={(value) => setFormData({ ...formData, transportation_mode: value })}>
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accommodation_needed"
                        checked={formData.accommodation_needed}
                        onCheckedChange={(checked) => setFormData({ ...formData, accommodation_needed: !!checked })}
                      />
                      <Label htmlFor="accommodation_needed">Accommodation needed</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Please describe the purpose of your mission..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
