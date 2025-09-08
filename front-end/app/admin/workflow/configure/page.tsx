"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ConfigureWorkflowPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [workflows] = useState([
    {
      id: 1,
      name: "Leave Approval Process",
      type: "leave",
      status: "draft",
      steps: [
        { role: "Team Leader", order: 1, configured: true },
        { role: "HR Manager", order: 2, configured: false },
      ],
    },
    {
      id: 2,
      name: "Mission Request Process",
      type: "mission",
      status: "draft",
      steps: [
        { role: "Team Leader", order: 1, configured: true },
        { role: "CEO", order: 2, configured: false },
      ],
    },
  ])

  const configureStep = (workflowId: number, stepIndex: number) => {
    console.log("[v0] Configuring step:", workflowId, stepIndex)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/admin?role=department")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Configure Approval Steps</CardTitle>
            <CardDescription>Set approval sequence for {user?.department} department workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {workflow.type === "leave" ? "Leave Request" : "Mission Request"} Workflow
                    </p>
                  </div>
                  <Badge variant={workflow.status === "draft" ? "secondary" : "default"}>{workflow.status}</Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Approval Steps:</h4>
                  {workflow.steps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                          {step.order}
                        </div>
                        <div>
                          <p className="font-medium">{step.role}</p>
                          <p className="text-sm text-muted-foreground">
                            Step {step.order} - {step.configured ? "Configured" : "Needs Configuration"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.configured ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                        <Button size="sm" variant="outline" onClick={() => configureStep(workflow.id, index)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => router.push("/admin?role=department&step=deploy")}
                    disabled={workflow.steps.some((step) => !step.configured)}
                  >
                    Ready to Deploy
                  </Button>
                  <Button variant="outline">Edit Workflow</Button>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={() => router.push("/admin/workflow/create")} className="w-full">
              Create New Workflow
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
