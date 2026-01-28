import React from "react";
import { MapPin, Trash2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Translate } from "components/Translate";
import type { WorkSessionResponse } from "types";

interface Props {
  sessions: WorkSessionResponse[];
  loading: boolean;
  error: string | null;
  onDelete: (session: WorkSessionResponse) => void;
}

export function RecentSessionsList({ sessions, loading, error, onDelete }: Props) {
  const navigate = useNavigate();

  const formatDurationMinutes = (minutes: number | null | undefined) => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatBillableAmount = (session: WorkSessionResponse) => {
    // Use backend estimated amount if available
    if (session.estimated_amount !== undefined && session.estimated_amount !== null) {
      return new Intl.NumberFormat("en-US", { 
        style: "currency", 
        currency: session.rate_currency || "USD" 
      }).format(session.estimated_amount);
    }

    // Fallback if no rate set
    if (!session.billable_duration_minutes) return null;
    return "Rate not set";
  };

  const formatSessionTimeRange = (session: WorkSessionResponse) => {
    const start = new Date(session.start_time);
    const end = session.end_time ? new Date(session.end_time) : null;
    
    // We'll return JSX here instead of string to support translation components
    // But this function is used inside JSX below, so it needs to return a ReactNode
    // However, it is currently typed implicitly or as string in usage
    // Let's modify the usage site instead.
    const dateLabel = formatDateLabel(start);
    const timeRange = `${formatTimeLabel(start)}${end ? ` - ${formatTimeLabel(end)}` : ""}`;
    
    return (
      <>
        {dateLabel === "Today" ? <Translate>Today</Translate> : 
         dateLabel === "Yesterday" ? <Translate>Yesterday</Translate> : 
         dateLabel}
        , {timeRange}
      </>
    );
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatTimeLabel = (date: Date) =>
    date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const handleDeleteClick = (e: React.MouseEvent, session: WorkSessionResponse) => {
    e.stopPropagation();
    onDelete(session);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((key) => (
          <div key={key} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
        <Translate>No sessions logged yet. Track time from the Time Tracking page.</Translate>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground"><Translate>Recent Sessions</Translate></h2>
        <button
          onClick={() => navigate("/TimeTrackingPage")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Translate>View all</Translate>
        </button>
      </div>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div key={session.id} className="bg-card border border-border rounded-xl p-4 group relative hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="pr-8">
                <div className="text-sm font-medium text-foreground mb-0.5">{session.client_name}</div>
                {session.notes && (
                  <div className="text-xs text-muted-foreground">{session.notes}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {formatDurationMinutes(session.billable_duration_minutes ?? session.total_duration_minutes)}
                </div>
                {session.billable_duration_minutes !== null && (
                  <div className="text-xs text-muted-foreground">
                    {formatBillableAmount(session) === "Rate not set" ? <Translate>Rate not set</Translate> : formatBillableAmount(session)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {formatSessionTimeRange(session)}
            </div>

            <button
              onClick={(e) => handleDeleteClick(e, session)}
              className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
