import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ClientResponse, WorkSessionResponse, Invoice, InvoiceListItem } from 'types';

export type ActionType = 'START_SESSION' | 'END_SESSION' | 'UPDATE_SESSION' | 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'CREATE_BILLING_RATE' | 'CREATE_INVOICE' | 'DELETE_INVOICE';

export interface PendingAction {
  id?: number;
  type: ActionType;
  payload: any;
  timestamp: number;
  synced: boolean;
}

export interface CachedClient extends ClientResponse {}

export interface LocalSession extends Partial<WorkSessionResponse> {
  client_id: string;
  start_time: string;
  id?: number; 
}

export interface CachedInvoice extends InvoiceListItem, Partial<Invoice> {}
export interface CachedSession extends WorkSessionResponse {}

interface InvoiceJobsDBSchema extends DBSchema {
  pendingActions: {
    key: number;
    value: PendingAction;
    indexes: { 'synced': boolean };
  };
  clients: {
    key: string;
    value: CachedClient;
  };
  activeSession: {
    key: number;
    value: LocalSession;
  };
  invoices: {
    key: number;
    value: CachedInvoice;
  };
  sessions: {
    key: number;
    value: CachedSession;
  };
}

const DB_NAME = 'InvoiceJobsDB';
const DB_VERSION = 4;

export const initDB = async (): Promise<IDBPDatabase<InvoiceJobsDBSchema>> => {
  return openDB<InvoiceJobsDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        const pendingActionsStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        pendingActionsStore.createIndex('synced', 'synced');
        
        db.createObjectStore('clients', { keyPath: 'id' });
        db.createObjectStore('activeSession', { keyPath: 'id', autoIncrement: true });
      }
      
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('invoices')) {
             db.createObjectStore('invoices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
             const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
             // We need index for client_id
             sessionStore.createIndex('client_id', 'client_id');
        }
      }

      if (oldVersion < 3) {
        const sessionStore = transaction.objectStore('sessions');
        if (!sessionStore.indexNames.contains('client_id')) {
          sessionStore.createIndex('client_id', 'client_id');
        }
      }

      if (oldVersion < 4) {
        const sessionStore = transaction.objectStore('sessions');
        if (!sessionStore.indexNames.contains('by-start-time')) {
           sessionStore.createIndex('by-start-time', 'start_time');
        }
      }
    },
  });
};

export const dbPromise = initDB();
