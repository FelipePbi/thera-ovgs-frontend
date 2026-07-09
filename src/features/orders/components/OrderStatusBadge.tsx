"use client";

import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/features/orders/statusDisplay";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={ORDER_STATUS_BADGE_CLASS[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
