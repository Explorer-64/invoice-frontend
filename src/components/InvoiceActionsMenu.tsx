import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Printer, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { InvoiceListItem } from "types";
import { formatDateString } from "utils/dateUtils";

interface Props {
  invoices: InvoiceListItem[];
  onDownloadPDF: (invoiceId: number, invoiceNumber: string) => Promise<void>;
}

export function InvoiceActionsMenu({ invoices, onDownloadPDF }: Props) {
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const headers = ["Invoice Number", "Date", "Client", "Status", "Total"];
    const rows = invoices.map(invoice => [
      invoice.invoice_number,
      new Date(invoice.invoice_date).toLocaleDateString(),
      invoice.client_name,
      invoice.status.toUpperCase(),
      invoice.total.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Invoices exported to CSV");
  };

  const handleSelectInvoice = (invoice: InvoiceListItem) => {
    setOpenPrintDialog(false);
    onDownloadPDF(invoice.id, invoice.invoice_number);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Actions <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileText className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPrintDialog(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Quick Print Invoice...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandDialog open={openPrintDialog} onOpenChange={setOpenPrintDialog}>
        <CommandInput placeholder="Search invoice number or client..." />
        <CommandList>
          <CommandEmpty>No invoice found.</CommandEmpty>
          <CommandGroup heading="Invoices">
            {invoices.map((invoice) => (
              <CommandItem
                key={invoice.id}
                value={`${invoice.invoice_number} ${invoice.client_name}`}
                onSelect={() => handleSelectInvoice(invoice)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col ml-2">
                  <span className="font-medium">{invoice.invoice_number} - {invoice.client_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateString(invoice.invoice_date)} • ${invoice.total.toFixed(2)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
