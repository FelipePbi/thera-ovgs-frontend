"use client";

import { useState } from "react";
import * as Nav from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as OSP from "@/features/orders/components/OrderStatusProgress";
import * as SM from "@/features/orders/stateMachine";
import * as Orders from "@/features/orders/hooks/useOrders";
import { DELIVERY_WINDOWS, todayISODate } from "@/features/orders/scheduling";
import { useClients } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import { useItems } from "@/features/registry/hooks/useItems";
import { OrderDetailSkeleton } from "@/components/skeletons";
import { formatDate, formatDateTime } from "@/utils/formatters";

export default function PedidoDetailPage() {
  const params = Nav.useParams();
  const rawId = String(params.id ?? "");
  const id = decodeURIComponent(rawId);
  const orderQuery = Orders.useOrder(id);
  const updateStatus = Orders.useUpdateOrderStatus();
  const scheduleOrder = Orders.useScheduleOrder();
  const confirmSchedule = Orders.useConfirmScheduleOrder();
  const updateTransportType = Orders.useUpdateOrderTransportType();
  const { data: clients = [] } = useClients();
  const { data: transportTypes = [] } = useTransportTypes();
  const { data: items = [] } = useItems();

  const [newTransportTypeId, setNewTransportTypeId] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");

  if (orderQuery.isLoading) return <OrderDetailSkeleton />;
  if (!orderQuery.data) return <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>;

  const order = orderQuery.data;
  const actions = SM.getAvailableActions(order.status);
  const client = clients.find((c) => c.id === order.clientId);
  const authorizedTransportTypes = transportTypes.filter((t) =>
    client?.authorizedTransportTypes.includes(t.id),
  );
  const itemNameById = new Map(items.map((i) => [i.id, { name: i.name, sku: i.sku }]));
  const isReschedule = order.status === "AGENDADA";
  const minDate = todayISODate();

  function openScheduleModal() {
    setScheduledDate(order.scheduledDate && order.scheduledDate >= minDate ? order.scheduledDate : minDate);
    setDeliveryWindow(order.deliveryWindow ?? "");
    setScheduleOpen(true);
  }

  async function handleSchedule() {
    if (!scheduledDate || !deliveryWindow) return;
    await scheduleOrder.mutateAsync({
      id: order.id,
      scheduledDate,
      deliveryWindow,
    });
    setScheduleOpen(false);
    setScheduledDate("");
    setDeliveryWindow("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordem {order.id}</h1>
        <p className="text-sm text-muted-foreground">
          Criada em {formatDateTime(order.createdAt)}
        </p>
      </div>

      <OSP.OrderStatusProgress status={order.status} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card.Card>
          <Card.CardHeader>
            <Card.CardTitle>Informações</Card.CardTitle>
          </Card.CardHeader>
          <Card.CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Cliente:</span>{" "}
              {order.clientName ?? client?.name ?? order.clientId}
            </p>
            <p>
              <span className="font-medium">Tipo de Transporte:</span>{" "}
              {order.transportTypeName ?? order.transportTypeId}
            </p>
            {order.scheduledDate && (
              <p>
                <span className="font-medium">Data agendada:</span>{" "}
                {formatDate(order.scheduledDate)}
              </p>
            )}
            {order.deliveryWindow && (
              <p>
                <span className="font-medium">Janela de entrega:</span> {order.deliveryWindow}
              </p>
            )}
            {order.status === "AGENDADA" && (
              <p>
                <span className="font-medium">Agendamento:</span>{" "}
                {order.scheduleConfirmed ? "Confirmado" : "Pendente de confirmação"}
              </p>
            )}
            {order.deliveredAt && (
              <p>
                <span className="font-medium">Data de entrega:</span>{" "}
                {formatDate(order.deliveredAt)}
              </p>
            )}
          </Card.CardContent>
        </Card.Card>

        <Card.Card>
          <Card.CardHeader>
            <Card.CardTitle>Itens</Card.CardTitle>
          </Card.CardHeader>
          <Card.CardContent>
            <ul className="space-y-2 text-sm">
              {order.items.map((row) => {
                const item = itemNameById.get(row.itemId);
                return (
                  <li key={row.itemId} className="flex justify-between">
                    <span>{item ? `${item.sku} — ${item.name}` : row.itemId}</span>
                    <span className="text-muted-foreground">x{row.quantity}</span>
                  </li>
                );
              })}
            </ul>
          </Card.CardContent>
        </Card.Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ações de status</h2>
        <div className="flex flex-wrap gap-2">
          {order.status === "PLANEJADA" && (
            <Button onClick={openScheduleModal}>Agendar entrega</Button>
          )}

          {order.status === "AGENDADA" && (
            <>
              <Button variant="outline" onClick={openScheduleModal}>
                Reagendar
              </Button>
              {!order.scheduleConfirmed ? (
                <Button
                  disabled={confirmSchedule.isPending}
                  onClick={() => confirmSchedule.mutate(order.id)}
                >
                  Confirmar agendamento
                </Button>
              ) : (
                <Button
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ id: order.id, status: "EM_TRANSPORTE" })
                  }
                >
                  Iniciar transporte
                </Button>
              )}
            </>
          )}

          {order.status !== "PLANEJADA" &&
            order.status !== "AGENDADA" &&
            actions.map((action) => (
              <Button
                key={action.nextStatus}
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate({ id: order.id, status: action.nextStatus })
                }
              >
                {action.label}
              </Button>
            ))}

          {order.status === "ENTREGUE" && (
            <p className="text-sm text-muted-foreground">
              Nenhuma ação disponível para este status.
            </p>
          )}
        </div>
      </div>

      {order.status !== "ENTREGUE" && (
        <div className="space-y-2 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Alterar tipo de transporte</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={newTransportTypeId}
              onChange={(e) => setNewTransportTypeId(e.target.value)}
            >
              <option value="">Selecione um tipo de transporte</option>
              {authorizedTransportTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              disabled={!newTransportTypeId || updateTransportType.isPending}
              onClick={() => {
                if (!newTransportTypeId) return;
                updateTransportType.mutate({
                  id: order.id,
                  transportTypeId: newTransportTypeId,
                });
                setNewTransportTypeId("");
              }}
            >
              Atualizar tipo de transporte
            </Button>
          </div>
        </div>
      )}

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isReschedule ? "Reagendar entrega" : "Agendar entrega"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="scheduled-date" className="text-sm font-medium">
                Data
              </label>
              <Input
                id="scheduled-date"
                type="date"
                min={minDate}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="delivery-window" className="text-sm font-medium">
                Janela de entrega
              </label>
              <select
                id="delivery-window"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={deliveryWindow}
                onChange={(e) => setDeliveryWindow(e.target.value)}
              >
                <option value="">Selecione a janela</option>
                {DELIVERY_WINDOWS.map((window) => (
                  <option key={window} value={window}>
                    {window}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleOpen(false)}
              disabled={scheduleOrder.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!scheduledDate || !deliveryWindow || scheduleOrder.isPending}
              onClick={() => void handleSchedule()}
            >
              {scheduleOrder.isPending
                ? "Salvando..."
                : isReschedule
                  ? "Salvar reagendamento"
                  : "Salvar agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
