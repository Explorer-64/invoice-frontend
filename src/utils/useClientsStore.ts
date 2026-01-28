import { create } from 'zustand';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from 'app';
import { ClientResponse, BillingRateResponse, CreateClientRequest, UpdateClientRequest, CreateBillingRateRequest, UpdateBillingRateRequest } from 'types';

interface ClientsState {
  clients: ClientResponse[];
  rates: BillingRateResponse[];
  isLoading: boolean;
  error: Error | null;
  
  // Initialization
  subscribe: (userId: string) => () => void;
  
  // Client operations
  createClient: (userId: string, data: CreateClientRequest) => Promise<ClientResponse>;
  updateClient: (userId: string, clientId: string, data: UpdateClientRequest) => Promise<void>;
  deleteClient: (userId: string, clientId: string) => Promise<void>;
  restoreClient: (userId: string, clientId: string) => Promise<void>;
  
  // Rate operations
  createRate: (userId: string, clientId: string, data: CreateBillingRateRequest) => Promise<BillingRateResponse>;
  updateRate: (userId: string, clientId: string, rateId: string, data: UpdateBillingRateRequest) => Promise<void>;
  deleteRate: (userId: string, rateId: string) => Promise<void>;
  
  // Helpers
  getClientWithRates: (clientId: string) => { client: ClientResponse; rates: BillingRateResponse[] } | null;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  rates: [],
  isLoading: true,
  error: null,

  subscribe: (userId: string) => {
    if (!userId) {
      console.warn('[ClientsStore] No userId provided, skipping subscription');
      set({ isLoading: false });
      return () => {};
    }

    console.log('[ClientsStore] Subscribing to clients for userId:', userId);
    console.log('[ClientsStore] Firestore instance:', firestore);
    console.log('[ClientsStore] Firestore app:', firestore.app);
    
    const clientsRef = collection(firestore, 'users', userId, 'clients');
    const ratesRef = collection(firestore, 'users', userId, 'rates');
    
    console.log('[ClientsStore] Firestore path:', `users/${userId}/clients`);
    console.log('[ClientsStore] Collection reference:', clientsRef);
    
    // Listen to all clients (no filter - handle deleted_at in map)
    const unsubscribeClients = onSnapshot(
      clientsRef,
      (snapshot) => {
        console.log('[ClientsStore] Received snapshot with', snapshot.docs.length, 'clients');
        console.log('[ClientsStore] Snapshot metadata:', {
          fromCache: snapshot.metadata.fromCache,
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
        });
        
        // Log all document IDs to see what we're getting
        if (snapshot.docs.length > 0) {
          console.log('[ClientsStore] Document IDs:', snapshot.docs.map(d => d.id));
        } else {
          console.warn('[ClientsStore] No documents found in collection. This could mean:');
          console.warn('  1. The collection is empty');
          console.warn('  2. Security rules are blocking access');
          console.warn('  3. The data is at a different path');
        }
        
        const clients: ClientResponse[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            console.log('[ClientsStore] Processing client:', doc.id, data);
            return {
              id: doc.id,
              user_id: data.user_id || userId,
              name: data.name || '',
              email: data.email || null,
              phone: data.phone || null,
              address: data.address || null,
              latitude: data.latitude || null,
              longitude: data.longitude || null,
              radius: data.radius || null,
              invoice_template_type: data.invoice_template_type || 'standard',
              created_at: data.created_at || new Date().toISOString(),
              updated_at: data.updated_at || new Date().toISOString(),
              deleted_at: data.deleted_at || null,
            };
          })
          // Filter out deleted clients (deleted_at is not null)
          .filter(client => !client.deleted_at);
        
        // Sort by name
        clients.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('[ClientsStore] Setting', clients.length, 'active clients (after filtering deleted)');
        set({ clients, isLoading: false, error: null });
      },
      (error) => {
        console.error('[ClientsStore] Subscription error:', error);
        console.error('[ClientsStore] Error code:', error.code);
        console.error('[ClientsStore] Error message:', error.message);
        console.error('[ClientsStore] Full error object:', JSON.stringify(error, null, 2));
        
        // Check for permission errors
        if (error.code === 'permission-denied') {
          console.error('[ClientsStore] PERMISSION DENIED - Check Firestore security rules!');
          console.error('[ClientsStore] User ID:', userId);
          console.error('[ClientsStore] Collection path: users/' + userId + '/clients');
        }
        
        set({ error, isLoading: false });
      }
    );
    
    // Listen to all rates
    const unsubscribeRates = onSnapshot(
      ratesRef,
      (snapshot) => {
        const rates: BillingRateResponse[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            client_id: data.client_id || '',
            rate_type: data.rate_type || 'hourly',
            amount: data.amount || 0,
            currency: data.currency || 'USD',
            is_default: data.is_default || false,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
          };
        });
        
