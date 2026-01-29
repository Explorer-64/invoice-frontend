import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Translate } from "components/Translate";
import type { DashboardStats, DashboardInvoice, InvoiceListItem } from "types";

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  /** Fallback from Firestore (same source as Invoices page) when API returns empty */
  invoicesFallback?: InvoiceListItem[];
}

export function RecentInvoicesList({ stats, loading, error, invoicesFallback = [] }: Props) {
  const navigate = useNavigate();
  const recentInvoices = stats
    ? (stats.recent_invoices ?? [])
    : invoicesFallback.slice(0, 5).map((inv): DashboardInvoice => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_name: inv.client_name,
        total: inv.total,
        status: inv.status,
        date: typeof inv.invoice_date === "string" ? inv.invoice_date : inv.invoice_date?.toISOString?.()?.slice(0, 10) ?? "",
      }));

  const renderContent = () => {
    if (loading && !stats) {
      return (
        <div className="space-y-2">
          {[1, 2].map((key) => (
            <div key={key} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
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

    if (!recentInvoices || recentInvoices.length === 0) {
      return (
        <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <Translate>No invoices yet. Create one from the Quick Actions below.</Translate>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentInvoices.map((invoice: DashboardInvoice) => (
          <div 
            key={invoice.id} 
            className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => navigate('/InvoicesPage')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">{invoice.client_name}</div>
                <div className="text-xs text-muted-foreground">{invoice.invoice_number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.total)}
                </div>
                <div className={`text-xs capitalize ${
                  invoice.status === 'paid' ? 'text-green-600 font-medium' : 
                  invoice.status === 'sent' ? 'text-blue-600' : 
                  'text-muted-foreground'
                }`}>
                  <Translate>{invoice.status}</Translate>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground"><Translate>Recent Invoices</Translate></h2>
        <button
          onClick={() => navigate("/InvoicesPage")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Translate>View all</Translate>
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
