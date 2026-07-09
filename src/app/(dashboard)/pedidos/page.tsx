"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { PageFiltersSkeleton } from "@/components/skeletons";
import { OrderFilters } from "@/features/orders/components/OrderFilters";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { getAvailableActions } from "@/features/orders/stateMachine";
import { useOrders, useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import { useClients } from "@/features/registry/hooks/useClients";
import type { Order, OrderStatus } from "@/lib/types";

function PedidosContent() {
  const params = useSearchParams();
  const status = (params.get("status") as OrderStatus | null) ?? undefined;
  const clientId = params.get("clientId") ?? undefined;
  const { data, isLoading } = useOrders({ status, clientId, page: 1, limit: 50 });
  const { data: clients = [] } = useClients();
  const updateStatus = useUpdateOrderStatus();
  const clientName = new Map(clients.map((c) => [c.id, c.name]));
  const rows = data?.items ?? [];

  function needsDetailAction(order: Order) {
    // Agendar / confirmar agendamento só no detalhe
    return (
      order.status === "PLANEJADA" ||
      (order.status === "AGENDADA" && !order.scheduleConfirmed)
    );
  }

  function detailActionLabel(order: Order) {
    if (order.status === "PLANEJADA") return "Agendar entrega";
    if (order.status === "AGENDADA" && !order.scheduleConfirmed) {
      return "Confirmar no detalhe";
    }
    return null;
  }

  function handleAdvance(order: Order) {
    const [action] = getAvailableActions(order.status);
    if (!action || needsDetailAction(order)) return;
    updateStatus.mutate({ id: order.id, status: action.nextStatus });
  }

  return (
    <>
      <OrderFilters />
      <DataTable
        isLoading={isLoading}
        data={rows}
        getRowKey={(r) => r.id}
        columns={[
          {
            header: "ID",
            accessor: "id",
            cell: (r) => (
              <Link
                href={`/pedidos/${encodeURIComponent(r.id)}`}
                className="font-medium text-primary hover:underline"
              >
                {r.id}
              </Link>
            ),
          },
          {
            header: "Cliente",
            accessor: "clientId",
            cell: (r) => clientName.get(r.clientId) ?? r.clientId,
          },
          {
            header: "Status",
            accessor: "status",
            cell: (r) => <OrderStatusBadge status={r.status} />,
          },
          {
            header: "Ações",
            accessor: "actions",
            cell: (r) => {
              const [action] = getAvailableActions(r.status);
              const goToDetail = needsDetailAction(r);
              const detailLabel = detailActionLabel(r);
              return (
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/pedidos/${encodeURIComponent(r.id)}`}>Ver</Link>
                  </Button>
                  {action && goToDetail && detailLabel && (
                    <Button asChild size="sm">
                      <Link href={`/pedidos/${encodeURIComponent(r.id)}`}>{detailLabel}</Link>
                    </Button>
                  )}
                  {action && !goToDetail && (
                    <Button
                      size="sm"
                      disabled={updateStatus.isPending}
                      onClick={() => handleAdvance(r)}
                    >
                      {action.label}
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]}
      />
    </>
  );
}

export default function PedidosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Button asChild>
          <Link href="/pedidos/nova">Nova ordem</Link>
        </Button>
      </div>
      <Suspense fallback={<PageFiltersSkeleton />}>
        <PedidosContent />
      </Suspense>
    </div>
  );
}