        set({ rates });
      },
      (error) => {
        console.error('Rates subscription error:', error);
      }
    );

    return () => {
      unsubscribeClients();
      unsubscribeRates();
    };
  },

  createClient: async (userId: string, data: CreateClientRequest) => {
    const clientsRef = collection(firestore, 'users', userId, 'clients');
    const now = new Date().toISOString();
    
    const newClient = {
      user_id: userId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      radius: data.radius || 200,
      invoice_template_type: data.invoice_template_type || 'standard',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    
    const docRef = await addDoc(clientsRef, newClient);
    
    // Create default rate if provided
    if (data.default_rate_type && data.default_rate_amount) {
      const ratesRef = collection(firestore, 'users', userId, 'rates');
      await addDoc(ratesRef, {
        client_id: docRef.id,
        rate_type: data.default_rate_type,
        amount: data.default_rate_amount,
        currency: data.default_rate_currency || 'USD',
        is_default: true,
        created_at: now,
        updated_at: now,
      });
    }
    
    return {
      id: docRef.id,
      ...newClient,
    } as ClientResponse;
  },

  updateClient: async (userId: string, clientId: string, data: UpdateClientRequest) => {
    const clientRef = doc(firestore, 'users', userId, 'clients', clientId);
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (data.name !== undefined) updates.name = data.name;
    if (data.email !== undefined) updates.email = data.email;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;
    if (data.latitude !== undefined) updates.latitude = data.latitude;
    if (data.longitude !== undefined) updates.longitude = data.longitude;
    if (data.radius !== undefined) updates.radius = data.radius;
    if (data.invoice_template_type !== undefined) updates.invoice_template_type = data.invoice_template_type;
    
    await updateDoc(clientRef, updates);
  },

  deleteClient: async (userId: string, clientId: string) => {
    const clientRef = doc(firestore, 'users', userId, 'clients', clientId);
    await updateDoc(clientRef, {
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  restoreClient: async (userId: string, clientId: string) => {
    const clientRef = doc(firestore, 'users', userId, 'clients', clientId);
    await updateDoc(clientRef, {
      deleted_at: null,
      updated_at: new Date().toISOString(),
    });
  },

  createRate: async (userId: string, clientId: string, data: CreateBillingRateRequest) => {
    const ratesRef = collection(firestore, 'users', userId, 'rates');
    const now = new Date().toISOString();
    
    // If this is set as default, unmark other defaults for this client
    if (data.is_default) {
      const existingRatesQuery = query(ratesRef, where('client_id', '==', clientId));
      const snapshot = await getDocs(existingRatesQuery);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { is_default: false, updated_at: now })
      );
      await Promise.all(updates);
    }
    
    const newRate = {
      client_id: clientId,
      rate_type: data.rate_type,
      amount: data.amount,
      currency: data.currency || 'USD',
      is_default: data.is_default || false,
      created_at: now,
      updated_at: now,
    };
    
    const docRef = await addDoc(ratesRef, newRate);
    
    return {
      id: docRef.id,
      ...newRate,
    } as BillingRateResponse;
  },

  updateRate: async (userId: string, clientId: string, rateId: string, data: UpdateBillingRateRequest) => {
    const rateRef = doc(firestore, 'users', userId, 'rates', rateId);
    const now = new Date().toISOString();
    
    // If marking as default, unmark others
    if (data.is_default) {
      const ratesRef = collection(firestore, 'users', userId, 'rates');
      const existingRatesQuery = query(ratesRef, where('client_id', '==', clientId));
      const snapshot = await getDocs(existingRatesQuery);
      const updates = snapshot.docs
        .filter(doc => doc.id !== rateId)
        .map(doc => updateDoc(doc.ref, { is_default: false, updated_at: now }));
      await Promise.all(updates);
    }
    
    const updates: any = { updated_at: now };
    if (data.rate_type !== undefined) updates.rate_type = data.rate_type;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.is_default !== undefined) updates.is_default = data.is_default;
    
    await updateDoc(rateRef, updates);
  },

  deleteRate: async (userId: string, rateId: string) => {
    const rateRef = doc(firestore, 'users', userId, 'rates', rateId);
    await deleteDoc(rateRef);
  },

  getClientWithRates: (clientId: string) => {
    const { clients, rates } = get();
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;
    
    const clientRates = rates.filter(r => r.client_id === clientId);
    // Sort rates: default first, then by created_at
    clientRates.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    return { client, rates: clientRates };
  },
}));
