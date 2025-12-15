// components/report/metrics-row.tsx

import { Card } from "@/components/ui/card";
import { Building2, Users, MessageSquare, BarChart3 } from "lucide-react";

export function MetricsRow() {
  const metrics = [
    {
      label: "Reviews on this Business",
      value: "1,000",
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: "Other Businesses Reviewed",
      value: "31",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      label: "Total Reviewers",
      value: "87",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Avg Reviews Per Person",
      value: "11.5",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {metric.label}
              </p>
              <p className="text-3xl font-bold">{metric.value}</p>
            </div>
            <metric.icon className={`w-8 h-8 ${metric.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
