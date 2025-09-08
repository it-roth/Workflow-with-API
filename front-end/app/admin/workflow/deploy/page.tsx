"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Rocket, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DeployWorkflowPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Leave Approval Process",
      type: "leave",
      status: "ready",
      active: false,
      steps: ["Team Leader", "HR Manager"],
    },
    {
      id: 2,
      name: "Mission Request Process",
      type: "mission",
      status: "ready",
      active: false,
      steps: ["Team Leader", "CEO"],
    },
  ])

  const toggleWorkflow = (id: number) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, active: !w.active, status: !w.active ? "active" : "ready" } : w)),
    )
  }

  const deployAll = () => {
    console.log("[v0] Deploying all workflows")
    setWorkflows(workflows.map((w) => ({ ...w, active: true, status: "active" })))
    router.push("/admin?role=department&step=apply")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/admin/workflow/configure")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Configure
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Deploy Workflows</CardTitle>
            <CardDescription>Activate workflows for {user?.department} department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.steps.join(" → ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={workflow.active ? "default" : "secondary"}>
                      {workflow.active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch checked={workflow.active} onCheckedChange={() => toggleWorkflow(workflow.id)} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {workflow.status === "ready" ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Ready to deploy</span>
                    </>
                  ) : workflow.status === "active" ? (
                    <>
                      <Rocket className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600">Currently active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600">Needs configuration</span>
                    </>
                  )}
                </div>
              </Card>
            ))}

            <div className="flex gap-4 pt-6">
              <Button onClick={deployAll} className="flex-1">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy All Workflows
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin?role=department&step=apply")}>
                Continue to Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
