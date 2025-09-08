"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, FileText, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmployeeDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your leave and mission requests</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/employee/leave-request")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Leave Request</CardTitle>
                  <CardDescription>Submit vacation, sick leave, or personal time off</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Request Leave</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/employee/mission-request")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mission Request</CardTitle>
                  <CardDescription>Request business travel or field assignments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Request Mission</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Requests
            </CardTitle>
            <CardDescription>Track the status of your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No requests submitted yet</p>
              <p className="text-sm">Your leave and mission requests will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
