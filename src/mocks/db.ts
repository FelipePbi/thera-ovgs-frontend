import type {
  AuditLog,
  Client,
  DashboardKpis,
  Item,
  Order,
  OrderStatus,
  TransportType,
} from "@/lib/types";
import { ORDER_STATUS_FLOW } from "@/features/orders/stateMachine";

let transportTypes: TransportType[] = [];
let clients: Client[] = [];
let items: Item[] = [];
let orders: Order[] = [];
let auditLogs: AuditLog[] = [];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatOrderId(sequence: number): string {
  return `#${String(sequence).padStart(4, "0")}`;
}

function createOrderId(): string {
  let maxSequence = 0;
  for (const order of orders) {
    const match = /^#(\d+)$/.exec(order.id);
    if (match) {
      maxSequence = Math.max(maxSequence, Number(match[1]));
    }
  }
  return formatOrderId(maxSequence + 1);
}

function seedData(): void {
  transportTypes = [
    { id: "t1", name: "Caminhão", capacity: 1200 },
    { id: "t2", name: "Carreta", capacity: 2500 },
    { id: "t3", name: "Bi-truck", capacity: 1800 },
    { id: "t4", name: "VUC", capacity: 500 },
  ];

  clients = [
    { id: "c1", name: "Acme Industria", authorizedTransportTypes: ["t1", "t2"] },
    { id: "c2", name: "Beta Comercio", authorizedTransportTypes: ["t2", "t3"] },
    { id: "c3", name: "Gamma Atacado", authorizedTransportTypes: ["t1", "t3", "t4"] },
    { id: "c4", name: "Delta Varejo", authorizedTransportTypes: ["t4"] },
  ];

  items = [
    { id: "i1", sku: "SKU-001", name: "Parafuso M8", weight: 0.05 },
    { id: "i2", sku: "SKU-002", name: "Chapa Aco 2mm", weight: 12.5 },
    { id: "i3", sku: "SKU-003", name: "Tinta Epoxi", weight: 4.2 },
    { id: "i4", sku: "SKU-004", name: "Cabo Eletrico 10m", weight: 3.1 },
    { id: "i5", sku: "SKU-005", name: "Valvula Industrial", weight: 8.7 },
    { id: "i6", sku: "SKU-006", name: "Filtro HEPA", weight: 1.2 },
  ];

  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  const daysFromNow = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  orders = [
    {
      id: "#0001",
      clientId: "c1",
      transportTypeId: "t1",
      items: [
        { itemId: "i1", quantity: 100 },
        { itemId: "i2", quantity: 5 },
      ],
      status: "CRIADA",
      createdAt: daysAgo(2),
    },
    {
      id: "#0002",
      clientId: "c2",
      transportTypeId: "t2",
      items: [{ itemId: "i3", quantity: 20 }],
      status: "PLANEJADA",
      createdAt: daysAgo(5),
    },
    {
      id: "#0003",
      clientId: "c3",
      transportTypeId: "t3",
      items: [
        { itemId: "i4", quantity: 15 },
        { itemId: "i5", quantity: 2 },
      ],
      status: "AGENDADA",
      scheduledDate: daysFromNow(2),
      deliveryWindow: "08:00-12:00",
      scheduleConfirmed: false,
      createdAt: daysAgo(7),
    },
    {
      id: "#0004",
      clientId: "c1",
      transportTypeId: "t1",
      items: [{ itemId: "i6", quantity: 50 }],
      status: "EM_TRANSPORTE",
      scheduledDate: daysFromNow(0),
      deliveryWindow: "13:00-18:00",
      scheduleConfirmed: true,
      createdAt: daysAgo(10),
    },
    {
      id: "#0005",
      clientId: "c2",
      transportTypeId: "t2",
      items: [{ itemId: "i1", quantity: 200 }],
      status: "ENTREGUE",
      scheduledDate: daysAgo(1).slice(0, 10),
      deliveryWindow: "08:00-12:00",
      scheduleConfirmed: true,
      deliveredAt: daysAgo(1),
      createdAt: daysAgo(14),
    },
    {
      id: "#0006",
      clientId: "c3",
      transportTypeId: "t4",
      items: [{ itemId: "i2", quantity: 10 }],
      status: "AGENDADA",
      scheduledDate: daysFromNow(1),
      deliveryWindow: "08:00-12:00",
      scheduleConfirmed: true,
      createdAt: daysAgo(12),
    },
  ];

  auditLogs = [
    {
      id: "a1",
      timestamp: daysAgo(2),
      action: "CREATE",
      entityType: "ORDER",
      entityId: "#0001",
      newValue: JSON.stringify({
        id: "#0001",
        clientId: "c1",
        transportTypeId: "t1",
        status: "CRIADA",
        items: [
          { itemId: "i1", quantity: 100 },
          { itemId: "i2", quantity: 5 },
        ],
      }),
      userId: "u1",
      username: "teste",
    },
    {
      id: "a2",
      timestamp: daysAgo(4),
      action: "UPDATE_STATUS",
      entityType: "ORDER",
      entityId: "#0002",
      oldValue: "CRIADA",
      newValue: "PLANEJADA",
      userId: "u1",
      username: "teste",
    },
    {
      id: "a3",
      timestamp: daysAgo(6),
      action: "SCHEDULE",
      entityType: "ORDER",
      entityId: "#0003",
      oldValue: JSON.stringify({
        scheduledDate: undefined,
        deliveryWindow: undefined,
      }),
      newValue: JSON.stringify({
        scheduledDate: daysFromNow(2),
        deliveryWindow: "08:00-12:00",
        status: "AGENDADA",
      }),
      userId: "u1",
      username: "teste",
    },
    {
      id: "a4",
      timestamp: daysAgo(8),
      action: "UPDATE_TRANSPORT_TYPE",
      entityType: "ORDER",
      entityId: "#0004",
      oldValue: "t2",
      newValue: "t1",
      userId: "u1",
      username: "teste",
    },
    {
      id: "a5",
      timestamp: daysAgo(9),
      action: "UPDATE_STATUS",
      entityType: "ORDER",
      entityId: "#0004",
      oldValue: "AGENDADA",
      newValue: "EM_TRANSPORTE",
      userId: "u1",
      username: "teste",
    },
  ];
}

