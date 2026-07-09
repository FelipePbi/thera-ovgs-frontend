import { http, HttpResponse } from "msw";
import type {
  Client,
  Item,
  Order,
  OrderStatus,
  OrderWithDetails,
  TransportType,
} from "@/lib/types";
import { canTransition } from "@/features/orders/stateMachine";
import {
  isScheduledDateNotPast,
  isValidDeliveryWindow,
} from "@/features/orders/scheduling";
import { withAudit, withAuth, withDelay } from "./audit";
import {
  authenticateCredentials,
  createMockJwt,
  getUserFromRequest,
  MOCK_USER,
} from "./auth";
import {
  createClient,
  createItem,
  createOrder,
  createTransportType,
  deleteClient,
  deleteItem,
  deleteTransportType,
  getAuditLogs,
  getClient,
  getClients,
  getItem,
  getItems,
  getKpis,
  getOrder,
  getOrders,
  getTransportType,
  getTransportTypes,
  updateClient,
  updateItem,
  updateOrder,
  updateTransportType,
} from "./db";

function jsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

function isTransportTypeAuthorized(clientId: string, transportTypeId: string): boolean {
  const client = getClient(clientId);
  if (!client) {
    return false;
  }
  return client.authorizedTransportTypes.includes(transportTypeId);
}

function enrichOrder(o: Order): OrderWithDetails {
  const client = getClient(o.clientId);
  const transportType = getTransportType(o.transportTypeId);
  return {
    ...o,
    clientName: client?.name ?? "Desconhecido",
    transportTypeName: transportType?.name ?? "Desconhecido",
  };
}

const authHandlers = [
  http.post(
    "/api/auth/login",
    withDelay(async ({ request }) => {
      const body = await jsonBody<{ username?: string; password?: string }>(request);
      if (!body.username || !body.password) {
        return HttpResponse.json(
          { message: "username and password are required" },
          { status: 422 },
        );
      }
      const user = authenticateCredentials(body.username, body.password);
      if (!user) {
        return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }
      return HttpResponse.json({
        token: createMockJwt(user),
        user,
      });
    }),
  ),
  http.get(
    "/api/auth/me",
    withAuth(async ({ request }) => {
      const user = getUserFromRequest(request) ?? MOCK_USER;
      return HttpResponse.json(user);
    }),
  ),
];

