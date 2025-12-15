// components/report/business-location-map.tsx

"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessLocationMapProps {
  businessName: string;
  address: string;
  phone?: string;
  rating?: number;
}

export function BusinessLocationMap({
  businessName,
  address,
  phone,
  rating,
}: BusinessLocationMapProps) {
  // Create Google Maps embed URL from business name and address
  const mapQuery = encodeURIComponent(`${businessName} ${address}`);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapDirectUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Business Location</h3>
            <p className="text-sm text-muted-foreground">Google Maps Preview</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={mapDirectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Maps
            </a>
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Address:</span>
            <p className="text-muted-foreground">{address}</p>
          </div>
          {phone && (
            <div>
              <span className="font-medium">Phone:</span>
              <p className="text-muted-foreground">{phone}</p>
            </div>
          )}
          {rating && (
            <div>
              <span className="font-medium">Rating:</span>
              <p className="text-muted-foreground">{rating} ⭐</p>
            </div>
          )}
        </div>

        <div className="rounded-lg overflow-hidden border">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map location for ${businessName}`}
          />
        </div>
      </div>
    </Card>
  );
}
