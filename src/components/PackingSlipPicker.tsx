import { useState, useEffect } from "react";
import { backend as apiClient } from "app";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Package, Calendar, Hash } from "lucide-react";
import { toast } from "sonner";
import { formatDateString } from "utils/dateUtils";

interface PackingSlipItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PackingSlip {
  id: string;
  slip_number: string;
  customer_name: string;
  items: PackingSlipItem[];
  created_at: string | null;
  item_count: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSlip: (slip: PackingSlip) => void;
}

export function PackingSlipPicker({ open, onOpenChange, onSelectSlip }: Props) {
  const [slips, setSlips] = useState<PackingSlip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUninvoicedSlips();
    }
  }, [open]);

  const fetchUninvoicedSlips = async () => {
    setLoading(true);
    try {
      const response = await apiClient.list_uninvoiced_slips();
      const data = await response.json();
      setSlips(data.slips || []);
    } catch (error) {
      console.error("Failed to fetch packing slips:", error);
      toast.error("Failed to load packing slips");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlip = (slip: PackingSlip) => {
    onSelectSlip(slip);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Link Packing Slip</SheetTitle>
          <SheetDescription>
            Select a packing slip to automatically populate invoice details
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading packing slips...</div>
          </div>
        )}

        {!loading && slips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No uninvoiced packing slips</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create packing slips in Packing Slip Pro to link them to invoices
            </p>
          </div>
        )}

        {!loading && slips.length > 0 && (
          <div className="space-y-3">
            {slips.map((slip) => (
              <Card 
                key={slip.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectSlip(slip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{slip.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{slip.slip_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{slip.created_at ? formatDateString(slip.created_at.split('T')[0]) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {slip.item_count} {slip.item_count === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    {/* Note: API only returns item_count, not full items array */}
                    <div className="text-center text-muted-foreground">
                      Click to view full details
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
