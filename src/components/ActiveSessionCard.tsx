import { Clock, Pause, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkSessionResponse } from "types";
import { Translate } from "components/Translate";

interface Props {
  session: WorkSessionResponse;
  onStop: (id: number, name: string) => void;
  currentTime: Date;
}

export function ActiveSessionCard({ session, onStop, currentTime }: Props) {
  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const end = currentTime;
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0" />
              <CardTitle className="text-2xl break-words">{session.client_name}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Translate>Started at</Translate> {formatTime(session.start_time)}
            </CardDescription>
          </div>
          <Button
            onClick={() => onStop(session.id, session.client_name)}
            size="lg"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <Pause className="h-5 w-5 mr-2" />
            <Translate>Stop Session</Translate>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-background rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(session.start_time)}
              </div>
              <div className="text-sm text-muted-foreground"><Translate>Elapsed Time</Translate></div>
            </div>
          </div>

          {session.location_name && (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-background rounded-lg">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {session.location_name}
                </div>
                <div className="text-sm text-muted-foreground"><Translate>Location</Translate></div>
              </div>
            </div>
          )}

          {session.break_duration_minutes > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-background rounded-lg">
                <Coffee className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {session.break_duration_minutes} min
                </div>
                <div className="text-sm text-muted-foreground"><Translate>Break Time</Translate></div>
              </div>
            </div>
          )}
        </div>

        {session.notes && (
          <div className="mt-4 p-3 bg-background rounded-lg">
            <p className="text-sm text-foreground">{session.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
