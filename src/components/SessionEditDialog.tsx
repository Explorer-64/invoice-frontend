import { useState, useEffect } from "react";
import brain from "brain";
import { WorkSessionResponse, ClientResponse } from "types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: WorkSessionResponse | null;
  initialData?: { start: Date; end: Date; notes?: string };
  clients?: ClientResponse[];
  onSuccess: () => void;
  onDelete?: (session: WorkSessionResponse) => void;
}

export const SessionEditDialog = ({ 
  open, 
  onOpenChange, 
  session, 
  initialData, 
  clients, 
  onSuccess, 
  onDelete 
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState("0");
  const [notes, setNotes] = useState("");

  // Load session data
  useEffect(() => {
    if (open) {
      if (session) {
        setClientId(session.client_id.toString());
        const start = new Date(session.start_time);
        setStartDate(start.toISOString().split('T')[0]);
        setStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

        if (session.end_time) {
          const end = new Date(session.end_time);
          setEndDate(end.toISOString().split('T')[0]);
          setEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        } else {
          setEndDate("");
          setEndTime("");
        }

        setBreakDuration(session.break_duration_minutes?.toString() || "0");
        setNotes(session.notes || "");
      } else if (initialData) {
        setClientId("");
        const start = initialData.start;
        setStartDate(start.toISOString().split('T')[0]);
        setStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        
        const end = initialData.end;
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        
        setBreakDuration("0");
        setNotes(initialData.notes || "");
      } else {
        setClientId("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setBreakDuration("0");
        setNotes("");
      }
    }
  }, [session, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construct ISO strings for start and end times
      const startDateTime = new Date(`${startDate}T${startTime}`);
      let endDateTime: Date | null = null;

      if (endDate && endTime) {
        endDateTime = new Date(`${endDate}T${endTime}`);
        
        if (endDateTime < startDateTime) {
           toast.error("Invalid times", {
            description: "End time cannot be before start time.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (session) {
        await brain.update_session(
          { sessionId: session.id },
          {
            start_time: startDateTime.toISOString(),
            end_time: endDateTime ? endDateTime.toISOString() : null,
            break_duration_minutes: parseInt(breakDuration) || 0,
            notes: notes.trim() || null,
          }
        );
        toast.success("Session updated", {
          description: "Work session has been updated successfully.",
        });
      } else {
        if (!clientId) {
          toast.error("Missing client", {
            description: "Please select a client.",
          });
          setIsSubmitting(false);
          return;
        }

        await brain.start_session({
          client_id: clientId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime ? endDateTime.toISOString() : null,
          notes: notes.trim() || null,
          session_type: "manual",
        });
        toast.success("Session created", {
          description: "New work session has been created.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save session.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{session ? "Edit Session" : "New Session"}</DialogTitle>
            <DialogDescription>
              {session ? "Update details for this work session." : "Manually log a work session."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Client Select - Only show if clients provided */}
            {clients && (
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={clientId} onValueChange={setClientId} disabled={!!session}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="break">Break Duration (minutes)</Label>
              <Input
                id="break"
                type="number"
                min="0"
                value={breakDuration}
                onChange={(e) => setBreakDuration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Work description..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {session && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={() => onDelete(session)} 
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Saving...
                  </>
                ) : (
                  session ? "Save Changes" : "Create Session"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
