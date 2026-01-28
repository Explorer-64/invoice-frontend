import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Trash2, Pencil, Check, X } from "lucide-react";
import type { Invoice, ClientResponse, BusinessProfile } from "types";
import { useEffect, useState } from "react";
import brain from "brain";
import { useUserGuardContext } from "app";
import { Link } from "react-router-dom";
import { formatDateString } from "utils/dateUtils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { dbPromise } from "utils/db";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  loading?: boolean;
  clients?: ClientResponse[];
  onDelete: (invoice: Invoice) => void;
  onShare?: (invoice: Invoice) => void;
  onDownload?: (invoiceId: string, invoiceNumber: string) => void;
  onUpdate?: () => void
}

export function InvoiceDetailDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  loading = false, 
  clients = [],
  onDelete, 
  onShare, 
  onDownload,
  onUpdate
}: Props) {
  const { user } = useUserGuardContext();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isEditingInvoiceDate, setIsEditingInvoiceDate] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  
  // Sync local state when invoice prop changes
  useEffect(() => {
    if (invoice) {
      setInvoiceDate(invoice.invoice_date);
      setDueDate(invoice.due_date || null);
    }
  }, [invoice]);
  
  useEffect(() => {
    if (open) {
      // Fetch business profile when dialog opens
      const fetchProfile = async () => {
        try {
          const res = await brain.get_business_profile();
          const data = await res.json();
          setBusinessProfile(data);
        } catch (error) {
          console.error('Failed to fetch business profile:', error);
        }
      };
      fetchProfile();
    }
  }, [open]);
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      sent: "default",
      paid: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleSaveInvoiceDate = async () => {
    if (!invoice || !invoiceDate) return;
    
    try {
      const response = await brain.update_invoice(
        { invoiceId: String(invoice.id) },
        { invoice_date: invoiceDate }
      );
      
      if (response.ok) {
        const updatedInvoice = await response.json();
        
        // Update IndexedDB
        const db = await dbPromise;
        const localInvoice = await db.get('invoices', invoice.id);
        if (localInvoice) {
          localInvoice.invoice_date = invoiceDate;
          await db.put('invoices', localInvoice);
        }
        
        toast.success("Invoice date updated");
        setIsEditingInvoiceDate(false);
        
        // Update the invoice prop by triggering parent refresh
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to update invoice date:", error);
      toast.error("Failed to update invoice date");
    }
  };

  const handleSaveDueDate = async () => {
    if (!invoice) return;
    
    try {
      const response = await brain.update_invoice(
        { invoiceId: String(invoice.id) },
        { due_date: dueDate }
      );
      
      if (response.ok) {
        const updatedInvoice = await response.json();
        
        // Update IndexedDB
        const db = await dbPromise;
        const localInvoice = await db.get('invoices', invoice.id);
        if (localInvoice) {
          localInvoice.due_date = dueDate;
          await db.put('invoices', localInvoice);
        }
        
        toast.success("Due date updated");
        setIsEditingDueDate(false);
        
        // Update the invoice prop by triggering parent refresh
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to update due date:", error);
      toast.error("Failed to update due date");
    }
  };

  const handleCancelInvoiceDate = () => {
    setInvoiceDate(invoice?.invoice_date || null);
    setIsEditingInvoiceDate(false);
  };

  const handleCancelDueDate = () => {
    setDueDate(invoice?.due_date || null);
    setIsEditingDueDate(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            {invoice 
              ? `Invoice ${invoice.invoice_number} for ${invoice.client_name}` 
              : "View details for the selected invoice."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading invoice details...</p>
            </div>
          ) : invoice && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    {!isEditingInvoiceDate && (
                      <button
                        onClick={() => setIsEditingInvoiceDate(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditingInvoiceDate ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="date"
                        value={invoiceDate || ""}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={handleSaveInvoiceDate}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={handleCancelInvoiceDate}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium">{formatDateString(invoice.invoice_date)}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    {!isEditingDueDate && (
                      <button
                        onClick={() => setIsEditingDueDate(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditingDueDate ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="date"
                        value={dueDate || ""}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={handleSaveDueDate}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={handleCancelDueDate}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium">{invoice.due_date ? formatDateString(invoice.due_date) : '-'}</p>
                  )}
                </div>
              </div>
              
              {/* Bill From / Bill To */}
              <div className="grid grid-cols-2 gap-6 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Bill From</h3>
                    <Link to="/settings-page?tab=business" className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <p className="font-medium">
                    {businessProfile?.company_name || user?.displayName || user?.email || 'Your Business Name'}
                  </p>
                  {(businessProfile?.address || businessProfile?.email || businessProfile?.phone) && (
                    <>
                      {businessProfile?.address && (
                        <p className="text-sm text-muted-foreground">{businessProfile.address}</p>
                      )}
                      {businessProfile?.email && (
                        <p className="text-sm text-muted-foreground">{businessProfile.email}</p>
                      )}
                      {businessProfile?.phone && (
                        <p className="text-sm text-muted-foreground">{businessProfile.phone}</p>
                      )}
                    </>
                  )}
                  {!businessProfile?.company_name && user?.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Bill To</h3>
                    <Link to="/clients-page" className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <p className="font-medium">{invoice.client_name}</p>
                  {clients.find(c => c.id === invoice.client_id) && (
                    <>
                      {clients.find(c => c.id === invoice.client_id)?.email && (
                        <p className="text-sm text-muted-foreground">
                          {clients.find(c => c.id === invoice.client_id)?.email}
                        </p>
                      )}
                      {clients.find(c => c.id === invoice.client_id)?.phone && (
                        <p className="text-sm text-muted-foreground">
                          {clients.find(c => c.id === invoice.client_id)?.phone}
                        </p>
                      )}
                      {clients.find(c => c.id === invoice.client_id)?.address && (
                        <p className="text-sm text-muted-foreground">
                          {clients.find(c => c.id === invoice.client_id)?.address}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-3">Line Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium whitespace-nowrap">Description</th>
                          {(() => {
                            // Get all unique custom field keys from all items
                            const customFieldKeys = new Set<string>();
                            (invoice.items || []).forEach(item => {
                              if (item.custom_fields) {
                                Object.keys(item.custom_fields).forEach(key => customFieldKeys.add(key));
                              }
                            });
                            return Array.from(customFieldKeys).map(key => (
                              <th key={key} className="text-right p-3 text-sm font-medium whitespace-nowrap">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </th>
                            ));
                          })()}
                          <th className="text-right p-3 text-sm font-medium whitespace-nowrap">Qty</th>
                          <th className="text-right p-3 text-sm font-medium whitespace-nowrap">Rate</th>
                          <th className="text-right p-3 text-sm font-medium whitespace-nowrap">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(invoice.items || []).map((item, index) => {
                          // Get all unique custom field keys from all items
                          const customFieldKeys = new Set<string>();
                          (invoice.items || []).forEach(i => {
                            if (i.custom_fields) {
                              Object.keys(i.custom_fields).forEach(key => customFieldKeys.add(key));
                            }
                          });
                          
                          return (
                            <tr key={index}>
                              <td className="p-3 text-sm min-w-[200px]">{item.description}</td>
                              {Array.from(customFieldKeys).map(key => (
                                <td key={key} className="p-3 text-sm text-right whitespace-nowrap">
                                  {item.custom_fields?.[key] || '-'}
                                </td>
                              ))}
                              <td className="p-3 text-sm text-right whitespace-nowrap">{item.hours?.toFixed(2) || '0.00'}</td>
                              <td className="p-3 text-sm text-right whitespace-nowrap">${item.rate?.toFixed(2) || '0.00'}</td>
                              <td className="p-3 text-sm text-right font-medium whitespace-nowrap">${item.amount?.toFixed(2) || '0.00'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-medium">${(invoice.subtotal ?? 0).toFixed(2)}</span>
                </div>
                {(invoice.tax_amount ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Tax ({(invoice.tax_rate ?? 0).toFixed(1)}%)</span>
                    <span className="text-sm font-medium">${(invoice.tax_amount ?? 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${(invoice.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Notes */}
              {invoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => onShare?.(invoice)}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={() => onDownload?.(String(invoice.id), invoice.invoice_number)}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(invoice)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
