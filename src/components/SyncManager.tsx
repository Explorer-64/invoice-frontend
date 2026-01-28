import { useEffect, useState, ReactNode } from 'react';
import { dbPromise, ActionType, PendingAction } from 'utils/db';
import brain from 'brain';
import { toast } from 'sonner';
import { SyncContext } from './SyncContext';

export type { SyncContextType } from './SyncContext';
export { useSync } from './SyncContext';

export const SyncManager = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = async () => {
    try {
        const db = await dbPromise;
        const count = await db.countFromIndex('pendingActions', 'synced', 0 as any); // 0 (false) means not synced
        setPendingCount(count);
    } catch (e) {
        console.error("Failed to count pending actions", e);
    }
  };

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online", { description: "Syncing pending actions..." });
      processQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline", { description: "Changes will be saved locally." });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Attempt to sync on mount if online and have pending items
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline]);

  const processQueue = async () => {
    if (isSyncing || !isOnline) return;
    
    setIsSyncing(true);
    const db = await dbPromise;
    
    try {
      // Get all pending actions ordered by timestamp
      const allPending = await db.getAllFromIndex('pendingActions', 'synced', 0 as any);
      const pendingActions = allPending.sort((a, b) => a.timestamp - b.timestamp);

      if (pendingActions.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`Syncing ${pendingActions.length} actions...`);

      // map tempId (negative) -> realId (from API)
      const sessionIdMap = new Map<number, number>();
      const clientIdMap = new Map<string, string>();

      for (const action of pendingActions) {
        try {
          // Resolve any temporary IDs in the payload
          
          // 1. Resolve sessionId
          if (action.payload.sessionId && typeof action.payload.sessionId === 'number' && action.payload.sessionId < 0) {
             const realId = sessionIdMap.get(action.payload.sessionId);
             if (realId) action.payload.sessionId = realId;
          }
          
          // 2. Resolve client_id (for start_session)
          if (action.payload.client_id && typeof action.payload.client_id === 'string' && action.payload.client_id.startsWith('temp_')) {
             const realId = clientIdMap.get(action.payload.client_id);
             if (realId) action.payload.client_id = realId;
          }
          
          // 3. Resolve clientId (for update_client, create_billing_rate, etc.)
          if (action.payload.clientId && typeof action.payload.clientId === 'string' && action.payload.clientId.startsWith('temp_')) {
             const realId = clientIdMap.get(action.payload.clientId);
             if (realId) action.payload.clientId = realId;
          }

          // 4. Resolve ids for invoices (client_id, session_ids)
          if (action.type === 'CREATE_INVOICE') {
              if (action.payload.client_id && typeof action.payload.client_id === 'string' && action.payload.client_id.startsWith('temp_')) {
                  const realId = clientIdMap.get(action.payload.client_id);
                  if (realId) action.payload.client_id = realId;
              }
              if (action.payload.session_ids && Array.isArray(action.payload.session_ids)) {
                  action.payload.session_ids = action.payload.session_ids.map((sid: number) => {
                      if (sid < 0) {
                          return sessionIdMap.get(sid) || sid;
                      }
                      return sid;
                  });
              }
          }

          const result = await performApiCall(action);
          
          // If this was a START_SESSION with a tempId, map it to the real ID
          if (action.type === 'START_SESSION' && action.payload.tempId && result?.id) {
              const tempId = action.payload.tempId;
              const realId = result.id;
              
              sessionIdMap.set(tempId, realId);
              
              // Update future actions in DB
              const futureActions = await db.getAllFromIndex('pendingActions', 'synced', 0 as any);
              const relevantFutureActions = futureActions.filter(fa => fa.timestamp > action.timestamp);
                 
              for (const fa of relevantFutureActions) {
                  let changed = false;
                  if (fa.payload.sessionId === tempId) {
                      fa.payload.sessionId = realId;
                      changed = true;
                  }
                  if (changed) {
                      await db.put('pendingActions', fa);
                  }
              }
              
              // Update local session cache
              const localSession = await db.get('activeSession', tempId);
              if (localSession) {
                  await db.delete('activeSession', tempId);
                  localSession.id = realId;
                  await db.add('activeSession', localSession);
              }
          }
          
          // If this was a CREATE_CLIENT with a tempId, map it to the real ID
          if (action.type === 'CREATE_CLIENT' && action.payload.tempId && result?.id) {
              const tempId = action.payload.tempId;
              const realId = result.id;
              
              clientIdMap.set(tempId, realId);
              
              // Update future actions in DB
              const futureActions = await db.getAllFromIndex('pendingActions', 'synced', 0 as any);
              const relevantFutureActions = futureActions.filter(fa => fa.timestamp > action.timestamp);
                 
              for (const fa of relevantFutureActions) {
                  let changed = false;
                  if (fa.payload.clientId === tempId) {
                      fa.payload.clientId = realId;
                      changed = true;
                  }
                  if (fa.payload.client_id === tempId) {
                      fa.payload.client_id = realId;
                      changed = true;
                  }
                  if (changed) {
                      await db.put('pendingActions', fa);
                  }
              }
              
              // Update local client cache
              const localClient = await db.get('clients', tempId);
              if (localClient) {
                  await db.delete('clients', tempId);
                  localClient.id = realId;
                  await db.add('clients', localClient);
              }
          }
          
          // If this was a CREATE_INVOICE with a tempId, we might need to map it (though rarely used for future actions unless we update invoices)
          if (action.type === 'CREATE_INVOICE' && action.payload.tempId && result?.id) {
               const tempId = action.payload.tempId;
               const realId = result.id;
               
               // Update local invoice cache
               const localInvoice = await db.get('invoices', tempId);
               if (localInvoice) {
                   await db.delete('invoices', tempId);
                   localInvoice.id = realId;
                   // Update invoice_number if returned
                   if (result.invoice_number) {
                       localInvoice.invoice_number = result.invoice_number;
                   }
                   localInvoice.status = result.status || 'draft'; 
                   await db.add('invoices', localInvoice);
               }
          }
          
          // If successful, mark as synced (or delete)
          if (action.id) {
             await db.delete('pendingActions', action.id);
          }
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          toast.error("Sync failed", { description: "Some actions could not be synced. Will retry later." });
          break; 
        }
      }
      
      await updatePendingCount();

      const remaining = await db.countFromIndex('pendingActions', 'synced', 0 as any);
      if (remaining === 0) {
             toast.success("Sync complete", { description: "All offline changes saved." });
      }

    } catch (error) {
      console.error("Sync process error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const performApiCall = async (action: PendingAction): Promise<any> => {
    const { type, payload } = action;
    
    // Strip tempId from payload before sending to API
    const { tempId, ...apiPayload } = payload;
    
    switch (type) {
      case 'START_SESSION':
        {
           const res = await brain.start_session(apiPayload);
           return await res.json();
        }
      case 'END_SESSION':
        await brain.end_session(apiPayload.sessionId, apiPayload);
        return null;
      case 'UPDATE_SESSION':
        // payload should contain { sessionId, ...updates }
        await brain.update_session({ sessionId: apiPayload.sessionId }, apiPayload.updates);
        return null;
      case 'CREATE_CLIENT':
        {
            const res = await brain.create_client(apiPayload);
            return await res.json();
        }
      case 'UPDATE_CLIENT':
        {
            const { clientId, ...data } = apiPayload;
            await brain.update_client({ clientId }, data);
            return null;
        }
      case 'CREATE_BILLING_RATE':
        {
            const { clientId, ...data } = apiPayload;
            await brain.create_billing_rate({ clientId }, data);
            return null;
        }
      case 'CREATE_INVOICE':
        {
            // remove temp properties if any
            const { tempId, ...invoiceData } = apiPayload;
            const res = await brain.create_invoice(invoiceData);
            return await res.json();
        }
      case 'DELETE_INVOICE':
        {
            await brain.delete_invoice({ invoiceId: apiPayload.invoiceId });
            return null;
        }
      default:
        console.warn("Unknown action type:", type);
    }
  };

  const queueAction = async (type: ActionType, payload: any) => {
    // Add timestamp if missing
    const action: PendingAction = {
      type,
      payload,
      timestamp: Date.now(),
      synced: false
    };
    
    const db = await dbPromise;
    await db.add('pendingActions', action);
    
    await updatePendingCount();
    
    toast.info("Saved offline", { description: "Will sync when online." });
  };

  const syncNow = async () => {
      await processQueue();
  };

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingCount, queueAction, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};
