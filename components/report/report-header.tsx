// components/report/report-header.tsx
// 🔧 FIX 2: clarify Rescan is future backend action

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Download, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportHeaderProps {
  project: any;
}

export function ReportHeader({ project }: ReportHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/projects")}
        className="pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{project.business}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <p>{project.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            {project.status}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            title="Triggers backend rescan in production"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rescan (Prototype)
          </Button>

          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
