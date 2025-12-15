// components/report/report-tabs.tsx

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "./tabs/overview-tab";
import { ReviewsTab } from "./tabs/reviews-tab";
import { ReviewersTab } from "./tabs/reviewers-tab";
import { PodsTab } from "./tabs/pods-tab";

export function ReportTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews (1000)</TabsTrigger>
          <TabsTrigger value="reviewers">Reviewers (87)</TabsTrigger>
          <TabsTrigger value="pods">Pods (31)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>

        <TabsContent value="reviewers">
          <ReviewersTab />
        </TabsContent>

        <TabsContent value="pods">
          <PodsTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
