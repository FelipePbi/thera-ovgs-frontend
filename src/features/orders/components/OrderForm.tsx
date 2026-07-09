"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  removeItem,
  resetDraft,
  selectClientForOrder,
  setTransportTypeId,
  updateItemQuantity,
} from "@/store/draftOrderSlice";
import { useClients } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import { useItems } from "@/features/registry/hooks/useItems";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { FormFieldsSkeleton } from "@/components/skeletons";
import {
  createOrderSchema,
  getOrderTotalWeight,
  validateAuthorizedTransportType,
  validateOrderWeightWithinCapacity,
} from "@/features/orders/schemas";

export function OrderForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.draftOrder);
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: transportTypes = [], isLoading: transportTypesLoading } =
    useTransportTypes();
  const { data: items = [], isLoading: itemsLoading } = useItems();
  const createOrder = useCreateOrder();
  const optionsLoading = clientsLoading || transportTypesLoading || itemsLoading;

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedClient = clients.find((c) => c.id === draft.clientId);
  const authorized = selectedClient?.authorizedTransportTypes ?? [];
  const authorizedTransportTypes = transportTypes.filter((t) =>
    authorized.includes(t.id),
  );
  const selectedTransportType = transportTypes.find(
    (t) => t.id === draft.transportTypeId,
  );

  const payload = {
    clientId: draft.clientId,
    transportTypeId: draft.transportTypeId,
    items: draft.items,
  };
  const parsed = createOrderSchema.safeParse(payload);
  const transportTypeOk = validateAuthorizedTransportType(
    parsed.success ? parsed.data : payload,
    authorized,
  );
  const totalWeight = getOrderTotalWeight(draft.items, items);
  const capacity = selectedTransportType?.capacity;
  const weightOk = validateOrderWeightWithinCapacity(totalWeight, capacity);
  const canSubmit =
    parsed.success && transportTypeOk && weightOk && !createOrder.isPending;

  const itemById = new Map(items.map((i) => [i.id, i]));

  function handleAddItem() {
    if (!selectedItemId || quantity <= 0) return;
    dispatch(addItem({ itemId: selectedItemId, quantity }));
    setSelectedItemId("");
    setQuantity(1);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Nova ordem de venda</h1>

      {optionsLoading ? (
        <div className="space-y-4 rounded-lg border p-4">
          <FormFieldsSkeleton fields={4} />
        </div>
      ) : (
        <>
      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Cabeçalho do pedido</h2>
        <div className="space-y-2">
          <label htmlFor="client-select" className="text-sm font-medium">
            Cliente
          </label>
          <select
            id="client-select"
            aria-label="cliente"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={draft.clientId}
            onChange={(e) => {
              const client = clients.find((c) => c.id === e.target.value);
              dispatch(
                selectClientForOrder({
                  clientId: e.target.value,
                  authorizedTransportTypes: client?.authorizedTransportTypes ?? [],
                }),
              );
            }}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="transport-type-select" className="text-sm font-medium">
            Tipo de Transporte
          </label>
          <select
            id="transport-type-select"
            aria-label="tipo de transporte"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={draft.transportTypeId}
            disabled={!draft.clientId}
            onChange={(e) => dispatch(setTransportTypeId(e.target.value))}
          >
            <option value="">
              {draft.clientId
                ? "Selecione um tipo de transporte"
                : "Selecione um cliente primeiro"}
            </option>
            {authorizedTransportTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.capacity} kg)
              </option>
            ))}
          </select>
          {draft.clientId && authorizedTransportTypes.length === 0 && (
            <p className="text-sm text-destructive">
              Este cliente não possui tipos de transporte autorizados.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Itens do pedido</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1 space-y-2">
            <label htmlFor="item-select" className="block text-sm font-medium leading-5">
              Item
            </label>
            <select
              id="item-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Selecione um item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} — {i.name} ({i.weight} kg)
                </option>
              ))}
            </select>
          </div>
          <div className="w-24 space-y-2">
            <label htmlFor="quantity-input" className="block text-sm font-medium leading-5">
              Qtd
            </label>
            <Input
              id="quantity-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <span className="block text-sm font-medium leading-5 invisible" aria-hidden>
              &nbsp;
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={!selectedItemId}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {draft.items.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {draft.items.map((row) => {
              const item = itemById.get(row.itemId);
              const unitWeight = item?.weight ?? 0;
              const subtotal = unitWeight * row.quantity;
              return (
                <li key={row.itemId} className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {item?.name ?? row.itemId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {unitWeight} kg × {row.quantity} = {subtotal.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={row.quantity}
                      onChange={(e) =>
                        dispatch(
                          updateItemQuantity({
                            itemId: row.itemId,
                            quantity: Number(e.target.value),
                          }),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => dispatch(removeItem(row.itemId))}
                    >
                      Remover
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
        )}

        {draft.transportTypeId && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p>
              Peso total: <strong>{totalWeight.toFixed(2)} kg</strong>
              {capacity !== undefined && (
                <>
                  {" "}
                  / Capacidade: <strong>{capacity} kg</strong>
                </>
              )}
            </p>
            {draft.items.length > 0 && !weightOk && (
              <p className="mt-1 text-destructive" role="alert">
                O peso total dos itens excede a capacidade do tipo de transporte
                selecionado.
              </p>
            )}
          </div>
        )}
      </section>

      <Button
        type="button"
        disabled={!canSubmit}
        onClick={async () => {
          if (!canSubmit || !parsed.success) return;
          await createOrder.mutateAsync(parsed.data);
          dispatch(resetDraft());
          router.push("/pedidos");
        }}
      >
        Criar ordem
      </Button>
        </>
      )}
    </div>
  );
}
