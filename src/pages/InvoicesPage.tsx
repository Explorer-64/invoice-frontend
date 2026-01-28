import { useState, useEffect, useMemo, useContext } from "react";
import { useCurrentUser, auth } from "app/auth";
import type {
  CreateInvoiceRequest,
  Invoice,
  InvoiceListItem,
  WorkSessionResponse,
  ClientResponse,
  ClientInvoiceColumn,
} from "types";
import { Button } from "@/components/ui/button";
import { InvoiceActionsMenu } from "components/InvoiceActionsMenu";
import { PageHeader } from "components/PageHeader";
import { CreateInvoiceDialog } from "components/CreateInvoiceDialog";
import { InvoiceDetailDialog } from "components/InvoiceDetailDialog";
import { DeleteInvoiceDialog } from "components/DeleteInvoiceDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Plus, Eye, Trash2, Share2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Translate } from "components/Translate";
import { formatDateString } from "utils/dateUtils";
import { useInvoicesStore } from "utils/useInvoicesStore";
import brain from "brain";

const InvoicesPage = () => {
  const { user, loading: authLoading } = useCurrentUser();
  const navigate = useNavigate();
  
  // Use Firestore store for invoices
  const { invoices, isLoading, subscribe, deleteInvoice, getInvoice } = useInvoicesStore();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Detail view state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);

  // Subscribe to Firestore invoices
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribe(user.uid);
    return unsubscribe;
  }, [user?.uid, subscribe]);

  // Get selected invoice from store
  const selectedInvoice = selectedInvoiceId ? getInvoice(selectedInvoiceId) : null;

  const handleViewDetails = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setDetailDialogOpen(true);
  };

  const handleRequestDeleteInvoice = (invoice: InvoiceListItem) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete || !user?.uid) return;
    try {
      setIsDeletingInvoice(true);
      await deleteInvoice(user.uid, invoiceToDelete.id);
      toast.success(`Invoice ${invoiceToDelete.invoice_number} deleted`);
      if (selectedInvoiceId === invoiceToDelete.id) {
        setDetailDialogOpen(false);
        setSelectedInvoiceId(null);
      }
    } catch (error: any) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeletingInvoice(false);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleDownloadInvoicePdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const url = `/routes/invoices/${invoiceId}/pdf`;
      const authHeader = await auth.getAuthHeaderValue();
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: authHeader,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to download PDF (${response.status})`);
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download invoice PDF:", error);
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleShareInvoice = async (invoice: Invoice) => {
    try {
      const url = `/routes/invoices/${invoice.id}/share`;
      const authHeader = await auth.getAuthHeaderValue();
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: authHeader,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to generate share link (${response.status})`);
      }
      const data = await response.json();
      const shareUrl: string = data.url;

      // Use native share API if available (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Invoice ${invoice.invoice_number}`,
            text: `View invoice ${invoice.invoice_number} for $${invoice.total.toFixed(2)}`,
            url: shareUrl,
          });
          toast.success("Invoice shared");
        } catch (shareError: any) {
          // User cancelled share or share failed
          if (shareError.name !== "AbortError") {
            console.error("Share failed:", shareError);
            toast.error("Failed to share invoice");
          }
        }
      } else {
        // Fallback for desktop: copy to clipboard and open link
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Share link copied to clipboard");
        } catch {
          toast.success("Share link ready");
        }
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error("Failed to generate share link");
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageHeader title="Invoices" subtitle="Create and manage client invoices" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4"><Translate>Please Sign In</Translate></h2>
            <p className="text-muted-foreground mb-6">
              <Translate>You need to be signed in to view and manage your invoices.</Translate>
            </p>
            <Button asChild className="w-full">
              <a href="/login"><Translate>Sign In</Translate></a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageHeader title="Invoices" subtitle="Create and manage client invoices" />
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-primary/20 rounded-full mb-4 animate-bounce"></div>
            <p className="text-lg font-medium text-muted-foreground"><Translate>Loading invoices...</Translate></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageHeader title="Invoices" subtitle="Create and manage client invoices" />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2"><Translate>Invoices</Translate></h1>
            <p className="text-muted-foreground">
              <Translate>Create and manage client invoices from your work sessions.</Translate>
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <CreateInvoiceDialog 
              open={createDialogOpen} 
              onOpenChange={setCreateDialogOpen}
            />
            <Button className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <Translate>Create Invoice</Translate>
            </Button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2"><Translate>No invoices yet</Translate></h3>
              <p className="text-muted-foreground text-center mb-4">
                <Translate>Create your first invoice from completed work sessions.</Translate>
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <Translate>Create Invoice</Translate>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <span className="truncate">{invoice.invoice_number}</span>
                        {getStatusBadge(invoice.status)}
                        {invoice.linked_packing_slip_number && (
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            🔗 {invoice.linked_packing_slip_number}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {invoice.client_name} • {formatDateString(invoice.invoice_date)}
                      </CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold">
                        ${invoice.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleViewDetails(invoice.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <Translate>Details</Translate>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleRequestDeleteInvoice(invoice)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <Translate>Delete</Translate>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <InvoiceDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          invoice={selectedInvoice}
          onDelete={(inv) => handleRequestDeleteInvoice(inv as unknown as InvoiceListItem)}
          onShare={handleShareInvoice}
          onDownload={handleDownloadInvoicePdf}
        />

        <DeleteInvoiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          invoice={invoiceToDelete}
          onConfirm={handleDeleteInvoice}
          isDeleting={isDeletingInvoice}
        />
      </main>
    </div>
  );
};

export default InvoicesPage;
