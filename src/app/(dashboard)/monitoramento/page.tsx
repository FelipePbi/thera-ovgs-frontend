"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { KpiCardsSkeleton, PageFiltersSkeleton } from "@/components/skeletons";
import * as Card from "@/components/ui/card";
import { MonitoringFilters } from "@/features/orders/components/MonitoringFilters";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useClients } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import { dashboardApi } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import { formatDate } from "@/utils/formatters";

function MonitoramentoContent() {
  const params = useSearchParams();
  const status = (params.get("status") as OrderStatus | null) ?? undefined;
  const clientId = params.get("clientId") ?? undefined;
  const transportTypeId = params.get("transportTypeId") ?? undefined;
  const scheduledDateFrom = params.get("scheduledDateFrom") ?? undefined;
  const scheduledDateTo = params.get("scheduledDateTo") ?? undefined;

  const kpisQuery = useQuery({
    queryKey: ["kpis"],
    queryFn: () => dashboardApi.getKpis(),
  });
  const { data, isLoading } = useOrders({
    status,
    clientId,
    transportTypeId,
    scheduledDateFrom,
    scheduledDateTo,
    page: 1,
    limit: 50,
  });
  const { data: clients = [] } = useClients();
  const { data: transportTypes = [] } = useTransportTypes();

  const clientName = new Map(clients.map((c) => [c.id, c.name]));
  const transportTypeName = new Map(transportTypes.map((t) => [t.id, t.name]));
  const rows = data?.items ?? [];
  const kpis = kpisQuery.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Monitoramento</h1>

      {kpisQuery.isLoading ? (
        <KpiCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card.Card>
            <Card.CardHeader>
              <Card.CardTitle>Total de ordens</Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>{kpis?.totalOrders ?? 0}</Card.CardContent>
          </Card.Card>
          <Card.Card>
            <Card.CardHeader>
              <Card.CardTitle>Em transporte</Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>{kpis?.inTransportOrders ?? 0}</Card.CardContent>
          </Card.Card>
          <Card.Card>
            <Card.CardHeader>
              <Card.CardTitle>Atrasadas</Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>{kpis?.overdueOrders ?? 0}</Card.CardContent>
          </Card.Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pedidos</h2>
        <MonitoringFilters />
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
              header: "Tipo de transporte",
              accessor: "transportTypeId",
              cell: (r) =>
                transportTypeName.get(r.transportTypeId) ?? r.transportTypeId,
            },
            {
              header: "Status",
              accessor: "status",
              cell: (r) => <OrderStatusBadge status={r.status} />,
            },
            {
              header: "Data agendada",
              accessor: "scheduledDate",
              cell: (r) => (r.scheduledDate ? formatDate(r.scheduledDate) : "—"),
            },
            {
              header: "Janela",
              accessor: "deliveryWindow",
              cell: (r) => r.deliveryWindow ?? "—",
            },
            {
              header: "Data de entrega",
              accessor: "deliveredAt",
              cell: (r) => (r.deliveredAt ? formatDate(r.deliveredAt) : "—"),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default function MonitoramentoPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Monitoramento</h1>
          <KpiCardsSkeleton />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pedidos</h2>
            <PageFiltersSkeleton />
          </div>
        </div>
      }
    >
      <MonitoramentoContent />
    </Suspense>
  );
}
