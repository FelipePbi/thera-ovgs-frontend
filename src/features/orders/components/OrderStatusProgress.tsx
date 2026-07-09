"use client";

import { ORDER_STATUS_FLOW } from "@/features/orders/stateMachine";
import { ORDER_STATUS_LABELS } from "@/features/orders/statusDisplay";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusProgress({ status }: { status: OrderStatus }) {
  const idx = ORDER_STATUS_FLOW.indexOf(status);
  return (
    <ol className="flex flex-wrap gap-2">
      {ORDER_STATUS_FLOW.map((step, i) => (
        <li
          key={step}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            i <= idx
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {ORDER_STATUS_LABELS[step]}
        </li>
      ))}
    </ol>
  );
}
