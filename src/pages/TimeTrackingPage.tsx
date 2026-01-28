import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backend as apiClient } from "app";
import { useCurrentUser } from "app/auth";
import { WorkSessionResponse, ClientResponse } from "types";
import { Button } from "@/components/ui/button";
import { SessionEditDialog } from "components/SessionEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PageHeader } from "components/PageHeader";
import { useSync } from "components/SyncContext";
import { dbPromise, LocalSession } from "utils/db";
import { ActiveSessionCard } from "components/ActiveSessionCard";
import { StartSessionCard } from "components/StartSessionCard";
import { TimeTrackingSessionList } from "components/TimeTrackingSessionList";
import { Translate } from "components/Translate";

const TimeTrackingPage = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { isOnline, queueAction, isSyncing, pendingCount } = useSync();
  
  // Sync local active session with idb
  const [localActiveSessions, setLocalActiveSessions] = useState<LocalSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<WorkSessionResponse[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkSessionResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Edit dialog state
  const [sessionToEdit, setSessionToEdit] = useState<WorkSessionResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete dialog state
  const [sessionToDelete, setSessionToDelete] = useState<WorkSessionResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll local DB for active sessions
  useEffect(() => {
    const pollLocalDB = async () => {
      const db = await dbPromise;
      const sessions = await db.getAll('activeSession');
      setLocalActiveSessions(sessions);
    };

    pollLocalDB();
    const interval = setInterval(pollLocalDB, 2000); // Poll every 2s or use a custom event listener
    return () => clearInterval(interval);
  }, []);

  // Sync active sessions from local DB to state
  useEffect(() => {
    if (localActiveSessions) {
      // Cast LocalSession to WorkSessionResponse as best effort
      setActiveSessions(localActiveSessions as unknown as WorkSessionResponse[]);
    }
  }, [localActiveSessions]);

  // Load data on mount
  useEffect(() => {
    // Only load from API if we are online and have no pending syncs
    // This prevents overwriting local optimistic updates with stale API data
    if (user && isOnline && !isSyncing && pendingCount === 0) {
      loadData();
    }
  }, [user?.id, isOnline, isSyncing, pendingCount]);

  const loadData = async () => {
    if (!isOnline) {
      // Load cached clients if offline
      const db = await dbPromise;
      const cachedClients = await db.getAll('clients');
      setClients(cachedClients);
      
      // Load cached recent sessions
      // Manually sort by start_time desc and limit to 10
      const allSessions = await db.getAll('sessions');
      const cachedRecent = allSessions
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 10);
      setRecentSessions(cachedRecent);
      return;
    }

    // Cancel previous requests
    apiClient.abortRequest("timetracking-active");
    apiClient.abortRequest("timetracking-recent");
    apiClient.abortRequest("timetracking-clients");

    try {
      const [activeRes, recentRes, clientsRes] = await Promise.all([
        apiClient.get_active_sessions({ cancelToken: "timetracking-active" }),
        apiClient.get_recent_sessions({ limit: 10 }, { cancelToken: "timetracking-recent" }),
        apiClient.list_clients({ cancelToken: "timetracking-clients" }),
      ]);

      const activeData = await activeRes.json();
      const recentData = await recentRes.json();
      const clientsData = await clientsRes.json();

      // Sync active sessions to IDB
      const db = await dbPromise;
      await db.clear('activeSession');
      if (activeData.length > 0) {
        const tx = db.transaction('activeSession', 'readwrite');
        await Promise.all(activeData.map(item => tx.store.add(item as LocalSession)));
        await tx.done;
      }

      // Cache clients
      if (clientsData.length > 0) {
        await db.clear('clients');
        const tx = db.transaction('clients', 'readwrite');
        await Promise.all(clientsData.map(item => tx.store.put(item)));
        await tx.done;
      }
      
      // Cache recent sessions
      if (recentData.length > 0) {
          const tx = db.transaction('sessions', 'readwrite');
          await Promise.all(recentData.map(item => tx.store.put(item)));
          await tx.done;
      }

      setRecentSessions(recentData);
      setClients(clientsData);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      toast.error("Failed to sync sessions");
    }
  };

  const startSession = async (clientId: string) => {
    const client = clients.find(c => c.id.toString() === clientId);
    if (!client) {
      toast.error("Client not found");
      return;
    }

    setIsStarting(true);
    try {
      if (!isOnline) {
        // Offline mode: Optimistic update
        const tempId = -Date.now(); // Generate negative temp ID
        const newSession: LocalSession = {
          id: tempId, // Store temp ID in local session
          client_id: client.id,
          client_name: client.name,
          start_time: new Date().toISOString(),
          session_type: "manual",
          break_duration_minutes: 0,
          billable_duration_minutes: 0,
          location_name: "Offline Location", // Placeholder
          notes: ""
        };

        const db = await dbPromise;
        await db.add('activeSession', newSession);
        await queueAction('START_SESSION', {
          client_id: client.id,
          session_type: "manual",
          tempId, // Pass temp ID to queue for resolution
        });
        
        toast.success("Session started offline");
      } else {
        // Online mode
        const res = await apiClient.start_session({
          client_id: clientId,
          session_type: "manual",
        });
        const newSession = await res.json();
        
        // Update IDB to keep in sync
        const db = await dbPromise;
        await db.clear('activeSession');
        await db.add('activeSession', newSession as LocalSession);
        
        toast.success("Work session started");
        loadData(); // Refresh recent lists etc
      }
    } catch (error: any) {
      const errorData = await error.json?.();
      toast.error(errorData?.detail || "Failed to start session");
    } finally {
      setIsStarting(false);
    }
  };

  const endSession = async (sessionId: number, clientName: string) => {
    try {
      if (!isOnline) {
         // Offline mode
         // Get the active session before clearing it
         const db = await dbPromise;
         const session = await db.get('activeSession', sessionId);
         
         await db.clear('activeSession');
         
         if (session) {
             // Create a completed session for local history
             const completedSession: WorkSessionResponse = {
                 // @ts-ignore
                 id: sessionId, // Keep temp ID or real ID
                 client_id: session.client_id,
                 client_name: session.client_name || clientName,
                 start_time: session.start_time,
                 end_time: new Date().toISOString(),
                 billable_duration_minutes: 0, // Calc if possible, or 0
                 total_duration_minutes: 0, // Calc
                 break_duration_minutes: session.break_duration_minutes || 0,
                 notes: session.notes || "",
                 session_type: session.session_type || "manual",
                 location_name: session.location_name,
                 latitude: session.latitude,
                 longitude: session.longitude,
                 rate_currency: "USD", // Default
                 hourly_rate: 0, // Unknown
                 estimated_amount: 0 // Unknown
             };
             
             // Calculate duration roughly
             const start = new Date(session.start_time).getTime();
             const end = new Date(completedSession.end_time!).getTime();
             const totalMins = Math.floor((end - start) / 60000);
             completedSession.total_duration_minutes = totalMins;
             completedSession.billable_duration_minutes = Math.max(0, totalMins - (session.break_duration_minutes || 0));
             
             await db.add('sessions', completedSession);
             
             // Update state immediately
             setRecentSessions(prev => [completedSession, ...prev]);
         }

         await queueAction('END_SESSION', { sessionId });
         toast.success(`Stopped session for ${clientName} (Offline)`);
      } else {
         await apiClient.end_session({ sessionId });
         const db = await dbPromise;
         await db.clear('activeSession');
         toast.success(`Stopped session for ${clientName}`);
         loadData();
      }
    } catch (error) {
      toast.error("Failed to end session");
    }
  };

  const handleEditClick = (session: WorkSessionResponse) => {
    setSessionToEdit(session);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadData();
    setIsEditDialogOpen(false);
    setSessionToEdit(null);
  };

  const handleDeleteClick = (session: WorkSessionResponse) => {
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    // Optimistically update UI
    const previousRecent = [...recentSessions];
    setRecentSessions(recentSessions.filter(s => s.id !== sessionToDelete.id));
    setIsDeleteDialogOpen(false);

    try {
      await apiClient.delete_session({ sessionId: sessionToDelete.id });
      toast.success("Session deleted");
      // Background refresh to ensure sync
      loadData();
    } catch (error) {
      // Revert on failure
      setRecentSessions(previousRecent);
      toast.error("Failed to delete session");
    } finally {
      setSessionToDelete(null);
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageHeader title="Time Tracking" subtitle="Track work sessions and manage time logs" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4"><Translate>Please Sign In</Translate></h2>
            <p className="text-muted-foreground mb-6">
              <Translate>You need to be signed in to track your time.</Translate>
            </p>
            <Button asChild className="w-full">
              <a href="/login"><Translate>Sign In</Translate></a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageHeader title="Time Tracking" subtitle="Track work sessions and manage time logs" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Active Session</h2>
            {activeSessions.map((session) => (
              <ActiveSessionCard
                key={session.id}
                session={session}
                onStop={endSession}
                currentTime={currentTime}
              />
            ))}
          </div>
        )}

        {/* Start New Session */}
        {activeSessions.length === 0 && (
          <StartSessionCard
            clients={clients}
            onStart={startSession}
            isStarting={isStarting}
            onAddClient={() => navigate("/ClientsPage")}
            onClientAdded={loadData}
          />
        )}

        {/* Recent Sessions */}
        <TimeTrackingSessionList
          sessions={recentSessions}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </main>

      <SessionEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        session={sessionToEdit}
        onSuccess={handleEditSuccess}
        clients={clients}
        onDelete={handleDeleteClick}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><Translate>Are you sure?</Translate></AlertDialogTitle>
            <AlertDialogDescription>
              <Translate>This will permanently delete the work session for</Translate> {sessionToDelete?.client_name} <Translate>on</Translate> {sessionToDelete && formatDate(sessionToDelete.start_time)}. 
              <Translate>This action cannot be undone.</Translate>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><Translate>Cancel</Translate></AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Translate>Delete</Translate>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimeTrackingPage;
