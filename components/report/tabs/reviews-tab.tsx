// components/report/tabs/reviews-tab.tsx

import { Star, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { reviews } from "@/data/reviews";

export function ReviewsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Reviews (1000)</h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{review.business}</span>
                {review.isAnchor && (
                  <Badge variant="secondary" className="text-xs">
                    Anchor
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{review.text}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium">{review.reviewer}</span>
              <span>•</span>
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
