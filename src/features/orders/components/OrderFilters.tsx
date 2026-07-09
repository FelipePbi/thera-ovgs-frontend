"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useClients } from "@/features/registry/hooks/useClients";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["CRIADA","PLANEJADA","AGENDADA","EM_TRANSPORTE","ENTREGUE"];

export function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: clients = [] } = useClients();
  const status = params.get("status") ?? "";
  const clientId = params.get("clientId") ?? "";
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key); else next.set(key, value);
    router.push("/pedidos?" + next.toString());
  }
  return (
    <div className="flex flex-wrap gap-3">
      <select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => update("status", e.target.value)}>
        <option value="">Todos os status</option>
        {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
      </select>
      <select className="h-10 rounded-md border px-3 text-sm" value={clientId} onChange={(e) => update("clientId", e.target.value)}>
        <option value="">Todos os clientes</option>
        {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
      </select>
      <Button variant="outline" onClick={() => router.push("/pedidos")}>Limpar</Button>
    </div>
  );
}
