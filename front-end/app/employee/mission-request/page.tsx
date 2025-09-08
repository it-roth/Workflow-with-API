"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MissionRequestPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    alert("Mission request submitted successfully!")
    router.push("/employee/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mission Request</h1>
            <p className="text-gray-600">Submit your business travel request</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mission Details
            </CardTitle>
            <CardDescription>Fill out the form below to submit your mission request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="Enter destination city/location" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input id="departureDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input id="returnDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="missionType">Mission Type</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client-meeting">Client Meeting</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="field-work">Field Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Please describe the purpose and objectives of this mission"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input id="estimatedCost" type="number" placeholder="Enter estimated cost" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
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
