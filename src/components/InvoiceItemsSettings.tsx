import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "app/auth";
import { useInvoiceItemsStore, InvoiceItem } from "utils/useInvoiceItemsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload, 
  FileText,
  Loader2,
  Download,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { Translate } from "components/Translate";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InvoiceItemsSettings() {
  const { user } = useCurrentUser();
  const { items, isLoading, subscribe, addItem, updateItem, deleteItem, importItems } = useInvoiceItemsStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [formData, setFormData] = useState<Partial<InvoiceItem>>({
    name: "",
    description: "",
    sku: "",
    price: 0,
    category: "",
    default_quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import Dialog State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.uid) {
      subscribe(user.uid);
    }
  }, [user?.uid]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: 0,
      category: "",
      default_quantity: 1
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: InvoiceItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      sku: item.sku || "",
      price: item.price,
      category: item.category || "",
      default_quantity: item.default_quantity || 1
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        toast.success("Item deleted");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!formData.name || formData.price === undefined) {
      toast.error("Name and Price are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemPayload = {
        name: formData.name,
        description: formData.description || formData.name, // Fallback to name if desc empty
        sku: formData.sku,
        price: Number(formData.price),
        category: formData.category,
        default_quantity: Number(formData.default_quantity) || 1
      };

      if (editingItem) {
        await updateItem(editingItem.id, itemPayload);
        toast.success("Item updated");
      } else {
        await addItem(itemPayload, user.uid);
        toast.success("Item created");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(editingItem ? "Failed to update item" : "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !user?.uid) return;

    setIsImporting(true);
    try {
      const text = await importFile.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const newItems: any[] = [];
      
      // Basic CSV parsing (skipping header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        // Handle quotes loosely? For now simple split
        // A better approach would be using a library but we'll do simple split for now
        // Assuming: name, description, price, sku, category
        const cols = row.split(',').map(c => c.trim());
        
        // Map based on headers if possible, otherwise assume order
        // Order assumption: name, description, price, sku, category
        // But let's try to be smart if headers exist
        
        let name, description, price, sku, category;
        
        if (headers.includes('name')) name = cols[headers.indexOf('name')];
        else name = cols[0];
        
        if (headers.includes('description')) description = cols[headers.indexOf('description')];
        else description = cols[1];
        
        if (headers.includes('price')) price = cols[headers.indexOf('price')];
        else if (headers.includes('unit_price')) price = cols[headers.indexOf('unit_price')];
        else price = cols[2];

        if (headers.includes('sku')) sku = cols[headers.indexOf('sku')];
        else sku = cols[3];
        
        if (headers.includes('category')) category = cols[headers.indexOf('category')];
        else category = cols[4];
        
        if (name && price) {
          newItems.push({
            name,
            description: description || name,
            price: parseFloat(price) || 0,
            sku: sku || "",
            category: category || "",
            default_quantity: 1
          });
        }
      }

      if (newItems.length > 0) {
        await importItems(newItems, user.uid);
        toast.success(`Imported ${newItems.length} items`);
        setIsImportOpen(false);
        setImportFile(null);
      } else {
        toast.error("No valid items found in CSV");
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import CSV");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,description,price,sku,category\nDrywall Sheet,4x8 drywall installation,50.00,MAT-001,Materials\nLabor - General,General labor per hour,45.00,LAB-001,Labor";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoice_items_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-lg font-semibold"><Translate>Invoice Item Library</Translate></h2>
            <p className="text-sm text-muted-foreground"><Translate>Manage reusable line items for your invoices.</Translate></p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                <Translate>Import CSV</Translate>
            </Button>
            <Button onClick={handleOpenNew}>
                <Plus className="mr-2 h-4 w-4" />
                <Translate>Add Item</Translate>
            </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Translate>Name</Translate></TableHead>
              <TableHead><Translate>Description</Translate></TableHead>
              <TableHead><Translate>Category</Translate></TableHead>
              <TableHead className="text-right"><Translate>Price</Translate></TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
               <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <p><Translate>No items found.</Translate></p>
                    {searchTerm && <Button variant="link" onClick={() => setSearchTerm("")}><Translate>Clear search</Translate></Button>}
                </TableCell>
              </TableRow>
            ) : (
                filteredItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>{item.name}</span>
                                {item.sku && <span className="text-xs text-muted-foreground">{item.sku}</span>}
                            </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={item.description}>
                            {item.description}
                        </TableCell>
                        <TableCell>
                            {item.category && (
                                <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            ${(item.price ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    <Translate>Edit</Translate>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <Translate>Delete</Translate>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem ? <Translate>Edit Item</Translate> : <Translate>New Item</Translate>}</DialogTitle>
                <DialogDescription><Translate>Create a reusable invoice line item.</Translate></DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name"><Translate>Item Name</Translate> *</Label>
                    <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Drywall Installation"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description"><Translate>Description</Translate></Label>
                    <Textarea 
                        id="description" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Detailed description for invoice..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price"><Translate>Unit Price</Translate> *</Label>
                        <Input 
                            id="price" 
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price} 
                            onChange={(e) => setFormData({...formData, price: e.target.valueAsNumber})}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku"><Translate>SKU / ID</Translate> <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input 
                            id="sku" 
                            value={formData.sku} 
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category"><Translate>Category</Translate> <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input 
                        id="category" 
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="e.g. Materials, Labor"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}><Translate>Cancel</Translate></Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingItem ? <Translate>Save Changes</Translate> : <Translate>Create Item</Translate>}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle><Translate>Import Items</Translate></DialogTitle>
                <DialogDescription><Translate>Upload a CSV file to import multiple items at once.</Translate></DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
                <Card className="bg-muted/50 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium"><Translate>CSV Format</Translate></CardTitle>
                        <CardDescription className="text-xs">
                            <Translate>Your CSV should include headers:</Translate> <code>name, description, price, sku, category</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" size="sm" className="w-full" onClick={downloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            <Translate>Download Template</Translate>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-2">
                    <Label htmlFor="file"><Translate>Select CSV File</Translate></Label>
                    <Input 
                        id="file" 
                        type="file" 
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportOpen(false)}><Translate>Cancel</Translate></Button>
                <Button onClick={handleImport} disabled={!importFile || isImporting}>
                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Translate>Import Items</Translate>
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
