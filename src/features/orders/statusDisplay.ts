import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CRIADA: "Criada",
  PLANEJADA: "Planejada",
  AGENDADA: "Agendada",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  CRIADA: "border-slate-200 bg-slate-100 text-slate-700",
  PLANEJADA: "border-blue-200 bg-blue-100 text-blue-800",
  AGENDADA: "border-amber-200 bg-amber-100 text-amber-800",
  EM_TRANSPORTE: "border-violet-200 bg-violet-100 text-violet-800",
  ENTREGUE: "border-emerald-200 bg-emerald-100 text-emerald-800",
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}
