import { useState, useEffect } from "react";
import { useCurrentUser } from "app/auth";
import { useInvoiceItemsStore, InvoiceItem } from "utils/useInvoiceItemsStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Translate } from "components/Translate";

interface InvoiceItemPickerProps {
  onSelect: (item: InvoiceItem) => void;
  trigger?: React.ReactNode;
  customColumns?: string[];
}

export function InvoiceItemPicker({ onSelect, trigger, customColumns = [] }: InvoiceItemPickerProps) {
  const { user } = useCurrentUser();
  const { items, isLoading, error, subscribe } = useInvoiceItemsStore();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && user?.uid) {
      subscribe(user.uid);
    }
  }, [open, user?.uid]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (item: InvoiceItem) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <Translate>From Library</Translate>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle><Translate>Select Item</Translate></DialogTitle>
          <DialogDescription><Translate>Choose an item from your library to add to the invoice.</Translate></DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Translate>Name</Translate></TableHead>
                <TableHead><Translate>Description</Translate></TableHead>
                {customColumns.map(col => (
                  <TableHead key={col} className="whitespace-nowrap">
                    <Translate>{col.replace(/_/g, ' ')}</Translate>
                  </TableHead>
                ))}
                <TableHead className="text-right"><Translate>Price</Translate></TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={4 + customColumns.length} className="h-24 text-center text-destructive">
                    <p><Translate>Error loading items</Translate></p>
                    <p className="text-xs opacity-70 mt-1">{error}</p>
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={4 + customColumns.length} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4 + customColumns.length} className="h-24 text-center text-muted-foreground">
                    <p><Translate>No items found.</Translate></p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelect(item)}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.sku && <span className="text-xs text-muted-foreground">{item.sku}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    {customColumns.map(col => (
                      <TableCell key={col} className="whitespace-nowrap text-muted-foreground">
                        {item.custom_fields?.[col] || "-"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      ${(item.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
