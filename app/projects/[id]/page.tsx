"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { ReportHeader } from "@/components/report/report-header"
import { MetricsRow } from "@/components/report/metrics-row"
import { ReportTabs } from "@/components/report/report-tabs"
import { BusinessLocationMap } from "@/components/report/business-location-map"
import { projects } from "@/data/projects"

export default function ProjectReportPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const projectId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const project = projects.find((p) => p.id === projectId) || projects[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <ReportHeader project={project} />
        <div className="mt-6">
          <BusinessLocationMap
            businessName={project.business}
            address={project.address}
            phone={project.phone}
            rating={project.rating}
          />
        </div>
        <div className="mt-6">
          <MetricsRow />
        </div>
        <div className="mt-6">
          <ReportTabs />
        </div>
      </main>
    </div>
  )
}
