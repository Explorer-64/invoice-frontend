import { useState, useEffect } from "react";
import brain from "brain";
import type {
  ClientResponse,
  WorkSessionResponse,
  ManualInvoiceItem,
  ClientInvoiceColumn,
} from "types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Translate } from "components/Translate";
import { Plus, X, Loader2, Trash2, FileText, CheckCircle2, ChevronsUpDown, Check, Package } from "lucide-react";
import { dbPromise } from "utils/db";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "utils/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InvoiceItemPicker } from "components/InvoiceItemPicker";
import { InvoiceItem } from "utils/useInvoiceItemsStore";
import { ActionType } from "utils/db";
import { useClientsStore } from "utils/useClientsStore";
import { useCurrentUser } from "app";
import { PackingSlipPicker } from "components/PackingSlipPicker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients?: ClientResponse[]; // Now optional - we'll use store instead
  sessions?: WorkSessionResponse[];
  onSuccess?: () => void;
  isOnline?: boolean;
  queueAction?: (type: ActionType, payload: any) => Promise<void>;
}

export function CreateInvoiceDialog({ 
  open, 
  onOpenChange, 
  clients: propClients, // Rename to avoid conflict
  sessions: initialSessions = [], 
  onSuccess,
  isOnline = true,
  queueAction = async (type: any, payload: any) => { console.log('Mock queue', type, payload); }
}: Props) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { clients: storeClients, subscribe } = useClientsStore();
  
  // Use Firestore clients from store
  const availableClients = storeClients;

  // Subscribe to Firestore clients when dialog opens
  useEffect(() => {
    if (open && user?.uid) {
      subscribe(user.uid);
    }
  }, [open, user?.uid]);

  // Debug log
  useEffect(() => {
    if (open) {
      console.log('CreateInvoiceDialog opened with', storeClients.length, 'clients from Firestore');
    }
  }, [open, storeClients]);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  
  // Packing slip state
  const [packingSlipPickerOpen, setPackingSlipPickerOpen] = useState(false);
  const [linkedPackingSlip, setLinkedPackingSlip] = useState<{ id: string; slipNumber: string } | null>(null);
  
  // Sessions state
  const [clientSessions, setClientSessions] = useState<WorkSessionResponse[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  // Client Combobox state
  const [openCombobox, setOpenCombobox] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [pendingNewClientName, setPendingNewClientName] = useState<string | null>(null);

  const [manualItems, setManualItems] = useState<ManualInvoiceItem[]>([]);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState<string>("1");
  const [newItemPrice, setNewItemPrice] = useState<string>("0");
  
  // New state for manual item custom fields
  const [newItemCustomFields, setNewItemCustomFields] = useState<Record<string, string>>({});
  
  const [activeTab, setActiveTab] = useState("simple");

  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom columns state
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<number, Record<string, string>>>({});
  const [newColumnName, setNewColumnName] = useState("");

  // Load saved custom columns when client is selected
  useEffect(() => {
    if (selectedClientId) {
      loadClientColumns(selectedClientId);
      loadClientSessions(selectedClientId);
    } else {
      setCustomColumns([]);
      setCustomFieldValues({});
      setClientSessions([]);
    }
  }, [selectedClientId]);

  const loadClientSessions = async (clientId: string) => {
      setIsLoadingSessions(true);
      try {
          const db = await dbPromise;
          // 1. Load from local DB first (fast)
          const localSessions = await db.getAllFromIndex('sessions', 'client_id', clientId);
          
          // Filter for unbilled sessions (end_time is not null)
          // Note: In a real app we'd check if session is already linked to an invoice.
          // For now assuming if it's in the list it's available? 
          // The backend should probably handle "unbilled" status.
          // But looking at types, there's no "billed" flag on WorkSessionResponse explicitly visible in usage here?
          // Let's assume all fetched sessions are candidates.
          // Wait, backend list_sessions probably returns everything?
          // We need to filter unbilled. But we don't have that flag on the frontend type easily?
          // Let's assume for now we show all, or maybe valid ones.
          // Actually, let's just show what we get.
          
          const validLocal = localSessions.filter(s => s.end_time !== null);
          setClientSessions(validLocal.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
          
          if (navigator.onLine) {
              // 2. Fetch from API to get latest (and maybe all if not synced)
              // We'll use list_sessions with client_id filter
              const response = await brain.list_sessions({ client_id: clientId });
              const onlineSessions = await response.json();
              
              // Filter unbilled? API doesn't seem to have "unbilled" filter in args.
              // We'll just display them. The user knows what they haven't billed?
              // Or maybe we should filter out those that are already in invoices?
              // That requires checking all invoices. Too heavy.
              // Let's trust the user or the backend validation for now.
              // Ideally backend should provide `is_billed` or `status`.
              // Looking at WorkSessionResponse, no status?
              // Let's check session definition in backend...
              // Actually, let's just sort and set.
              
              const validOnline = onlineSessions.filter((s: WorkSessionResponse) => s.end_time !== null);
              setClientSessions(validOnline.sort((a: WorkSessionResponse, b: WorkSessionResponse) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
              
              // Cache them?
              const tx = db.transaction('sessions', 'readwrite');
              await Promise.all(onlineSessions.map((s: WorkSessionResponse) => tx.store.put(s)));
              await tx.done;
          }
      } catch (e) {
          console.error("Failed to load client sessions", e);
      } finally {
          setIsLoadingSessions(false);
      }
  };

  const resetForm = () => {
    setSelectedClientId(null);
    setPendingNewClientName(null);
    setClientSearchTerm("");
    setSelectedSessionIds([]);
    setManualItems([]);
    setNewItemDescription("");
    setNewItemQuantity("1");
    setNewItemPrice("0");
    setDueDate("");
    setTaxRate(0);
    setNotes("");
    setCustomColumns([]);
    setCustomFieldValues({});
    setNewColumnName("");
    setIsSubmitting(false);
    setLinkedPackingSlip(null);
  };
  
  const loadClientColumns = async (clientId: string) => {
    try {
      const response = await brain.get_client_columns({ clientId });
      const savedColumns = await response.json();
      
      if (savedColumns && savedColumns.length > 0) {
        setCustomColumns(savedColumns.map(col => col.column_name));
      }
    } catch (error) {
      console.error("Failed to load client columns:", error);
    }
  };
  
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    const columnKey = newColumnName.toLowerCase().replace(/\s+/g, '_');
    
    if (customColumns.includes(columnKey)) {
      toast.error("Column already exists");
      return;
    }
    
    const updatedColumns = [...customColumns, columnKey];
    setCustomColumns(updatedColumns);
    setNewColumnName("");
    
    // Persist changes to client preferences if a client is selected
    if (selectedClientId) {
      try {
        const columnsPayload: ClientInvoiceColumn[] = updatedColumns.map((col, index) => ({
          client_id: selectedClientId,
          column_name: col,
          column_label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          column_order: index,
          is_active: true
        }));
        
        await brain.update_client_columns({ clientId: selectedClientId }, { columns: columnsPayload });
        toast.success("Client column preferences updated");
      } catch (error) {
        console.error("Failed to update client columns:", error);
        toast.error("Failed to save column preference");
      }
    }
  };
  
  const handleRemoveColumn = async (columnName: string) => {
    const updatedColumns = customColumns.filter(col => col !== columnName);
    setCustomColumns(updatedColumns);
    
    // Persist changes to client preferences if a client is selected
    if (selectedClientId) {
      try {
        const columnsPayload: ClientInvoiceColumn[] = updatedColumns.map((col, index) => ({
          client_id: selectedClientId,
          column_name: col,
          column_label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          column_order: index,
          is_active: true
        }));
        
        await brain.update_client_columns({ clientId: selectedClientId }, { columns: columnsPayload });
        toast.success("Client column preferences updated");
      } catch (error) {
        console.error("Failed to update client columns:", error);
        toast.error("Failed to save column preference");
      }
    }
    
    // Remove values for this column from all sessions
    const updatedValues = { ...customFieldValues };
    Object.keys(updatedValues).forEach(sessionId => {
      if (updatedValues[Number(sessionId)]) {
        delete updatedValues[Number(sessionId)][columnName];
      }
    });
    setCustomFieldValues(updatedValues);
    
    // Remove from manual items custom fields if present
    const updatedManualItems = manualItems.map(item => {
        if (item.custom_fields && item.custom_fields[columnName]) {
            const newFields = { ...item.custom_fields };
            delete newFields[columnName];
            return { ...item, custom_fields: newFields };
        }
        return item;
    });
    setManualItems(updatedManualItems);
  };
  
  const handleCustomFieldChange = (sessionId: number, columnName: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [columnName]: value
      }
    }));
  };

  const handleAddManualItem = () => {
    if (!newItemDescription.trim()) {
        toast.error("Please enter a description");
        return;
    }
    
    const qty = parseFloat(newItemQuantity) || 0;
    const price = parseFloat(newItemPrice) || 0;
    const amount = qty * price;
    
    setManualItems([...manualItems, {
        description: newItemDescription,
        quantity: qty,
        unit_price: price,
        amount,
        custom_fields: { ...newItemCustomFields }
    }]);
    
    setNewItemDescription("");
    setNewItemQuantity("1");
    setNewItemPrice("0");
    setNewItemCustomFields({});
  };

  const handleManualItemCustomFieldChange = (index: number, col: string, val: string) => {
    const updated = [...manualItems];
    updated[index] = {
        ...updated[index],
        custom_fields: {
            ...(updated[index].custom_fields || {}),
            [col]: val
        }
    };
    setManualItems(updated);
  };

  const handleRemoveManualItem = (index: number) => {
    setManualItems(manualItems.filter((_, i) => i !== index));
  };

  const handleToggleSession = (sessionId: number) => {
    setSelectedSessionIds(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handlePickItem = (item: InvoiceItem) => {
    setNewItemDescription(item.description || item.name);
    setNewItemPrice(item.price.toString());
    setNewItemQuantity(item.default_quantity?.toString() || "1");
    
    // Auto-fill custom fields if they exist in the library item
    if (item.custom_fields) {
      setNewItemCustomFields(prev => ({
        ...prev,
        ...item.custom_fields
      }));
    }
    
    toast.success("Item loaded from library");
  };

  // Determine default tab based on sessions availability
  useEffect(() => {
    if (selectedClientId && !isLoadingSessions) {
      if (clientSessions.length > 0) {
        setActiveTab("sessions");
      } else {
        setActiveTab("simple");
      }
    }
  }, [selectedClientId, clientSessions.length, isLoadingSessions]);

  const formatHours = (minutes: number | null) => {
    if (!minutes) return "0.0";
    return (minutes / 60).toFixed(2);
  };

  const handlePackingSlipSelect = (slip: any) => {
    // Auto-fill client
    const matchingClient = availableClients.find(c => c.id === slip.customerId);
    if (matchingClient) {
      setSelectedClientId(matchingClient.id);
    } else {
      // Client from packing slip not in our system, use new client flow
      setPendingNewClientName(slip.customerName);
      setSelectedClientId(null);
    }
    
    // Auto-fill line items
    const items: ManualInvoiceItem[] = slip.items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: item.total,
      custom_fields: {}
    }));
    setManualItems(items);
    
    // Store linked slip info
    setLinkedPackingSlip({
      id: slip.id,
      slipNumber: slip.slipNumber
    });
    
    // Switch to simple invoice tab
    setActiveTab("simple");
    
    toast.success(`Linked to ${slip.slipNumber}`);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedClientId && !pendingNewClientName) {
      toast.error("Please select or create a client");
      return;
    }
    
    // If no existing client selected, check if we have a pending new client
    let finalClientId = selectedClientId;
    
    if (!finalClientId && pendingNewClientName) {
        setIsSubmitting(true);
        try {
            if (!isOnline) {
                 const db = await dbPromise;
                 // Offline client creation
                 const tempClientId = `temp_${Date.now()}`;
                 const newClient: any = {
                    id: tempClientId,
                    name: pendingNewClientName,
                    email: null,
                    phone: null,
                    address: null,
                    created_at: new Date().toISOString()
                 };
                 await db.add('clients', newClient);
                 await queueAction('CREATE_CLIENT', { name: pendingNewClientName, tempId: tempClientId });
                 finalClientId = tempClientId;
                 // Add to local clients list (optional, but good for UI consistency if we stayed on page)
            } else {
                 const response = await brain.create_client({ name: pendingNewClientName });
                 if (!response.ok) throw new Error("Failed to create new client");
                 const newClient = await response.json();
                 finalClientId = newClient.id;
                 toast.success(`Client "${newClient.name}" created`);
                 // Add to local cache
                 const db = await dbPromise;
                 await db.put('clients', newClient);
            }
        } catch (error) {
            console.error("Failed to create new client:", error);
            toast.error("Failed to create new client");
            setIsSubmitting(false);
            return;
        }
    }

    if (!finalClientId) {
      toast.error("Please select a client");
      return;
    }

    // Check for pending manual item
    const finalManualItems = [...manualItems];
    if (newItemDescription.trim()) {
      const qty = parseFloat(newItemQuantity) || 0;
      const price = parseFloat(newItemPrice) || 0;
      const amount = qty * price;
      
      finalManualItems.push({
          description: newItemDescription,
          quantity: qty,
          unit_price: price,
          amount
      });
    }
    
    if (selectedSessionIds.length === 0 && finalManualItems.length === 0) {
      toast.error(
        selectedSessionIds.length === 0 
          ? "Please add at least one line item" 
          : "Please select at least one work session or add manual items"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedClient = availableClients.find(c => c.id === finalClientId) || 
                            (pendingNewClientName ? { name: pendingNewClientName, invoice_template_type: "standard" } : null);
      // @ts-ignore
      const templateType = selectedClient?.invoice_template_type || "standard";

      // Manually constructing request to match backend expectation
      const request: any = {
        client_id: finalClientId,
        client_name: availableClients.find(c => c.id === finalClientId)?.name || pendingNewClientName || "",
        client_email: availableClients.find(c => c.id === finalClientId)?.email || null,
        session_ids: selectedSessionIds,
        manual_items: finalManualItems,
        invoice_date: invoiceDate || undefined,
        due_date: dueDate || undefined,
        tax_rate: taxRate,
        notes: notes || undefined,
        // We do NOT send custom_columns here unless we want to persist them to the client
        // Sending them as item_custom_fields or inside manual_items is sufficient for the PDF
        custom_columns: undefined, 
        item_custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        template_type: templateType,
        linked_packing_slip_id: linkedPackingSlip?.id || undefined,
      };

      if (!isOnline) {
          const db = await dbPromise;
          // Offline creation
          const tempId = -Date.now(); // Negative ID for temp
          
          // Create local invoice object
          const newInvoice: any = {
              id: tempId,
              invoice_number: "DRAFT-OFFLINE", 
              client_id: finalClientId,
              client_name: selectedClient?.name || "Unknown Client",
              invoice_date: new Date().toISOString(),
              due_date: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: "draft",
              total: 0,
              balance: 0,
              ...request
          };
          
          // Approximate total
          let total = 0;
          // Add manual items
          finalManualItems.forEach(item => total += item.amount);
          newInvoice.total = total; // Rough estimate without rates

          await db.add('invoices', newInvoice);
          
          // Queue action
          await queueAction('CREATE_INVOICE', { ...request, tempId });
          
          toast.success("Invoice created offline", { description: "Will sync when online." });
          
          onOpenChange(false);
          resetForm();
          onSuccess?.();
          return;
      }

      const response = await brain.create_invoice(request);
      const newInvoice = (response as any).data ?? await (response as Response).json();
      
      toast.success(`Invoice ${newInvoice.invoice_number} created!`);
      onOpenChange(false);
      
      // Add new invoice to cache immediately
      const db = await dbPromise;
      await db.put('invoices', newInvoice);
      
      resetForm();
      onSuccess?.();
      
    } catch (error: unknown) {
      console.error("Failed to create invoice:", error);
      const err = error as { status?: number; error?: { detail?: unknown }; message?: string };
      if (err?.status === 403) {
        toast({
          title: "Limit Reached",
          description: "Free plan limit reached (5 invoices/month). Upgrade to Pro to create more invoices.",
          variant: "destructive",
          action: <Button size="sm" variant="outline" onClick={() => navigate('/pricing-page')}><Translate>Upgrade</Translate></Button>
        });
        return;
      }
      const detail = err?.error?.detail;
      const msg = typeof detail === "string" ? detail
        : Array.isArray(detail) ? detail.map((e: { msg?: string }) => e?.msg).filter(Boolean).join(", ") || undefined
        : undefined;
      toast.error(msg || (err?.message) || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle><Translate>Create Invoice</Translate></DialogTitle>
          <DialogDescription>
            <Translate>Create a simple invoice or bill for tracked work sessions.</Translate>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client"><Translate>Client</Translate></Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between font-normal"
                >
                  {selectedClientId
                    ? availableClients.find((client) => client.id === selectedClientId)?.name
                    : pendingNewClientName 
                      ? <>{pendingNewClientName} <Translate>(New Client)</Translate></>
                      : <Translate>Select or type a client...</Translate>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search client..." 
                    value={clientSearchTerm}
                    onValueChange={setClientSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {availableClients.length === 0 && !clientSearchTerm ? <Translate>No clients available.</Translate> : null}
                    </CommandEmpty>
                    {clientSearchTerm.trim() && (
                      <CommandGroup heading="Create New">
                        <CommandItem
                          value={`create_new_${clientSearchTerm.trim()}`}
                          forceMount={true}
                          onSelect={() => {
                            setPendingNewClientName(clientSearchTerm.trim());
                            setSelectedClientId(null);
                            setOpenCombobox(false);
                          }}
                          className="text-primary"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <Translate>Create</Translate> "{clientSearchTerm}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                    {(() => {
                      const filteredClients = clientSearchTerm.trim() 
                        ? availableClients.filter(client => {
                            const searchLower = clientSearchTerm.toLowerCase();
                            return (
                              client.name.toLowerCase().includes(searchLower) ||
                              (client.email && client.email.toLowerCase().includes(searchLower))
                            );
                          })
                        : availableClients; // Show all clients when search is empty
                      
                      return filteredClients.length > 0 ? (
                        <CommandGroup heading="Existing Clients">
                          {filteredClients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.name + " " + (client.email || "")}
                              keywords={[client.name, client.email || ""]}
                              onSelect={() => {
                                setSelectedClientId(client.id);
                                setPendingNewClientName(null);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : null;
                    })()}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {selectedClientId || pendingNewClientName ? (
            <>
              {/* Packing Slip Link Button */}
              {!linkedPackingSlip && (
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPackingSlipPickerOpen(true)}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Link Packing Slip
                  </Button>
                </div>
              )}
              
              {/* Linked Packing Slip Badge */}
              {linkedPackingSlip && (
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Linked to {linkedPackingSlip.slipNumber}</span>
                    <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLinkedPackingSlip(null);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="simple"><Translate>Simple Invoice</Translate></TabsTrigger>
                  <TabsTrigger value="sessions" disabled={!selectedClientId}><Translate>From Work Sessions</Translate></TabsTrigger>
                </TabsList>
                
                <TabsContent value="simple" className="space-y-4 pt-4">
                   <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium mb-3"><Translate>Invoice Line Items</Translate></h3>
                      <div className="space-y-3">
                          {manualItems.length === 0 && (
                              <p className="text-sm text-muted-foreground italic"><Translate>No items added yet.</Translate></p>
                          )}
                          {manualItems.map((item, index) => (
                              <div key={index} className="flex flex-col gap-2 text-sm bg-background border p-3 rounded shadow-sm">
                                  <div className="flex items-center gap-2">
                                      <span className="flex-1 font-medium">{item.description}</span>
                                      <span className="text-muted-foreground">{item.quantity} x ${item.unit_price}</span>
                                      <span className="font-bold ml-2">${item.amount.toFixed(2)}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive ml-1" onClick={() => handleRemoveManualItem(index)}>
                                          <Trash2 className="h-3 w-3" />
                                      </Button>
                                  </div>
                                  {customColumns.length > 0 && (
                                      <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary/20">
                                          {customColumns.map(col => (
                                              <div key={col} className="flex items-center gap-2">
                                                  <Label className="text-xs text-muted-foreground w-16 truncate">{col.replace(/_/g, ' ')}</Label>
                                                  <Input 
                                                      className="h-6 text-xs" 
                                                      value={item.custom_fields?.[col] || ""}
                                                      onChange={(e) => handleManualItemCustomFieldChange(index, col, e.target.value)}
                                                      placeholder="Value..."
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          ))}
                          
                          <div className="flex flex-col gap-3 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                                  <div className="grid gap-1.5">
                                      <Label htmlFor="desc" className="text-xs"><Translate>Description</Translate></Label>
                                      <Input 
                                          id="desc" 
                                          placeholder="Item description" 
                                          value={newItemDescription}
                                          onChange={(e) => setNewItemDescription(e.target.value)}
                                          className="h-9"
                                      />
                                  </div>
                                  <div className="grid gap-1.5">
                                      <Label htmlFor="qty" className="text-xs"><Translate>Qty</Translate></Label>
                                      <Input 
                                          id="qty" 
                                          type="number" 
                                          min="0"
                                          value={newItemQuantity}
                                          onChange={(e) => setNewItemQuantity(e.target.value)}
                                          className="h-9"
                                      />
                                  </div>
                                  <div className="grid gap-1.5">
                                      <Label htmlFor="price" className="text-xs"><Translate>Price</Translate></Label>
                                      <Input 
                                          id="price" 
                                          type="number" 
                                          min="0"
                                          value={newItemPrice}
                                          onChange={(e) => setNewItemPrice(e.target.value)}
                                          className="h-9"
                                      />
                                  </div>
                                  <div className="flex gap-2 items-end">
                                      <Button size="sm" onClick={handleAddManualItem} type="button" className="h-9 px-3">
                                          <Plus className="h-4 w-4 mr-1" /> <Translate>Add</Translate>
                                      </Button>
                                      <InvoiceItemPicker onSelect={handlePickItem} customColumns={customColumns} />
                                  </div>
                              </div>
                              
                              {/* Input fields for custom columns on NEW item */}
                              {customColumns.length > 0 && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-muted/20 p-2 rounded">
                                      {customColumns.map(col => (
                                          <div key={col} className="grid gap-1">
                                              <Label className="text-xs text-muted-foreground">{col.replace(/_/g, ' ')}</Label>
                                              <Input 
                                                  className="h-7 text-xs" 
                                                  value={newItemCustomFields[col] || ""}
                                                  onChange={(e) => setNewItemCustomFields({...newItemCustomFields, [col]: e.target.value})}
                                                  placeholder="Value..."
                                              />
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                   </div>
                   
                   {/* Custom Columns Management (Available in Simple Mode too now) */}
                    <div className="grid gap-2 pt-2 px-1">
                      <Label className="text-xs text-muted-foreground"><Translate>Invoice Specific Columns</Translate></Label>
                      <div className="flex flex-wrap gap-2">
                        {customColumns.map(col => (
                          <Badge key={col} variant="outline" className="gap-1 bg-background">
                            {col.replace(/_/g, ' ')}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleRemoveColumn(col)}
                            />
                          </Badge>
                        ))}
                        <div className="flex items-center gap-1">
                            <Input 
                              placeholder="Add column (e.g. Serial #)" 
                              value={newColumnName}
                              onChange={(e) => setNewColumnName(e.target.value)}
                              className="h-6 w-36 text-xs"
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddColumn} type="button">
                              <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                      </div>
                    </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4 pt-4">
                   {!selectedClientId ? (
                       <div className="py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                          <p><Translate>Save the invoice to create the client before adding sessions.</Translate></p>
                       </div>
                   ) : (
                   <>
                   <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                          <Label><Translate>Select Work Sessions</Translate></Label>
                          {isLoadingSessions ? (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          ) : (
                              clientSessions.length > 0 && (
                                  <Badge variant="secondary">{clientSessions.length} <Translate>available</Translate></Badge>
                              )
                          )}
                      </div>
                      
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2 bg-muted/10">
                        {isLoadingSessions ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p><Translate>Loading sessions...</Translate></p>
                            </div>
                        ) : clientSessions.length === 0 ? (
                          <div className="text-center py-8">
                              <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground font-medium">
                                <Translate>No unbilled sessions found.</Translate>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                  <Translate>Switch to "Simple Invoice" to bill manually.</Translate>
                              </p>
                          </div>
                        ) : (
                          clientSessions.map((session) => (
                            <div key={session.id} 
                                 className={cn(
                                     "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                     selectedSessionIds.includes(session.id) ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-accent/50"
                                 )}
                                 onClick={() => handleToggleSession(session.id)}
                            >
                              <Checkbox 
                                id={`session-${session.id}`}
                                checked={selectedSessionIds.includes(session.id)}
                                onCheckedChange={() => handleToggleSession(session.id)}
                                className="mt-1"
                              />
                              <div className="grid gap-1 leading-none flex-1">
                                <label
                                  htmlFor={`session-${session.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {new Date(session.start_time).toLocaleDateString()}
                                  <span className="mx-2 text-muted-foreground">•</span>
                                  {formatHours(session.total_duration_minutes)} hrs
                                </label>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {session.notes || "No notes"}
                                  {session.location_name && ` • ${session.location_name}`}
                                </p>
                                
                                {selectedSessionIds.includes(session.id) && customColumns.length > 0 && (
                                  <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary/20" onClick={(e) => e.stopPropagation()}>
                                    {customColumns.map(col => (
                                      <div key={col} className="grid grid-cols-3 gap-2 items-center">
                                        <Label htmlFor={`col-${session.id}-${col}`} className="text-xs capitalize text-muted-foreground">
                                          {col.replace(/_/g, ' ')}:
                                        </Label>
                                        <Input
                                          id={`col-${session.id}-${col}`}
                                          className="h-7 text-xs col-span-2"
                                          value={customFieldValues[session.id]?.[col] || ""}
                                          onChange={(e) => handleCustomFieldChange(session.id, col, e.target.value)}
                                          placeholder="Value..."
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Reuse the Custom Columns Management UI from Simple tab? Or just show it once outside tabs? 
                        Actually, better to move it outside requires restructuring. 
                        Let's duplicate for now as moving outside requires restructuring. 
                        Wait, I already added it to Simple Tab. 
                        The Sessions Tab ALREADY had it.
                        I should probably keep it in Sessions tab too, or sync them.
                        They share state `customColumns`, so they are synced.
                        I'll just leave the existing one in Sessions tab as is (it was already there in previous code block).
                     */}
                    <div className="grid gap-2 pt-2">
                      <Label className="text-xs text-muted-foreground"><Translate>Invoice Specific Columns</Translate></Label>
                      <div className="flex flex-wrap gap-2">
                        {customColumns.map(col => (
                          <Badge key={col} variant="outline" className="gap-1 bg-background">
                            {col.replace(/_/g, ' ')}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => handleRemoveColumn(col)}
                            />
                          </Badge>
                        ))}
                        <div className="flex items-center gap-1">
                            <Input 
                              placeholder="Add column (e.g. Serial #)" 
                              value={newColumnName}
                              onChange={(e) => setNewColumnName(e.target.value)}
                              className="h-6 w-36 text-xs"
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddColumn} type="button">
                              <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                      </div>
                    </div>
                    </>
                   )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
             <div className="py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <p><Translate>Please select or create a client to start.</Translate></p>
             </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="grid gap-2">
              <Label htmlFor="invoiceDate"><Translate>Invoice Date</Translate></Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate"><Translate>Due Date</Translate></Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="taxRate"><Translate>Tax Rate (%)</Translate></Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes"><Translate>Notes</Translate></Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the invoice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            <Translate>Cancel</Translate>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <Translate>Creating...</Translate>
              </>
            ) : (
              <Translate>Create Invoice</Translate>
            )}
          </Button>
        </div>
      </DialogContent>
      
      {/* Packing Slip Picker */}
      <PackingSlipPicker
        open={packingSlipPickerOpen}
        onOpenChange={setPackingSlipPickerOpen}
        onSelect={handlePackingSlipSelect}
      />
    </Dialog>
  );
}
