import React, { useState, useEffect, useMemo } from "react";
import { backend as apiClient } from "app";
import { useCurrentUser } from "app/auth";
import { WorkSessionResponse, ClientResponse, CalendarEvent as ApiCalendarEvent } from "types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navigation } from "components/Navigation";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SessionEditDialog } from "components/SessionEditDialog";
import { SimpleCalendar } from "components/SimpleCalendar";

interface CalendarViewEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  resource: WorkSessionResponse | ApiCalendarEvent;
  source?: 'internal' | 'google' | 'microsoft' | 'icloud';
}

export default function CalendarPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarViewEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [date, setDate] = useState(new Date());

  // Detect mobile and set default view
  useEffect(() => {
    if (window.innerWidth < 768) {
      setView('day');
    }
  }, []);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarViewEvent | null>(null);
  const [initialDialogData, setInitialDialogData] = useState<{ start: Date; end: Date; notes?: string } | null>(null);
  
  // Data
  const [clients, setClients] = useState<ClientResponse[]>([]);

  const fetchClients = async () => {
    try {
      const response = await apiClient.list_clients({});
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Calculate date range based on current view and date
      const start = moment(date).subtract(2, 'months').toDate();
      const end = moment(date).add(2, 'months').toDate();
      const startIso = start.toISOString();
      const endIso = end.toISOString();
      
      // Fetch internal sessions
      const sessionsRes = await apiClient.list_sessions({
        start_date: startIso,
        end_date: endIso,
      });
      const sessions = await sessionsRes.json();
      
      const mappedSessions: CalendarViewEvent[] = sessions.map((session: WorkSessionResponse) => ({
        id: session.id,
        title: session.client_name || "Untitled Session",
        start: new Date(session.start_time),
        end: session.end_time ? new Date(session.end_time) : new Date(new Date(session.start_time).getTime() + 60 * 60 * 1000), // Default 1h if active
        resource: session,
        source: 'internal',
      }));

      let externalEvents: CalendarViewEvent[] = [];

      try {
        // First, list all calendars to get IDs
        const calendarsRes = await apiClient.list_all_calendars();
        const calendarsData = await calendarsRes.json();
        
        if (calendarsData.calendars && calendarsData.calendars.length > 0) {
            const calendarIds = calendarsData.calendars.map((c: any) => c.id);
            
            const eventsRes = await apiClient.fetch_events({
                calendar_ids: calendarIds,
                start_date: startIso.split('T')[0],
                end_date: endIso.split('T')[0],
            });
            const eventsData = await eventsRes.json();
            
            externalEvents = eventsData.events.map((event: ApiCalendarEvent) => ({
                id: `${event.source}-${event.id}`,
                title: event.summary || "Untitled Event",
                start: new Date(event.start),
                end: new Date(event.end),
                resource: event,
                source: event.source as any,
            }));
        }
      } catch (error) {
        console.error("Failed to fetch external events:", error);
        // Don't block internal sessions if external fails
      }
      
      setEvents([...mappedSessions, ...externalEvents]);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user?.id, date, view]);

  const handleSelectSlot = (start: Date, end: Date) => {
    setInitialDialogData({
      start,
      end,
    });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarViewEvent) => {
    if (event.source && event.source !== 'internal') {
      // For external events, we open the dialog as if it's a new session, but pre-filled
      const extEvent = event.resource as ApiCalendarEvent;
      setInitialDialogData({
        start: new Date(extEvent.start),
        end: new Date(extEvent.end),
        notes: `${extEvent.summary}${extEvent.description ? `\n\n${extEvent.description}` : ''}`,
      });
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event);
      setInitialDialogData(null);
    }
    setIsDialogOpen(true);
  };

  const handleDeleteSession = async (session: WorkSessionResponse) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      await apiClient.delete_session({ sessionId: session.id });
      toast.success("Session deleted");
      setIsDialogOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const eventPropGetter = (event: CalendarViewEvent) => {
    if (event.source === 'google') {
      return {
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800",
        style: { borderLeft: '4px solid #2563eb' }
      };
    }
    if (event.source === 'microsoft') {
      return {
        className: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-800",
        style: { borderLeft: '4px solid #4338ca' }
      };
    }
    if (event.source === 'icloud') {
      return {
        className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
        style: { borderLeft: '4px solid #4b5563' }
      };
    }
    return {
        className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-800",
        style: { borderLeft: '4px solid #f97316' }
    };
  };

  // Custom toolbar styles for mobile
  const calendarStyles = `
    .rbc-toolbar {
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (min-width: 768px) {
      .rbc-toolbar {
        flex-direction: row;
        gap: 0.5rem;
      }
    }
    .rbc-btn-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem;
    }
    .rbc-toolbar-label {
      font-weight: 600;
      margin: 0.5rem 0;
    }
  `;

  return (
    <div className="min-h-screen bg-background">
      <style>{calendarStyles}</style>
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Calendar</h1>
            <p className="text-sm text-muted-foreground">Schedule and manage your work sessions</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings-page?tab=integrations')}
              className="w-full sm:w-auto justify-center"
            >
                <Settings className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Connect</span>
                <span className="hidden sm:inline">Connect Calendars</span>
            </Button>
            <Button 
              onClick={() => {
                const now = new Date();
                const end = new Date(now.getTime() + 60 * 60 * 1000);
                setInitialDialogData({
                    start: now,
                    end: end,
                });
                setSelectedEvent(null);
                setIsDialogOpen(true);
              }}
              className="w-full sm:w-auto justify-center"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Session
            </Button>
            <div className="flex justify-end sm:hidden">
               <Navigation />
            </div>
            <div className="hidden sm:block">
               <Navigation />
            </div>
         </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 md:p-6 h-[600px] md:h-[700px]">
          <SimpleCalendar
            events={events}
            view={view}
            onViewChange={setView}
            date={date}
            onNavigate={setDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </main>

      <SessionEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        session={selectedEvent?.resource as WorkSessionResponse | undefined}
        initialData={initialDialogData || undefined}
        clients={clients}
        onSuccess={fetchSessions}
        onDelete={handleDeleteSession}
      />
    </div>
  );
}
