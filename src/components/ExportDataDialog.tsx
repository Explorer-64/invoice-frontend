import React, { useState } from "react";
import { Download, FileText, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import brain from "brain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDataDialog({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExportInvoices = async () => {
    try {
      setLoading("invoices");
      toast.info("Preparing invoices export...");
      
      const response = await brain.export_invoices_csv();
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoices exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export invoices");
    } finally {
      setLoading(null);
    }
  };

  const handleExportSessions = async () => {
    try {
      setLoading("sessions");
      toast.info("Preparing sessions export...");
      
      const response = await brain.export_sessions_csv();
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Sessions exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export sessions");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Download your data in CSV format for spreadsheet analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex items-center justify-between group hover:border-primary/50"
            onClick={handleExportInvoices}
            disabled={!!loading}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Export Invoices</div>
                <div className="text-sm text-muted-foreground">Download all invoice records</div>
              </div>
            </div>
            {loading === "invoices" ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex items-center justify-between group hover:border-primary/50"
            onClick={handleExportSessions}
            disabled={!!loading}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Export Work Sessions</div>
                <div className="text-sm text-muted-foreground">Download time tracking logs</div>
              </div>
            </div>
            {loading === "sessions" ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
