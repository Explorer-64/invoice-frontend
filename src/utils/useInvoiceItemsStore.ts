import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { firestore } from 'app/auth';

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number; // Renamed from unit_price to match StackApps standard
  imageUrl?: string; // StackApps standard field
  default_quantity?: number; // App-specific extension
  category?: string; // App-specific extension
  userId: string;
  createdAt: string;
  custom_fields?: Record<string, string>; // App-specific extension
}

interface InvoiceItemsState {
  items: InvoiceItem[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  
  subscribe: (userId: string) => void;
  addItem: (item: Omit<InvoiceItem, 'id' | 'createdAt' | 'userId'>, userId: string) => Promise<void>;
  updateItem: (id: string, item: Partial<InvoiceItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  importItems: (items: Omit<InvoiceItem, 'id' | 'createdAt' | 'userId'>[], userId: string) => Promise<void>;
}

export const useInvoiceItemsStore = create<InvoiceItemsState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  subscribe: (userId: string) => {
    // Unsubscribe from previous subscription if exists
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) {
      currentUnsub();
    }

    set({ isLoading: true });

    try {
      const q = query(
        collection(firestore, 'users', userId, 'items'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const items: InvoiceItem[] = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as InvoiceItem);
          });
          // Sort by name
          items.sort((a, b) => a.name.localeCompare(b.name));
          set({ items, isLoading: false, error: null });
        },
        (error) => {
          console.error("Error fetching invoice items:", error);
          set({ error: error.message, isLoading: false });
        }
      );

      set({ unsubscribe });
    } catch (err: any) {
      console.error("Failed to subscribe to invoice items:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (itemData, userId) => {
    try {
      await addDoc(collection(firestore, 'users', userId, 'items'), {
        ...itemData,
        userId,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error adding invoice item:", error);
      throw error;
    }
  },

  updateItem: async (id, itemData) => {
    try {
      // Need userId to construct path - get it from current items
      const currentItems = get().items;
      const item = currentItems.find(i => i.id === id);
      if (!item) {
        throw new Error('Item not found in store');
      }
      const docRef = doc(firestore, 'users', item.userId, 'items', id);
      await updateDoc(docRef, itemData);
    } catch (error: any) {
      console.error("Error updating invoice item:", error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      // Need userId to construct path - get it from current items
      const currentItems = get().items;
      const item = currentItems.find(i => i.id === id);
      if (!item) {
        throw new Error('Item not found in store');
      }
      await deleteDoc(doc(firestore, 'users', item.userId, 'items', id));
    } catch (error: any) {
      console.error("Error deleting invoice item:", error);
      throw error;
    }
  },

  importItems: async (itemsData, userId) => {
    try {
      const batch = writeBatch(firestore);
      const collectionRef = collection(firestore, 'users', userId, 'items');
      const now = new Date().toISOString();

      itemsData.forEach(item => {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...item,
          userId,
          createdAt: now
        });
      });

      await batch.commit();
    } catch (error: any) {
      console.error("Error importing invoice items:", error);
      throw error;
    }
  }
}));
