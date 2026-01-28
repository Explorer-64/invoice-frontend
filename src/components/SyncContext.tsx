import { createContext, useContext } from 'react';
import type { ActionType } from 'utils/db';

export interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  queueAction: (type: ActionType, payload: any) => Promise<void>;
  syncNow: () => Promise<void>;
}

export const SyncContext = createContext<SyncContextType>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  queueAction: async () => {},
  syncNow: async () => {},
});

export const useSync = () => useContext(SyncContext);
