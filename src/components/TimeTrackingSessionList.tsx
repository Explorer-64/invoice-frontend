import { Calendar, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkSessionResponse } from "types";
import { Translate } from "components/Translate";

interface Props {
  sessions: WorkSessionResponse[];
  onEdit: (session: WorkSessionResponse) => void;
  onDelete: (session: WorkSessionResponse) => void;
}

export function TimeTrackingSessionList({ sessions, onEdit, onDelete }: Props) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground"><Translate>Recent Sessions</Translate></h2>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground"><Translate>No sessions yet. Start your first session!</Translate></p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{session.client_name}</h3>
                      {session.end_time ? (
                        <Badge variant="secondary"><Translate>Completed</Translate></Badge>
                      ) : (
                        <Badge className="bg-green-500"><Translate>Active</Translate></Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.start_time)}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(session.start_time)}
                        {session.end_time && ` - ${formatTime(session.end_time)}`}
                      </div>

                      {session.location_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {session.location_name}
                        </div>
                      )}

                      {session.billable_duration_minutes !== null && (
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Clock className="h-4 w-4" />
                          {Math.floor(session.billable_duration_minutes / 60)}h{" "}
                          {session.billable_duration_minutes % 60}m <Translate>billable</Translate>
                        </div>
                      )}
                    </div>

                    {session.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{session.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(session)}
                      title="Edit session"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(session)}
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
