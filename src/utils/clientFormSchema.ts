import { z } from "zod";

export const rateDraftSchema = z.object({
  id: z.number().optional(),
  tempId: z.string().optional(),
  rate_type: z.enum(["hourly", "daily", "travel", "piece", "fixed"]),
  amount: z.union([z.string(), z.number()]).transform((val) => (val === "" ? 0 : Number(val))),
  currency: z.string().default("USD"),
  is_default: z.boolean().default(false),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  radius: z.union([z.string(), z.number()]).transform((val) => Number(val) || 200),
  invoiceTemplateType: z.enum(["standard", "legal", "creative", "trades"]).default("standard"),
  rates: z.array(rateDraftSchema),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
export type RateDraft = z.infer<typeof rateDraftSchema>;
