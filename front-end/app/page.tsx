"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAccessPortal = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">Employee Portal</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Submit leave requests, mission requests, and track your submissions with real-time status updates
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-blue-100">Instant request submission</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-blue-100">Real-time approval tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-blue-100">Mobile-optimized interface</span>
            </div>
          </div>

          {/* Access Button */}
          <Button
            onClick={handleAccessPortal}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Access Employee Portal
          </Button>
        </div>
      </Card>
    </div>
  )
}
