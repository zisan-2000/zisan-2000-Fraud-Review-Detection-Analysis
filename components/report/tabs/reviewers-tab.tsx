// components/report/tabs/reviewers-tab.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { reviewers } from "@/data/reviewers";

export function ReviewersTab() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">All Reviewers (87)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Users who reviewed this business and show suspicious patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviewers.map((reviewer) => (
          <div
            key={reviewer.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {reviewer.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{reviewer.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  <span>{reviewer.reviewCount} reviews on Google</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
