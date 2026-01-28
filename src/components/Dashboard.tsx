import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Pause, FileText, Plus } from "lucide-react";
import { PWAInstallButton } from "components/PWAInstallButton";
import { Navigation } from "components/Navigation";
import { useCurrentUser } from "app/auth";
import { SyncContext } from "components/SyncContext";
import { Translate } from "components/Translate";
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
import brain from "brain";
import type { DashboardStats, GetRecentSessionsData, WorkSessionResponse } from "types";
import { DashboardStatsCards } from "components/DashboardStatsCards";
import { RecentSessionsList } from "components/RecentSessionsList";
import { RecentInvoicesList } from "components/RecentInvoicesList";
import { TaskList } from "components/TaskList";
import { QuickActions } from "components/QuickActions";
import { GPSTrackingCard } from "components/GPSTrackingCard";
import { dbPromise } from "utils/db";
import { CreateInvoiceDialog } from "components/CreateInvoiceDialog";
import { ClientResponse } from "types";

export function Dashboard() {
  const navigate = useNavigate();
  const { isOnline, queueAction } = useContext(SyncContext);
  
  const [activeSession, setActiveSession] = useState<{client: string; startTime: Date} | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkSessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  
  // Create Invoice Dialog State
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [clients, setClients] = useState<ClientResponse[]>([]);

  // Delete dialog state
  const [sessionToDelete, setSessionToDelete] = useState<WorkSessionResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    
    // Load active session
    const loadActiveSession = async () => {
      try {
        const session = await brain.get_active_sessions();
        const data = await session.json();
        // API returns list of sessions, we take the first one if any
        if (data && data.length > 0) {
            const s = data[0];
            setActiveSession({
                client: s.client_name,
                startTime: new Date(s.start_time)
            });
        }
      } catch (err) {
        console.error("Failed to load active session", err);
      }
    };
    loadActiveSession();

    // Load clients for dropdown
    const loadClients = async () => {
        try {
            const res = await brain.list_clients();
            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Failed to load clients", err);
        }
    };
    loadClients();

    // Fetch stats
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await brain.get_dashboard_stats();
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setStatsError("Failed to load stats");
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();

    // Fetch recent sessions
    const fetchRecentSessions = async () => {
      setSessionsLoading(true);
      try {
        const res = await brain.get_recent_sessions();
        const data = await res.json();
        setRecentSessions(data);
      } catch (err) {
        setSessionsError("Failed to load sessions");
        console.error(err);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchRecentSessions();

  }, [user?.id]); // removed navigate

  // Delete handlers
  const handleDeleteRequest = (session: WorkSessionResponse) => {
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      await brain.delete_session({ sessionId: sessionToDelete.id });
      toast.success("Session deleted");
      
      // Update list
      setRecentSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
      
      // Update stats if needed (optional)
      const res = await brain.get_dashboard_stats();
      const data = await res.json();
      setStats(data);

    } catch (err) {
      console.error("Failed to delete session", err);
      toast.error("Failed to delete session");
    } finally {
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const startSession = (client: string) => {
    setActiveSession({ client, startTime: new Date() });
  };

  const stopSession = () => {
    setActiveSession(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Full Width */}
      <div className="w-full border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground whitespace-nowrap">Invoice My Jobs</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              <Translate>Track time and create invoices with your voice</Translate>
            </p>
          </div>
          <Navigation />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* PWA Install Prompt */}
        <div className="mb-6">
          <PWAInstallButton />
        </div>

        {/* Voice Input */}
        <div className="flex-1 flex flex-col">
          <button
            onClick={() => navigate('/AssistantPage')}
            className="mb-6 bg-gradient-to-r from-primary to-primary/80 rounded-full p-6 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6 text-primary-foreground" />
            <span className="text-lg font-medium text-primary-foreground">
              <Translate>Ask your billing assistant</Translate>
            </span>
            <Mic className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>

        {/* Quick Actions - Moved Higher */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4"><Translate>Quick Actions</Translate></h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/TimeTrackingPage')}
              className="bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl p-3 text-left transition-all shadow-md hover:shadow-lg active:scale-95 flex flex-col gap-1.5"
            >
              <Mic className="w-4 h-4" />
              <div className="text-sm font-semibold"><Translate>Track Time</Translate></div>
            </button>
            <button
              onClick={() => setCreateInvoiceOpen(true)}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl p-3 text-left transition-all shadow-md hover:shadow-lg active:scale-95 flex flex-col gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <div className="text-sm font-semibold"><Translate>Create Invoice</Translate></div>
            </button>
            <button
              onClick={() => navigate('/ClientsPage')}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl p-3 text-left transition-all shadow-md hover:shadow-lg active:scale-95 flex flex-col gap-1.5"
            >
              <div className="w-4 h-4 flex items-center justify-center border-2 border-white rounded-full">
                <Plus className="w-2.5 h-2.5" />
              </div>
              <div className="text-sm font-semibold"><Translate>New Client</Translate></div>
            </button>
          </div>
        </div>

        {/* GPS Tracking Status */}
        <GPSTrackingCard />

        {/* Active Session Card */}
        {activeSession && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground"><Translate>Active Session</Translate></span>
              </div>
              <button
                onClick={stopSession}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <Translate>Stop</Translate>
              </button>
            </div>
            <div className="text-2xl font-semibold text-foreground mb-1">{formatTime(activeSession.startTime)}</div>
            <div className="text-sm text-muted-foreground">{activeSession.client}</div>
          </div>
        )}

        {/* Quick Stats */}
        <DashboardStatsCards stats={stats} loading={statsLoading} />

        {/* Tasks Widget */}
        <TaskList />

        {/* Recent Invoices */}
        <RecentInvoicesList stats={stats} loading={statsLoading} error={statsError} />

        {/* Recent Sessions */}
        <RecentSessionsList 
          sessions={recentSessions} 
          loading={sessionsLoading} 
          error={sessionsError} 
          onDelete={handleDeleteRequest}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle><Translate>Delete Session?</Translate></AlertDialogTitle>
              <AlertDialogDescription>
                <Translate>This will permanently delete the work session for</Translate> {sessionToDelete?.client_name}. 
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
        
        {/* Quick Invoice Dialog */}
        <CreateInvoiceDialog 
            open={createInvoiceOpen}
            onOpenChange={setCreateInvoiceOpen}
            clients={clients}
            sessions={recentSessions} // Pass recent sessions, though dialog might want all. But for quick action it's okay.
            isOnline={isOnline}
            queueAction={queueAction}
            onSuccess={() => {
                toast.success("Invoice created");
                // Refresh stats
                brain.get_dashboard_stats().then(res => res.json()).then(data => setStats(data));
            }}
        />
      </div>
    </div>
  );
}
