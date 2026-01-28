import { create } from 'zustand';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { firestore } from 'app';
import { Invoice, InvoiceListItem, CreateInvoiceRequest, UpdateInvoiceRequest } from 'types';

interface InvoicesState {
  invoices: InvoiceListItem[];
  isLoading: boolean;
  error: Error | null;
  
  // Initialization
  subscribe: (userId: string) => () => void;
  
  // Actions
  createInvoice: (userId: string, data: CreateInvoiceRequest) => Promise<string>;
  updateInvoice: (userId: string, invoiceId: string, data: UpdateInvoiceRequest) => Promise<void>;
  deleteInvoice: (userId: string, invoiceId: string) => Promise<void>;
  
  // Helpers
  getInvoice: (invoiceId: string) => InvoiceListItem | null;
}

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: [],
  isLoading: true,
  error: null,

  subscribe: (userId: string) => {
    if (!userId) {
      set({ isLoading: false });
      return () => {};
    }

    set({ isLoading: true, error: null });

    const invoicesRef = collection(firestore, 'users', userId, 'invoices');
    
    // Listen to all non-deleted invoices
    const unsubscribe = onSnapshot(
      query(invoicesRef, where('deleted_at', '==', null)),
      (snapshot) => {
        const invoices: InvoiceListItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            invoice_number: data.invoice_number || '',
            client_id: data.client_id || '',
            client_name: data.client_name || 'Unknown',
            invoice_date: data.invoice_date || new Date().toISOString().split('T')[0],
            due_date: data.due_date || null,
            total: data.total || 0,
            status: data.status || 'draft',
            created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(),
            linked_packing_slip_number: data.linked_packing_slip_number || null
          };
        });
        
        // Sort by created_at descending
        invoices.sort((a, b) => {
          const dateA = a.created_at instanceof Date ? a.created_at.getTime() : 0;
          const dateB = b.created_at instanceof Date ? b.created_at.getTime() : 0;
          return dateB - dateA;
        });
        
        set({ invoices, isLoading: false, error: null });
      },
      (error) => {
        console.error('Error subscribing to invoices:', error);
        set({ error, isLoading: false });
      }
    );
    
    return unsubscribe;
  },

  createInvoice: async (userId: string, data: CreateInvoiceRequest) => {
    const invoicesRef = collection(firestore, 'users', userId, 'invoices');
    const docRef = doc(invoicesRef);
    
    // Calculate totals
    const subtotal = data.manual_items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (data.tax_rate || 0);
    const total = subtotal + taxAmount;
    
    // Generate invoice number (simple approach for now)
    const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const prefix = `INV-${currentMonth}-`;
    const count = get().invoices.filter(inv => inv.invoice_number.startsWith(prefix)).length;
    const invoiceNumber = `${prefix}${String(count + 1).padStart(3, '0')}`;
    
    await setDoc(docRef, {
      invoice_number: invoiceNumber,
      client_id: data.client_id,
      client_name: data.client_name,
      invoice_date: data.invoice_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date || null,
      subtotal,
      tax_rate: data.tax_rate || 0,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      notes: data.notes || '',
      items: data.manual_items.map(item => ({
        session_id: null,
        description: item.description,
        hours: item.quantity,
        rate: item.unit_price,
        amount: item.amount,
        custom_fields: item.custom_fields || {}
      })),
      created_at: Timestamp.now(),
      deleted_at: null,
      template_type: 'standard',
      share_token: null,
      linked_packing_slip_id: data.linked_packing_slip_id || null,
      linked_packing_slip_number: data.linked_packing_slip_number || null
    });
    
    // If linked to packing slip, mark it as linked
    if (data.linked_packing_slip_id) {
      const slipRef = doc(firestore, 'users', userId, 'packing_slips', data.linked_packing_slip_id);
      await updateDoc(slipRef, {
        linkedInvoiceId: docRef.id,
        invoicedAt: Timestamp.now(),
        invoiceStatus: 'linked'
      });
    }
    
    return docRef.id;
  },

  updateInvoice: async (userId: string, invoiceId: string, data: UpdateInvoiceRequest) => {
    const invoiceRef = doc(firestore, 'users', userId, 'invoices', invoiceId);
    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(invoiceRef, updateData);
    }
  },

  deleteInvoice: async (userId: string, invoiceId: string) => {
    const invoiceRef = doc(firestore, 'users', userId, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
      deleted_at: Timestamp.now()
    });
  },

  getInvoice: (invoiceId: string) => {
    return get().invoices.find(inv => inv.id === invoiceId) || null;
  }
}));
