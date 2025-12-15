// components/report/tabs/overview-tab.tsx

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
      {/* Critical Fraud Indicators */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-900">
              Critical Fraud Indicators
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Multiple high-risk patterns detected requiring immediate attention
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
              All reviewers flagged as suspicious
            </p>
          </Card>
          <Card className="p-4 bg-white">
            <p className="text-sm text-muted-foreground mb-1">
              Pod Members Identified
            </p>
            <p className="text-3xl font-bold text-red-600">87/87</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete fraud network detected
            </p>
          </Card>
        </div>
      </div>

      {/* AI Fraud Risk Assessment */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Fraud Risk Assessment</h3>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            High Risk
          </Badge>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Our advanced AI analysis has identified multiple critical indicators
          of coordinated review manipulation. This business shows patterns
          highly consistent with organized fraud networks operating across
          multiple establishments in the Chicago metropolitan area.
        </p>

        <div className="space-y-4">
          <h4 className="font-semibold text-base">Key Findings:</h4>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Unnatural Review Velocity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  1,000 reviews posted in 3 months - 450% above industry average
                  for similar businesses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Interconnected Reviewer Network</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All 87 reviewers participate in reviewing 31 shared
                  businesses, indicating organized coordination
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Coordinated Timing Patterns</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Reviews posted in synchronized clusters across multiple
                  businesses within 24-48 hour windows
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Uniform Rating Distribution</p>
                <p className="text-sm text-muted-foreground mt-1">
                  98% of reviews are 5-star ratings with suspiciously similar
                  language patterns and structure
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Network className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Geographic Clustering</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All reviewers share overlapping IP address patterns and device
                  fingerprints
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account Creation Patterns</p>
                <p className="text-sm text-muted-foreground mt-1">
                  72% of reviewer accounts created within same 2-week period in
                  January 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          Recommended Actions
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">Report to Google:</strong>{" "}
              Export comprehensive evidence package and submit to Google
              Business Review team for investigation
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">Monitor Activity:</strong> Set
              up automated alerts for new reviews from identified pod members
              across all connected businesses
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">Industry Analysis:</strong>{" "}
              Cross-reference patterns with other businesses in your industry to
              identify broader fraud networks
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">Legal Documentation:</strong>{" "}
              Preserve all evidence for potential legal action or regulatory
              reporting
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
