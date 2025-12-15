"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical } from "lucide-react"
import { NewProjectModal } from "./new-project-modal"
import { useRouter } from "next/navigation"
import { projects as initialProjects } from "@/data/projects"

export function ProjectsTable() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState(initialProjects)

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects])
  }

  const getStatusBadge = (status: string) => {
    if (status === "Completed") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Start New Project
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-sm">Project Name</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Business</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Last Scan</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Total Reviews</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <td className="py-4 px-6 font-medium">{project.name}</td>
                  <td className="py-4 px-6 text-muted-foreground">{project.business}</td>
                  <td className="py-4 px-6">{getStatusBadge(project.status)}</td>
                  <td className="py-4 px-6 text-muted-foreground">{project.lastScan}</td>
                  <td className="py-4 px-6 font-medium">{project.totalReviews.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
