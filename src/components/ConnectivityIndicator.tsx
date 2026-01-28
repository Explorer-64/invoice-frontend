import { useContext } from "react";
import { SyncContext } from "components/SyncContext";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const ConnectivityIndicator = () => {
  const { isOnline, isSyncing, pendingCount } = useContext(SyncContext);

  // Show nothing if online and everything synced
  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4",
      !isOnline && "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900",
      isOnline && "bg-blue-600 text-white"
    )}>
      {!isOnline && (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline Mode</span>
          {pendingCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs ml-1">
              {pendingCount} pending
            </span>
          )}
        </>
      )}

      {isOnline && (isSyncing || pendingCount > 0) && (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs ml-1">
            {pendingCount} left
          </span>
        </>
      )}
    </div>
  );
};
