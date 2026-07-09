"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import { ORDER_STATUS_LABELS } from "@/features/orders/statusDisplay";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
];

export function MonitoringFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: clients = [] } = useClients();
  const { data: transportTypes = [] } = useTransportTypes();

  const status = params.get("status") ?? "";
  const clientId = params.get("clientId") ?? "";
  const transportTypeId = params.get("transportTypeId") ?? "";
  const scheduledDateFrom = params.get("scheduledDateFrom") ?? "";
  const scheduledDateTo = params.get("scheduledDateTo") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.push(query ? `/monitoramento?${query}` : "/monitoramento");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="h-10 rounded-md border px-3 text-sm"
        value={status}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">Todos os status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-md border px-3 text-sm"
        value={clientId}
        onChange={(e) => update("clientId", e.target.value)}
      >
        <option value="">Todos os clientes</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-md border px-3 text-sm"
        value={transportTypeId}
        onChange={(e) => update("transportTypeId", e.target.value)}
      >
        <option value="">Todos os tipos de transporte</option>
        {transportTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Input
        id="scheduled-date-from"
        type="date"
        className="h-10 w-auto"
        value={scheduledDateFrom}
        onChange={(e) => update("scheduledDateFrom", e.target.value)}
        aria-label="Data agendada (de)"
        title="Data agendada (de)"
      />
      <Input
        id="scheduled-date-to"
        type="date"
        className="h-10 w-auto"
        value={scheduledDateTo}
        onChange={(e) => update("scheduledDateTo", e.target.value)}
        aria-label="Data agendada (até)"
        title="Data agendada (até)"
      />
      <Button variant="outline" className="h-10" onClick={() => router.push("/monitoramento")}>
        Limpar
      </Button>
    </div>
  );
}
