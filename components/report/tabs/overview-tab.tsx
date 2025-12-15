// components/report/tabs/overview-tab.tsx
// 🔧 FIX 1: add explicit prototype disclaimer (no real analytics claim)

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Network,
  Activity,
} from "lucide-react";

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* ⚠️ Prototype Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Prototype Notice:</strong> All metrics, patterns, and indicators
        shown below are placeholder examples for illustration only and do not
        represent real analytics.
      </div>

      {/* Critical Fraud Indicators */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-900">
              Critical Fraud Indicators
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Example high-risk patterns (prototype only)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4 bg-white">
            <p className="text-sm text-muted-foreground mb-1">
              Suspicious Review Rate
            </p>
            <p className="text-3xl font-bold text-red-600">100%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Example placeholder value
            </p>
          </Card>
          <Card className="p-4 bg-white">
            <p className="text-sm text-muted-foreground mb-1">
              Pod Members Identified
            </p>
            <p className="text-3xl font-bold text-red-600">87/87</p>
            <p className="text-xs text-muted-foreground mt-1">
              Example placeholder value
            </p>
          </Card>
        </div>
      </div>

      {/* AI Fraud Risk Assessment */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">
            AI Fraud Risk Assessment (Prototype)
          </h3>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            Example
          </Badge>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          This narrative is a sample AI-generated explanation used for demo
          purposes only. In production, this summary will be generated from
          verified backend metrics and deterministic fraud rules.
        </p>

        <div className="space-y-4">
          <h4 className="font-semibold text-base">Sample Findings:</h4>

          <div className="space-y-3">
            <ExampleItem icon={TrendingUp} title="Unnatural Review Velocity" />
            <ExampleItem icon={Users} title="Interconnected Reviewer Network" />
            <ExampleItem icon={Calendar} title="Coordinated Timing Patterns" />
            <ExampleItem icon={Target} title="Uniform Rating Distribution" />
            <ExampleItem icon={Network} title="Geographic Clustering" />
            <ExampleItem icon={Activity} title="Account Creation Patterns" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ExampleItem({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
      <Icon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Placeholder description for prototype demonstration
        </p>
      </div>
    </div>
  );
}
