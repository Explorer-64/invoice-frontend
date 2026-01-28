import { useState, useEffect } from "react";
import { Plus, Mail, Phone, MapPin, DollarSign, Pencil, Trash2, Eye } from "lucide-react";
import { backend as apiClient } from "app";
import { useCurrentUser } from "app/auth";
import { ClientResponse, ClientWithRatesResponse } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientFormDialog } from "components/ClientFormDialog";
import { ClientViewDialog } from "components/ClientViewDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "components/PageHeader";
import { useNavigate } from "react-router-dom";
import { useClientsStore } from "utils/useClientsStore";
import { Translate } from "components/Translate";

const ClientsPage = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  // Use Firestore store
  const { clients, rates, isLoading, subscribe, getClientWithRates, deleteClient, restoreClient } = useClientsStore();
  
  // Subscribe to real-time updates
  useEffect(() => {
    console.log('[ClientsPage] User state:', { 
      user: user ? 'authenticated' : 'not authenticated',
      uid: user?.uid,
      email: user?.email 
    });
    if (!user?.uid) {
      console.warn('[ClientsPage] No user UID, cannot subscribe to clients');
      return;
    }
    console.log('[ClientsPage] Subscribing to clients for user:', user.uid);
    const unsubscribe = subscribe(user.uid);
    return unsubscribe;
  }, [user?.uid, subscribe]);
  
  const [isPremium, setIsPremium] = useState(false);

  const checkSubscription = async () => {
    try {
      const res = await apiClient.get_subscription_status();
      const data = await res.json();
      setIsPremium(data.is_premium);
    } catch (e) {
      console.error("Failed to check subscription", e);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const [selectedClient, setSelectedClient] = useState<ClientWithRatesResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewClient, setViewClient] = useState<ClientWithRatesResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(null);

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = async (client: ClientResponse) => {
    try {
      // Get full client with rates
      const clientWithRates = getClientWithRates(client.id);
      if (!clientWithRates) {
        toast.error("Client not found");
        return;
      }
      setSelectedClient(clientWithRates);
      setIsFormOpen(true);
    } catch (error) {
      console.error("Failed to load client:", error);
      toast.error("Failed to load client details");
    }
  };

  const handleViewClient = async (client: ClientResponse) => {
    try {
      const clientWithRates = getClientWithRates(client.id);
      if (!clientWithRates) {
        toast.error("Client not found");
        return;
      }
      setViewClient(clientWithRates);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load client:", error);
      toast.error("Failed to load client details");
    }
  };

  const handleDeleteClient = (client: ClientResponse) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete || !user?.uid) return;

    try {
      await deleteClient(user.uid, clientToDelete.id);
      toast.success("Client archived successfully");
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to archive client");
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
    // Real-time updates handle the refresh automatically
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageHeader title="Clients" subtitle="Manage client information and billing rates" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4"><Translate>Please Sign In</Translate></h2>
            <p className="text-muted-foreground mb-6">
              <Translate>You need to be signed in to manage your clients.</Translate>
            </p>
            <Button asChild className="w-full">
              <a href="/login"><Translate>Sign In</Translate></a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageHeader title="Clients" subtitle="Manage client information and billing rates" />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-foreground"><Translate>Clients</Translate></h1>
                <p className="mt-2 text-muted-foreground">
                  <Translate>Manage your clients and their billing rates</Translate>
                </p>
              </div>
              <Button onClick={handleAddClient} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <Translate>Add Client</Translate>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground"><Translate>Loading clients...</Translate></p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2"><Translate>No clients yet</Translate></h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                <Translate>Get started by adding your first client. You'll be able to track work time and send them invoices.</Translate>
              </p>
              <Button onClick={handleAddClient} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <Translate>Add Your First Client</Translate>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Translate>Client since</Translate> {new Date(client.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewClient(client)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {client.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-foreground">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Client Form Dialog */}
        <ClientFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          client={selectedClient}
          onSuccess={handleFormSuccess}
        />

        {/* Client View Dialog */}
        <ClientViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          client={viewClient}
          onEdit={() => {
            if (viewClient) {
              setSelectedClient(viewClient);
              setIsFormOpen(true);
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle><Translate>Are you sure?</Translate></AlertDialogTitle>
              <AlertDialogDescription>
                <Translate>This will permanently delete</Translate> {clientToDelete?.name} <Translate>and all associated billing rates. This action cannot be undone.</Translate>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel><Translate>Cancel</Translate></AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Translate>Delete Client</Translate>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ClientsPage;
