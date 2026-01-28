import { createContext, useContext, useEffect, useState, useRef } from "react";
import brain from "brain";
import { ClientResponse } from "types";
import { toast } from "sonner";
import { useCurrentUser } from "app";

const CHECK_INTERVAL = 60000; // Check every minute
const PROMPT_COOLDOWN = 3600000; // 1 hour cooldown per client
const CHECK_COOLDOWN = 60000; // 1 minute cooldown for API checks

interface ClientWithDistance extends ClientResponse {
  distance?: number;
}

interface GeolocationContextType {
  latitude: number | null;
  longitude: number | null;
  nearbyClients: ClientWithDistance[];
  isLocating: boolean;
  permissionStatus: PermissionState | null;
}

const GeolocationContext = createContext<GeolocationContextType>({
  latitude: null,
  longitude: null,
  nearbyClients: [],
  isLocating: false,
  permissionStatus: null,
});

export const useGeolocation = () => useContext(GeolocationContext);

interface Props {
  children: React.ReactNode;
}

export const GeolocationProvider = ({ children }: Props) => {
  const { user } = useCurrentUser();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [nearbyClients, setNearbyClients] = useState<ClientWithDistance[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  
  const lastPromptRef = useRef<Record<number, number>>({});
  const lastCheckRef = useRef<Record<number, number>>({});
  const checkingRef = useRef<Record<number, boolean>>({});
  
  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user?.uid]);

  // Periodically refresh clients to get updated locations
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadClients, 300000); // Refresh clients every 5 mins
    return () => clearInterval(interval);
  }, [user?.uid]);

  const loadClients = async () => {
    try {
      const response = await brain.list_clients();
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to load clients for geolocation:", error);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  useEffect(() => {
    if (!user) return;
    if (!navigator.geolocation) return;

    setIsLocating(true);

    // Check permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      });
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        setIsLocating(false);
        
        if (clients.length === 0) return;

        const nearby: ClientWithDistance[] = [];

        clients.forEach(client => {
          // @ts-ignore: Types might not be updated in frontend yet
          if (client.latitude && client.longitude) {
            // @ts-ignore
            const clientLat = client.latitude;
            // @ts-ignore
            const clientLon = client.longitude;
            // @ts-ignore
            const radius = client.radius || 200;

            const distance = getDistance(lat, lon, clientLat, clientLon);

            if (distance <= radius) {
              nearby.push({ ...client, distance });

              // @ts-ignore
              const lastPrompt = lastPromptRef.current[client.id] || 0;
              const now = Date.now();

              if (now - lastPrompt > PROMPT_COOLDOWN) {
                // @ts-ignore
                lastPromptRef.current[client.id] = now;
                checkActiveSessionAndPrompt(client);
              }
            }
          }
        });

        setNearbyClients(nearby);
      },
      (error) => {
        if (error.code !== error.PERMISSION_DENIED) {
          console.error("Geolocation watch error:", error);
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, clients]);

  const checkActiveSessionAndPrompt = async (client: ClientResponse) => {
    try {
      const res = await brain.get_active_sessions();
      const activeSessions = await res.json();
      
      // If no active session or active session is for a different client
      const hasActiveSessionForClient = activeSessions.some((s: any) => s.client_id === client.id);
      
      if (!hasActiveSessionForClient) {
        toast.info(`Arrived at ${client.name}`, {
          description: "Would you like to start a work session?",
          action: {
            label: "Start Session",
            onClick: () => startSession(client)
          },
          duration: 10000, // Show for 10 seconds
        });
      }
    } catch (e) {
      console.error("Failed to check active sessions:", e);
    }
  };

  const startSession = async (client: ClientResponse) => {
    try {
        await brain.start_session({ client_id: client.id });
        toast.success("Session started", {
            description: `Tracking time for ${client.name}`
        });
        // We could refresh context here if we exposed it
    } catch (e) {
        toast.error("Failed to start session");
    }
  };

  return (
    <GeolocationContext.Provider value={{ latitude, longitude, nearbyClients, isLocating, permissionStatus }}>
      {children}
    </GeolocationContext.Provider>
  );
};
