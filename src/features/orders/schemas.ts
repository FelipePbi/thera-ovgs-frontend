import { z } from "zod";
import type { Item } from "@/lib/types";

export const orderItemSchema = z.object({
  itemId: z.string().min(1, "Item é obrigatório"),
  quantity: z.coerce.number().int().positive("Quantidade deve ser maior que zero"),
});

export const createOrderSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  transportTypeId: z.string().min(1, "Selecione um tipo de transporte"),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item"),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export function validateAuthorizedTransportType(
  values: CreateOrderFormValues,
  authorizedTransportTypes: string[],
): boolean {
  if (!values.transportTypeId) {
    return false;
  }
  return authorizedTransportTypes.includes(values.transportTypeId);
}

export function getOrderTotalWeight(
  orderItems: Array<{ itemId: string; quantity: number }>,
  itemsCatalog: Array<Pick<Item, "id" | "weight">>,
): number {
  const weightById = new Map(itemsCatalog.map((item) => [item.id, item.weight]));
  return orderItems.reduce((total, row) => {
    const weight = weightById.get(row.itemId) ?? 0;
    return total + weight * row.quantity;
  }, 0);
}

export function validateOrderWeightWithinCapacity(
  totalWeight: number,
  capacity: number | undefined,
): boolean {
  if (capacity === undefined || capacity <= 0) {
    return false;
  }
  return totalWeight <= capacity;
}
