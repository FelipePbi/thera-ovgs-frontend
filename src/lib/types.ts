export type TransportType = {
  id: string;
  name: string;
  capacity: number;
};

export type Client = {
  id: string;
  name: string;
  authorizedTransportTypes: string[];
};

export type Item = {
  id: string;
  sku: string;
  name: string;
  weight: number;
};

export type OrderStatus =
  | "CRIADA"
  | "PLANEJADA"
  | "AGENDADA"
  | "EM_TRANSPORTE"
  | "ENTREGUE";

export type Order = {
  id: string;
  clientId: string;
  transportTypeId: string;
  items: Array<{ itemId: string; quantity: number }>;
  status: OrderStatus;
  scheduledDate?: string;
  deliveryWindow?: string;
  scheduleConfirmed?: boolean;
  deliveredAt?: string;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
  name: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type AuditEntityType = "ORDER" | "CLIENT" | "TRANSPORT_TYPE" | "ITEM";

export type AuditAction =
  | "CREATE"
  | "UPDATE_STATUS"
  | "SCHEDULE"
  | "CONFIRM_SCHEDULE"
  | "UPDATE_TRANSPORT_TYPE"
  | "CREATE_CLIENT"
  | "UPDATE_CLIENT"
  | "DELETE_CLIENT"
  | "CREATE_TRANSPORT_TYPE"
  | "UPDATE_TRANSPORT_TYPE_ENTITY"
  | "DELETE_TRANSPORT_TYPE"
  | "CREATE_ITEM"
  | "UPDATE_ITEM"
  | "DELETE_ITEM";

export type AuditLog = {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  oldValue?: string;
  newValue: string;
  userId: string;
  username: string;
};

export type OrdersListResponse = {
  items: Order[];
  total: number;
  page: number;
  limit: number;
};

export type DashboardKpis = {
  totalOrders: number;
  byStatus: Record<OrderStatus, number>;
  overdueOrders: number;
  inTransportOrders: number;
};

export type OrderWithDetails = Order & {
  clientName: string;
  transportTypeName: string;
};