const clientHandlers = [
  http.get(
    "/api/clients",
    withAuth(() => HttpResponse.json(getClients())),
  ),
  http.get(
    "/api/clients/:id",
    withAuth(({ params }) => {
      const client = getClient(String(params.id));
      if (!client) {
        return HttpResponse.json({ message: "Client not found" }, { status: 404 });
      }
      return HttpResponse.json(client);
    }),
  ),
  http.post(
    "/api/clients",
    withAuth(
      withAudit(
        async ({ request }) => {
          const body = await jsonBody<Omit<Client, "id">>(request);
          const client = createClient(body);
          return HttpResponse.json(client, { status: 201 });
        },
        {
          action: "CREATE_CLIENT",
          entityType: "CLIENT",
          getEntityId: async ({ response }) => {
            const data = (await response.clone().json()) as Client;
            return data.id;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.put(
    "/api/clients/:id",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const body = await jsonBody<Partial<Omit<Client, "id">>>(request);
          const client = updateClient(String(params.id), body);
          if (!client) {
            return HttpResponse.json({ message: "Client not found" }, { status: 404 });
          }
          return HttpResponse.json(client);
        },
        {
          action: "UPDATE_CLIENT",
          entityType: "CLIENT",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getClient(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.delete(
    "/api/clients/:id",
    withAuth(
      withAudit(
        ({ params }) => {
          const current = getClient(String(params.id));
          if (!current) {
            return HttpResponse.json({ message: "Client not found" }, { status: 404 });
          }
          deleteClient(String(params.id));
          return HttpResponse.json(current);
        },
        {
          action: "DELETE_CLIENT",
          entityType: "CLIENT",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getClient(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
];

const transportTypeHandlers = [
  http.get(
    "/api/transport-types",
    withAuth(() => HttpResponse.json(getTransportTypes())),
  ),
  http.get(
    "/api/transport-types/:id",
    withAuth(({ params }) => {
      const transportType = getTransportType(String(params.id));
      if (!transportType) {
        return HttpResponse.json({ message: "Transport type not found" }, { status: 404 });
      }
      return HttpResponse.json(transportType);
    }),
  ),
  http.post(
    "/api/transport-types",
    withAuth(
      withAudit(
        async ({ request }) => {
          const body = await jsonBody<Omit<TransportType, "id">>(request);
          if (!body.name || body.capacity === undefined || body.capacity <= 0) {
            return HttpResponse.json(
              { message: "name and positive capacity are required" },
              { status: 422 },
            );
          }
          const transportType = createTransportType(body);
          return HttpResponse.json(transportType, { status: 201 });
        },
        {
          action: "CREATE_TRANSPORT_TYPE",
          entityType: "TRANSPORT_TYPE",
          getEntityId: async ({ response }) => {
            const data = (await response.clone().json()) as TransportType;
            return data.id;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.put(
    "/api/transport-types/:id",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const body = await jsonBody<Partial<Omit<TransportType, "id">>>(request);
          if (
            body.capacity !== undefined &&
            (typeof body.capacity !== "number" || body.capacity <= 0)
          ) {
            return HttpResponse.json(
              { message: "capacity must be a positive number" },
              { status: 422 },
            );
          }
          const transportType = updateTransportType(String(params.id), body);
          if (!transportType) {
            return HttpResponse.json(
              { message: "Transport type not found" },
              { status: 404 },
            );
          }
          return HttpResponse.json(transportType);
        },
        {
          action: "UPDATE_TRANSPORT_TYPE_ENTITY",
          entityType: "TRANSPORT_TYPE",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getTransportType(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.delete(
    "/api/transport-types/:id",
    withAuth(
      withAudit(
        ({ params }) => {
          const current = getTransportType(String(params.id));
          if (!current) {
            return HttpResponse.json(
              { message: "Transport type not found" },
              { status: 404 },
            );
          }
          deleteTransportType(String(params.id));
          return HttpResponse.json(current);
        },
        {
          action: "DELETE_TRANSPORT_TYPE",
          entityType: "TRANSPORT_TYPE",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getTransportType(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
];

const itemHandlers = [
  http.get(
    "/api/items",
    withAuth(() => HttpResponse.json(getItems())),
  ),
  http.get(
    "/api/items/:id",
    withAuth(({ params }) => {
      const item = getItem(String(params.id));
      if (!item) {
        return HttpResponse.json({ message: "Item not found" }, { status: 404 });
      }
      return HttpResponse.json(item);
    }),
  ),
  http.post(
    "/api/items",
    withAuth(
      withAudit(
        async ({ request }) => {
          const body = await jsonBody<Omit<Item, "id">>(request);
          if (!body.sku || !body.name || body.weight === undefined || body.weight <= 0) {
            return HttpResponse.json(
              { message: "sku, name and positive weight are required" },
              { status: 422 },
            );
          }
          const item = createItem(body);
          return HttpResponse.json(item, { status: 201 });
        },
        {
          action: "CREATE_ITEM",
          entityType: "ITEM",
          getEntityId: async ({ response }) => {
            const data = (await response.clone().json()) as Item;
            return data.id;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.put(
    "/api/items/:id",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const body = await jsonBody<Partial<Omit<Item, "id">>>(request);
          if (
            body.weight !== undefined &&
            (typeof body.weight !== "number" || body.weight <= 0)
          ) {
            return HttpResponse.json(
              { message: "weight must be a positive number" },
              { status: 422 },
            );
          }
          const item = updateItem(String(params.id), body);
          if (!item) {
            return HttpResponse.json({ message: "Item not found" }, { status: 404 });
          }
          return HttpResponse.json(item);
        },
        {
          action: "UPDATE_ITEM",
          entityType: "ITEM",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getItem(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
  http.delete(
    "/api/items/:id",
    withAuth(
      withAudit(
        ({ params }) => {
          const current = getItem(String(params.id));
          if (!current) {
            return HttpResponse.json({ message: "Item not found" }, { status: 404 });
          }
          deleteItem(String(params.id));
          return HttpResponse.json(current);
        },
        {
          action: "DELETE_ITEM",
          entityType: "ITEM",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getItem(String(params.id));
            return current ? JSON.stringify(current) : undefined;
          },
          getNewValue: async ({ response }) => JSON.stringify(await response.clone().json()),
        },
      ),
    ),
  ),
];

const orderHandlers = [
  http.get(
    "/api/orders",
    withAuth(({ request }) => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") as OrderStatus | null;
      const clientId = url.searchParams.get("clientId");
      const transportTypeId = url.searchParams.get("transportTypeId");
      const scheduledDateFrom = url.searchParams.get("scheduledDateFrom");
      const scheduledDateTo = url.searchParams.get("scheduledDateTo");
      const page = Number(url.searchParams.get("page") ?? "1");
      const limit = Number(url.searchParams.get("limit") ?? "10");
      let filtered = getOrders();
      if (status) {
        filtered = filtered.filter((order) => order.status === status);
      }
      if (clientId) {
        filtered = filtered.filter((order) => order.clientId === clientId);
      }
      if (transportTypeId) {
        filtered = filtered.filter((order) => order.transportTypeId === transportTypeId);
      }
      if (scheduledDateFrom || scheduledDateTo) {
        filtered = filtered.filter((order) => {
          if (!order.scheduledDate) return false;
          if (scheduledDateFrom && order.scheduledDate < scheduledDateFrom) return false;
          if (scheduledDateTo && order.scheduledDate > scheduledDateTo) return false;
          return true;
        });
      }
      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
      const start = (safePage - 1) * safeLimit;
      const items = filtered.slice(start, start + safeLimit);
      return HttpResponse.json({
        items,
        total: filtered.length,
        page: safePage,
        limit: safeLimit,
      });
    }),
  ),
  http.get(
    "/api/orders/:id",
    withAuth(({ params }) => {
      const order = getOrder(String(params.id));
      if (!order) {
        return HttpResponse.json({ message: "Order not found" }, { status: 404 });
      }
      return HttpResponse.json(enrichOrder(order));
    }),
  ),
  http.post(
    "/api/orders",
    withAuth(
      withAudit(
        async ({ request }) => {
          const body = await jsonBody<{
            clientId?: string;
            transportTypeId?: string;
            items?: Array<{ itemId: string; quantity: number }>;
          }>(request);
          if (
            !body.clientId ||
            !body.transportTypeId ||
            !body.items ||
            body.items.length === 0
          ) {
            return HttpResponse.json({ message: "Invalid order payload" }, { status: 422 });
          }
          if (!getClient(body.clientId)) {
            return HttpResponse.json({ message: "Client not found" }, { status: 404 });
          }
          if (!isTransportTypeAuthorized(body.clientId, body.transportTypeId)) {
            return HttpResponse.json(
              { message: "Transport type not authorized for client" },
              { status: 422 },
            );
          }
          const transportType = getTransportType(body.transportTypeId);
          if (!transportType || transportType.capacity <= 0) {
            return HttpResponse.json(
              { message: "Transport type capacity is required" },
              { status: 422 },
            );
          }
          const totalWeight = body.items.reduce((sum, row) => {
            const item = getItem(row.itemId);
            if (!item) return sum;
            return sum + item.weight * row.quantity;
          }, 0);
          if (totalWeight > transportType.capacity) {
            return HttpResponse.json(
              {
                message: "Order total weight exceeds transport type capacity",
                totalWeight,
                capacity: transportType.capacity,
              },
              { status: 422 },
            );
          }
          const order = createOrder({
            clientId: body.clientId,
            transportTypeId: body.transportTypeId,
            items: body.items,
          });
          return HttpResponse.json(order, { status: 201 });
        },
        {
          action: "CREATE",
          entityType: "ORDER",
          getEntityId: async ({ response }) => {
            const data = (await response.clone().json()) as Order;
            return data.id;
          },
          getNewValue: async ({ response }) => {
            const data = await response.clone().json();
            return JSON.stringify(data);
          },
        },
      ),
    ),
  ),
  http.patch(
    "/api/orders/:id/status",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const order = getOrder(String(params.id));
          if (!order) {
            return HttpResponse.json({ message: "Order not found" }, { status: 404 });
          }
          const body = await jsonBody<{ status: OrderStatus }>(request);
          if (!canTransition(order.status, body.status)) {
            return HttpResponse.json(
              { message: "Invalid status transition" },
              { status: 409 },
            );
          }
          if (body.status === "EM_TRANSPORTE" && !order.scheduleConfirmed) {
            return HttpResponse.json(
              { message: "Schedule must be confirmed before starting transport" },
              { status: 409 },
            );
          }
          const updated = updateOrder(order.id, {
            status: body.status,
            ...(body.status === "ENTREGUE"
              ? { deliveredAt: new Date().toISOString() }
              : {}),
          });
          return HttpResponse.json(updated);
        },
        {
          action: "UPDATE_STATUS",
          entityType: "ORDER",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => getOrder(String(params.id))?.status,
          getNewValue: async ({ response }) => {
            const data = (await response.clone().json()) as Order;
            return data.status;
          },
        },
      ),
    ),
  ),
  http.patch(
    "/api/orders/:id/transport-type",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const order = getOrder(String(params.id));
          if (!order) {
            return HttpResponse.json({ message: "Order not found" }, { status: 404 });
          }
          const body = await jsonBody<{ transportTypeId: string }>(request);
          if (!body.transportTypeId) {
            return HttpResponse.json(
              { message: "transportTypeId is required" },
              { status: 422 },
            );
          }
          if (!isTransportTypeAuthorized(order.clientId, body.transportTypeId)) {
            return HttpResponse.json(
              { message: "Transport type not authorized for client" },
              { status: 422 },
            );
          }
          const updated = updateOrder(order.id, { transportTypeId: body.transportTypeId });
          return HttpResponse.json(updated);
        },
        {
          action: "UPDATE_TRANSPORT_TYPE",
          entityType: "ORDER",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => getOrder(String(params.id))?.transportTypeId,
          getNewValue: async ({ response }) => {
            const data = (await response.clone().json()) as Order;
            return data.transportTypeId;
          },
        },
      ),
    ),
  ),
  http.patch(
    "/api/orders/:id/schedule",
    withAuth(
      withAudit(
        async ({ params, request }) => {
          const order = getOrder(String(params.id));
          if (!order) {
            return HttpResponse.json({ message: "Order not found" }, { status: 404 });
          }
          if (order.status !== "PLANEJADA" && order.status !== "AGENDADA") {
            return HttpResponse.json(
              { message: "Order must be PLANEJADA or AGENDADA to schedule" },
              { status: 409 },
            );
          }
          const body = await jsonBody<{ scheduledDate?: string; deliveryWindow?: string }>(
            request,
          );
          if (!body.scheduledDate || !body.deliveryWindow) {
            return HttpResponse.json(
              { message: "scheduledDate and deliveryWindow are required" },
              { status: 422 },
            );
          }
          if (!isScheduledDateNotPast(body.scheduledDate)) {
            return HttpResponse.json(
              { message: "scheduledDate cannot be in the past" },
              { status: 422 },
            );
          }
          if (!isValidDeliveryWindow(body.deliveryWindow)) {
            return HttpResponse.json(
              { message: "deliveryWindow must be a valid preset window" },
              { status: 422 },
            );
          }
          const updated = updateOrder(order.id, {
            scheduledDate: body.scheduledDate,
            deliveryWindow: body.deliveryWindow,
            status: "AGENDADA",
            scheduleConfirmed: false,
          });
          return HttpResponse.json(updated);
        },
        {
          action: "SCHEDULE",
          entityType: "ORDER",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) => {
            const current = getOrder(String(params.id));
            if (!current) return undefined;
            return JSON.stringify({
              scheduledDate: current.scheduledDate,
              deliveryWindow: current.deliveryWindow,
              scheduleConfirmed: current.scheduleConfirmed,
            });
          },
          getNewValue: async ({ response }) => {
            const data = (await response.clone().json()) as Order;
            return JSON.stringify({
              scheduledDate: data.scheduledDate,
              deliveryWindow: data.deliveryWindow,
              status: data.status,
              scheduleConfirmed: data.scheduleConfirmed,
            });
          },
        },
      ),
    ),
  ),
  http.patch(
    "/api/orders/:id/confirm-schedule",
    withAuth(
      withAudit(
        async ({ params }) => {
          const order = getOrder(String(params.id));
          if (!order) {
            return HttpResponse.json({ message: "Order not found" }, { status: 404 });
          }
          if (order.status !== "AGENDADA") {
            return HttpResponse.json(
              { message: "Order must be AGENDADA to confirm schedule" },
              { status: 409 },
            );
          }
          if (!order.scheduledDate || !order.deliveryWindow) {
            return HttpResponse.json(
              { message: "Order must have scheduledDate and deliveryWindow" },
              { status: 422 },
            );
          }
          const updated = updateOrder(order.id, { scheduleConfirmed: true });
          return HttpResponse.json(updated);
        },
        {
          action: "CONFIRM_SCHEDULE",
          entityType: "ORDER",
          getEntityId: ({ params }) => String(params.id),
          getOldValue: ({ params }) =>
            String(getOrder(String(params.id))?.scheduleConfirmed ?? false),
          getNewValue: async ({ response }) => {
            const data = (await response.clone().json()) as Order;
            return String(data.scheduleConfirmed ?? false);
          },
        },
      ),
    ),
  ),
];

const miscHandlers = [
  http.get(
    "/api/audit-logs",
    withAuth(() => HttpResponse.json(getAuditLogs())),
  ),
  http.get(
    "/api/dashboard/kpis",
    withAuth(() => HttpResponse.json(getKpis())),
  ),
];

export const handlers = [
  ...authHandlers,
  ...clientHandlers,
  ...transportTypeHandlers,
  ...itemHandlers,
  ...orderHandlers,
  ...miscHandlers,
];
