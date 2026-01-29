import React from "react";
import { Clock, DollarSign, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Translate } from "components/Translate";
import type { DashboardStats } from "types";

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
  rangeLabel: string;
  /** Fallback invoice count from Firestore when API fails (stats is null) */
  invoicesFallback?: number;
}

export function DashboardStatsCards({ stats, loading, rangeLabel, invoicesFallback = 0 }: Props) {
  const invoiceCount = stats ? stats.invoices_count : invoicesFallback;
  const formattedStats = {
    hours: stats ? `${stats.hours_this_week.toFixed(1)}h` : "0h",
    earnings: stats ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.earnings) : "$0",
    invoices: invoiceCount.toString(),
  };

  const renderStatValue = (value: string) => {
    if (loading) {
      return <Skeleton className="h-6 w-16" />;
    }
    return <div className="text-xl font-semibold text-foreground">{value}</div>;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {[
        { icon: Clock, label: rangeLabel, value: formattedStats.hours },
        { icon: DollarSign, label: "Earnings", value: formattedStats.earnings },
        { icon: FileText, label: "Invoices", value: formattedStats.invoices },
      ].map((item, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              i === 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20" :
              i === 1 ? "bg-green-100 text-green-600 dark:bg-green-900/20" :
              "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground"><Translate>{item.label}</Translate></span>
          </div>
          {renderStatValue(item.value)}
        </div>
      ))}
    </div>
  );
}
