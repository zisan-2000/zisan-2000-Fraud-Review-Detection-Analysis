// components/projects/new-project-modal/step-confirm-business.tsx

"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Hash } from "lucide-react";

interface StepConfirmBusinessProps {
  business: any;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirmBusiness({
  business,
  onConfirm,
  onBack,
}: StepConfirmBusinessProps) {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold">{business.name}</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">{business.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-muted-foreground">{business.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Google CID</p>
              <p className="text-muted-foreground font-mono text-xs">
                {business.cid}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Rating</p>
              <p className="text-muted-foreground">
                {business.rating} stars ({business.reviewCount} reviews)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm}>Save & Start Scan</Button>
      </div>
    </div>
  );
}
