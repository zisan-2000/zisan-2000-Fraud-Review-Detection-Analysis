// components/report/tabs/pods-tab.tsx

import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { pods } from "@/data/pods";

export function PodsTab() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Review Pods (31)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Businesses with overlapping reviewers indicating potential coordinated
          activity
        </p>
      </div>

      <div className="space-y-3">
        {pods.map((pod) => {
          const mapQuery = encodeURIComponent(`${pod.name} ${pod.location}`);
          const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
          const mapDirectUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

          return (
            <div
              key={pod.id}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{pod.name}</h4>
                      {pod.isSuspicious && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Suspicious
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{pod.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="h-auto p-0 text-xs">
                            View on Map
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{pod.name}</DialogTitle>
                            <DialogDescription>
                              {pod.location}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div className="rounded-lg overflow-hidden border">
                              <iframe
                                src={mapEmbedUrl}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Map location for ${pod.name}`}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent"
                              asChild
                            >
                              <a
                                href={mapDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in Google Maps
                              </a>
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <span className="text-muted-foreground text-xs">•</span>
                      <Button variant="link" className="h-auto p-0 text-xs">
                        View reviewer names
                      </Button>
                    </div>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-sm font-semibold ${
                    pod.isSuspicious ? "bg-red-100 text-red-800" : ""
                  }`}
                >
                  {pod.commonReviewers} common
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
