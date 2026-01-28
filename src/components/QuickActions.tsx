import React, { useState } from "react";
import { Clock, Users, Calendar, Play, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Translate } from "components/Translate";
import { ExportDataDialog } from "./ExportDataDialog";

interface Props {
  onStartSession: (client: string) => void;
}

export function QuickActions({ onStartSession }: Props) {
  const navigate = useNavigate();
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-foreground mb-3"><Translate>Quick Actions</Translate></h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/TimeTrackingPage')}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <Clock className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Track Time</Translate></div>
        </button>
        <button
          onClick={() => navigate('/ClientsPage')}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <Users className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Manage Clients</Translate></div>
        </button>
        <button
          onClick={() => navigate('/CalendarPage')}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <Calendar className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Calendar</Translate></div>
        </button>
        <button
          onClick={() => onStartSession("New Client")}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <Play className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Start Session</Translate></div>
        </button>
        <button
          onClick={() => navigate('/InvoicesPage')}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <FileText className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Create Invoice</Translate></div>
        </button>
        <button
          onClick={() => setIsExportOpen(true)}
          className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors"
        >
          <Download className="w-5 h-5 text-foreground mb-2" />
          <div className="text-sm font-medium text-foreground"><Translate>Export Data</Translate></div>
        </button>
      </div>
      
      <ExportDataDialog open={isExportOpen} onOpenChange={setIsExportOpen} />
    </div>
  );
}
