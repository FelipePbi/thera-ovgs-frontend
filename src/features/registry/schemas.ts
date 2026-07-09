import { z } from "zod";

export const transportTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacidade é obrigatória" })
    .positive("Capacidade deve ser um número positivo"),
});

export type TransportTypeFormValues = z.infer<typeof transportTypeSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  authorizedTransportTypes: z
    .array(z.string())
    .min(1, "Selecione pelo menos um tipo de transporte autorizado"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const itemSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  weight: z.coerce
    .number({ invalid_type_error: "Peso é obrigatório" })
    .positive("Peso deve ser um número positivo"),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
