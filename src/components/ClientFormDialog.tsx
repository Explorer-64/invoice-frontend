import { useState, useEffect } from "react";
// Trigger rebuild for zod cache
import brain from "brain";
import { ClientWithRatesResponse } from "types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSync } from "components/SyncContext";
import { dbPromise } from "utils/db";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, ClientFormValues } from "utils/clientFormSchema";
import { ClientBasicInfoForm } from "./ClientBasicInfoForm";
import { ClientLocationForm } from "./ClientLocationForm";
import { ClientRatesForm } from "./ClientRatesForm";

export interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithRatesResponse | null;
  onSuccess: () => void;
}

export const ClientFormDialog = ({ open, onOpenChange, client, onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { queueAction } = useSync();
  
  // Form setup with validation
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      latitude: null,
      longitude: null,
      radius: 200,
      invoiceTemplateType: "standard",
      rates: [{ tempId: "default", rate_type: "hourly", amount: 0, is_default: true, currency: "USD" }],
    },
  });

  const { reset, handleSubmit: formHandleSubmit } = form;

  // Load client data when editing
  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          name: client.client.name,
          email: client.client.email || "",
          phone: client.client.phone || "",
          address: client.client.address || "",
          // @ts-ignore
          latitude: client.client.latitude || null,
          // @ts-ignore
          longitude: client.client.longitude || null,
          // @ts-ignore
          radius: client.client.radius || 200,
          // @ts-ignore
          invoiceTemplateType: client.client.invoice_template_type || "standard",
          rates: client.rates.map(r => ({
             ...r,
             amount: Number(r.amount) || 0,
          })),
        });
      } else {
        // Check draft
        const draft = localStorage.getItem("client-form-draft");
        if (draft) {
          try {
             const parsed = JSON.parse(draft);
             // Restore draft but ensure types match schema
             reset({
               ...parsed,
               // Ensure rates are correctly formatted if coming from old draft
               rates: Array.isArray(parsed.rates) ? parsed.rates : [{ tempId: "default", rate_type: "hourly", amount: 0, is_default: true, currency: "USD" }]
             });
             
             if (parsed.name) {
               toast("Draft Restored", {
                  description: "We found unsaved client details and restored them.",
                  action: {
                    label: "Clear",
                    onClick: () => {
                       localStorage.removeItem("client-form-draft");
                       reset({
                          name: "",
                          email: "",
                          phone: "",
                          address: "",
                          latitude: null,
                          longitude: null,
                          radius: 200,
                          invoiceTemplateType: "standard",
                          rates: [{ tempId: "default", rate_type: "hourly", amount: 0, is_default: true, currency: "USD" }],
                       });
                    }
                  }
                });
             }
          } catch (e) {
            console.error("Failed to parse draft", e);
          }
        } else {
           reset({
              name: "",
              email: "",
              phone: "",
              address: "",
              latitude: null,
              longitude: null,
              radius: 200,
              invoiceTemplateType: "standard",
              rates: [{ tempId: "default", rate_type: "hourly", amount: 0, is_default: true, currency: "USD" }],
           });
        }
      }
    }
  }, [client, open, reset]);

  // Save draft on change
  useEffect(() => {
     if (!client && open) {
        const subscription = form.watch((value) => {
           localStorage.setItem("client-form-draft", JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
     }
  }, [form, client, open]);

  const handleClose = (isOpen: boolean) => {
     onOpenChange(isOpen);
  };

  const onSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);

    try {
      const db = await dbPromise;
      const isOffline = !navigator.onLine;
      let targetClientId: number | null = client?.client.id || null;
      const { rates, ...clientData } = values;

      // 1. Create or Update Client
      if (isOffline) {
         // OFFLINE MODE
         if (client) {
            // Update existing
             const updateData = {
                ...clientData,
                radius: Number(clientData.radius) || 200,
            };
            
            await queueAction('UPDATE_CLIENT', { clientId: client.client.id, data: updateData });
            
            // Handle IDB update manually since we're not using Dexie
            const existingClient = await db.get('clients', client.client.id);
            if (existingClient) {
                await db.put('clients', { ...existingClient, ...updateData });
            }
            targetClientId = client.client.id;
         } else {
            // Create new
            const tempId = -Date.now();
            const defaultRate = rates.find(r => r.is_default);
            
            const newClientData = {
                ...clientData,
                radius: Number(clientData.radius) || 200,
                default_rate_type: defaultRate ? defaultRate.rate_type : null,
                default_rate_amount: defaultRate ? defaultRate.amount : null,
                default_rate_currency: "USD",
            };
            
            await queueAction('CREATE_CLIENT', { ...newClientData, tempId });
            await db.add('clients', {
                id: tempId,
                ...newClientData,
                created_at: new Date().toISOString(),
                // @ts-ignore
                invoice_template_type: clientData.invoiceTemplateType
            });
            targetClientId = tempId;
         }
      } else {
          // ONLINE MODE
          const payload = {
            ...clientData,
            radius: Number(clientData.radius) || 200,
          };

          if (client) {
            await brain.update_client({ clientId: client.client.id }, payload);
          } else {
            const defaultRate = rates.find(r => r.is_default);
            const newClientRes = await brain.create_client({
              ...payload,
              default_rate_type: defaultRate ? defaultRate.rate_type : null,
              default_rate_amount: defaultRate ? defaultRate.amount : null,
              default_rate_currency: "USD",
            });
            const data = await newClientRes.json();
            targetClientId = data.id;
          }
      }

      if (targetClientId) {
          // 2. Sync Rates
          if (isOffline) {
               for (const rate of rates) {
                  if (!rate.amount) continue;

                  if (rate.id) {
                      await queueAction('UPDATE_BILLING_RATE', { clientId: targetClientId, rateId: rate.id, data: rate });
                  } else {
                      // Skip if it was the default rate and we just created the client
                      const isAlreadyCreated = !client && rate.is_default;
                      if (!isAlreadyCreated) {
                           await queueAction('CREATE_BILLING_RATE', { clientId: targetClientId, data: { ...rate, amount: rate.amount.toString() } });
                      }
                  }
               }
          } else {
              // Identify rates to DELETE
              if (client) {
                  const currentRateIds = new Set(rates.map(r => r.id).filter(Boolean));
                  for (const originalRate of client.rates) {
                      if (!currentRateIds.has(originalRate.id)) {
                          await brain.delete_billing_rate({ clientId: targetClientId, rateId: originalRate.id });
                      }
                  }
              }

              // Process rates
              for (const rate of rates) {
                  if (!rate.amount) continue;

                  if (rate.id) {
                      const original = client?.rates.find(r => r.id === rate.id);
                      if (original && (
                          Number(original.amount) !== rate.amount || 
                          original.rate_type !== rate.rate_type || 
                          original.is_default !== rate.is_default
                      )) {
                          await brain.update_billing_rate(
                              { clientId: targetClientId, rateId: rate.id },
                              { ...rate, amount: rate.amount }
                          );
                      }
                  } else {
                      const isAlreadyCreated = !client && rate.is_default;
                      if (!isAlreadyCreated) {
                          await brain.create_billing_rate(
                              { clientId: targetClientId },
                              { ...rate, amount: rate.amount.toString() }
                          );
                      }
                  }
              }
          }
      }

      toast.success(client ? "Client updated" : "Client added", {
        description: `${clientData.name} has been ${client ? "updated" : "added"} successfully. ${isOffline ? "(Offline)" : ""}`,
      });
      
      localStorage.removeItem("client-form-draft");
      onSuccess();
    } catch (error: any) {
      console.error("Client form error:", error);
      let errorMessage = client ? "Failed to update client." : "Failed to create client.";
      if (error.json) {
        try {
          const errorData = await error.json();
          if (errorData.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              // Handle Pydantic validation errors (array of objects)
              errorMessage = errorData.detail
                .map((err: any) => err.msg || "Invalid input")
                .join("; ");
            } else if (typeof errorData.detail === "object") {
              // Handle single object error
              errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
            }
          }
        } catch (e) {
          console.error("Failed to parse error JSON", e);
        }
      }
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Update client information and billing rates."
              : "Add a new client to start tracking work and sending invoices."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <FormProvider {...form}>
            <form id="client-form" onSubmit={formHandleSubmit(onSubmit)} className="space-y-6 py-4">
              <ClientBasicInfoForm />
              <ClientLocationForm />
              <ClientRatesForm />
            </form>
          </FormProvider>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="client-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Saving...
              </>
            ) : client ? (
              "Update Client"
            ) : (
              "Add Client"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
