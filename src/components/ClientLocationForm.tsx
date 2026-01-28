import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { ClientFormValues } from "utils/clientFormSchema";

export const ClientLocationForm = () => {
  const { register, setValue, watch } = useFormContext<ClientFormValues>();
  const [isLocating, setIsLocating] = useState(false);

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser does not support geolocation.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        toast.success("Location captured", {
          description: "Current location set for this client.",
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location error", {
          description: "Failed to get your location. Please ensure you've granted permission.",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    setValue("latitude", null);
    setValue("longitude", null);
  };

  return (
    <div className="space-y-2">
      <Label>Job Site Location (for arrival detection)</Label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </div>
          <Input 
            readOnly 
            placeholder="No location set" 
            value={latitude && longitude ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : ""} 
            className="pl-9 bg-muted"
          />
        </div>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleGetLocation}
          disabled={isLocating}
          title="Use Current Location"
        >
          {isLocating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {latitude && longitude && (
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <Label htmlFor="radius" className="text-xs text-muted-foreground">Detection Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              min="10"
              max="5000"
              {...register("radius")}
              className="h-8 text-sm"
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-destructive h-8 mt-5"
            onClick={clearLocation}
          >
            Clear Location
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Click the crosshair button when you are at the job site to save the location.
      </p>
    </div>
  );
};
