import { useFormContext } from "react-hook-form";
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
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { ClientFormValues } from "utils/clientFormSchema";

export const ClientBasicInfoForm = () => {
  const { register, control } = useFormContext<ClientFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Acme Corp"
          {...register("name")}
        />
        <FormField
          control={control}
          name="name"
          render={({ fieldState }) => (
            fieldState.error ? <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p> : null
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="billing@acme.com"
          {...register("email")}
        />
        <FormField
          control={control}
          name="email"
          render={({ fieldState }) => (
            fieldState.error ? <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p> : null
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="555-1234"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="123 Main St, Anytown USA"
          rows={2}
          {...register("address")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice-template">Invoice Template</Label>
        <FormField
          control={control}
          name="invoiceTemplateType"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="standard">Standard (Service & Description)</SelectItem>
                <SelectItem value="legal">Legal (Matter & Engagement)</SelectItem>
                <SelectItem value="creative">Creative (Project & Usage)</SelectItem>
                <SelectItem value="trades">Trades (Labor & Materials)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">Determines the column headers and terminology on invoices.</p>
      </div>
    </div>
  );
};
