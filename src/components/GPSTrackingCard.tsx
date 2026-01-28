import React from "react";
import { useGeolocation } from "components/GeolocationProvider";
import { MapPin, AlertTriangle, Loader2, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Translate } from "components/Translate";

export function GPSTrackingCard() {
  const { isLocating, permissionStatus, nearbyClients } = useGeolocation();

  if (permissionStatus === 'denied') {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-medium text-destructive-foreground"><Translate>Location Awareness Disabled</Translate></h3>
              <p className="text-sm text-muted-foreground"><Translate>Enable location access in your browser settings to see nearby clients.</Translate></p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = permissionStatus === 'granted';

  return (
    <Card className={isActive ? "border-green-200 dark:border-green-900" : ""}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isActive ? 'bg-green-500/10' : 'bg-muted'}`}>
              <Navigation className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground"><Translate>Location Awareness</Translate></h3>
                {isActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <Translate>Active</Translate>
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? (nearbyClients.length > 0 
                      ? <><Translate>Near</Translate> {nearbyClients.length} <Translate>clients</Translate></>
                      : <Translate>Monitoring nearby clients...</Translate>)
                  : <Translate>Waiting for location access...</Translate>}
              </p>
            </div>
          </div>
          {isLocating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}