seedData();

export function resetDb(): void {
  seedData();
}

export function getTransportTypes(): TransportType[] {
  return [...transportTypes];
}

export function getTransportType(id: string): TransportType | undefined {
  return transportTypes.find((t) => t.id === id);
}

export function createTransportType(data: Omit<TransportType, "id">): TransportType {
  const transportType: TransportType = { id: createId(), ...data };
  transportTypes.push(transportType);
  return transportType;
}

export function updateTransportType(
  id: string,
  data: Partial<Omit<TransportType, "id">>,
): TransportType | undefined {
  const index = transportTypes.findIndex((t) => t.id === id);
  if (index === -1) {
    return undefined;
  }
  transportTypes[index] = { ...transportTypes[index], ...data };
  return transportTypes[index];
}

export function deleteTransportType(id: string): boolean {
  const before = transportTypes.length;
  transportTypes = transportTypes.filter((t) => t.id !== id);
  return transportTypes.length < before;
}

export function getClients(): Client[] {
  return [...clients];
}

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function createClient(data: Omit<Client, "id">): Client {
  const client: Client = { id: createId(), ...data };
  clients.push(client);
  return client;
}

export function updateClient(
  id: string,
  data: Partial<Omit<Client, "id">>,
): Client | undefined {
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) {
    return undefined;
  }
  clients[index] = { ...clients[index], ...data };
  return clients[index];
}

export function deleteClient(id: string): boolean {
  const before = clients.length;
  clients = clients.filter((c) => c.id !== id);
  return clients.length < before;
}

export function getItems(): Item[] {
  return [...items];
}

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}

export function createItem(data: Omit<Item, "id">): Item {
  const item: Item = { id: createId(), ...data };
  items.push(item);
  return item;
}

export function updateItem(
  id: string,
  data: Partial<Omit<Item, "id">>,
): Item | undefined {
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return undefined;
  }
  items[index] = { ...items[index], ...data };
  return items[index];
}

export function deleteItem(id: string): boolean {
  const before = items.length;
  items = items.filter((i) => i.id !== id);
  return items.length < before;
}

export function getOrders(): Order[] {
  return [...orders];
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(
  data: Omit<Order, "id" | "status" | "createdAt">,
): Order {
  const order: Order = {
    id: createOrderId(),
    ...data,
    status: "CRIADA",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function updateOrder(id: string, data: Partial<Order>): Order | undefined {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return undefined;
  }
  orders[index] = { ...orders[index], ...data };
  return orders[index];
}

export function deleteOrder(id: string): boolean {
  const before = orders.length;
  orders = orders.filter((o) => o.id !== id);
  return orders.length < before;
}

export function addAuditLog(entry: Omit<AuditLog, "id" | "timestamp">): AuditLog {
  const log: AuditLog = {
    id: createId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLogs.push(log);
  return log;
}

export function getAuditLogs(): AuditLog[] {
  return [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getKpis(): DashboardKpis {
  const byStatus = ORDER_STATUS_FLOW.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  const today = new Date().toISOString().slice(0, 10);
  const overdueOrders = orders.filter(
    (o) => o.scheduledDate && o.scheduledDate < today && o.status !== "ENTREGUE",
  ).length;

  const inTransportOrders = orders.filter((o) => o.status === "EM_TRANSPORTE").length;

  return {
    totalOrders: orders.length,
    byStatus,
    overdueOrders,
    inTransportOrders,
  };
}
