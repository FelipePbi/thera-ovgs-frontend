import axios from "axios";
import type {
  AuditLog,
  Client,
  DashboardKpis,
  Item,
  LoginResponse,
  Order,
  OrderStatus,
  OrderWithDetails,
  OrdersListResponse,
  TransportType,
  User,
} from "@/lib/types";
import {
  clearStoredToken,
  getStoredToken,
} from "@/features/auth/storage";

export const apiClient = axios.create({ baseURL: "/api" });

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = String(error.config?.url ?? "");
      const isLoginRequest = url.includes("/auth/login");
      if (!isLoginRequest && typeof window !== "undefined") {
        clearStoredToken();
        if (!window.location.pathname.startsWith("/login")) {
          const next = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.assign(`/login?next=${next}`);
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (username: string, password: string) =>
    apiClient
      .post<LoginResponse>("/auth/login", { username, password })
      .then((r) => r.data),
  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),
};

export const clientsApi = {
  list: () => apiClient.get<Client[]>("/clients").then((r) => r.data),
  get: (id: string) => apiClient.get<Client>("/clients/" + id).then((r) => r.data),
  create: (payload: Omit<Client, "id">) =>
    apiClient.post<Client>("/clients", payload).then((r) => r.data),
  update: (id: string, payload: Partial<Omit<Client, "id">>) =>
    apiClient.put<Client>("/clients/" + id, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete<void>("/clients/" + id),
};

export const transportTypesApi = {
  list: () => apiClient.get<TransportType[]>("/transport-types").then((r) => r.data),
  get: (id: string) =>
    apiClient.get<TransportType>("/transport-types/" + id).then((r) => r.data),
  create: (payload: Omit<TransportType, "id">) =>
    apiClient.post<TransportType>("/transport-types", payload).then((r) => r.data),
  update: (id: string, payload: Partial<Omit<TransportType, "id">>) =>
    apiClient.put<TransportType>("/transport-types/" + id, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete<void>("/transport-types/" + id),
};

export const itemsApi = {
  list: () => apiClient.get<Item[]>("/items").then((r) => r.data),
  get: (id: string) => apiClient.get<Item>("/items/" + id).then((r) => r.data),
  create: (payload: Omit<Item, "id">) =>
    apiClient.post<Item>("/items", payload).then((r) => r.data),
  update: (id: string, payload: Partial<Omit<Item, "id">>) =>
    apiClient.put<Item>("/items/" + id, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete<void>("/items/" + id),
};

export type OrdersListParams = {
  status?: OrderStatus;
  clientId?: string;
  transportTypeId?: string;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  page?: number;
  limit?: number;
};

function orderPath(id: string, suffix = "") {
  return "/orders/" + encodeURIComponent(id) + suffix;
}

export const ordersApi = {
  list: (params?: OrdersListParams) =>
    apiClient.get<OrdersListResponse>("/orders", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<OrderWithDetails>(orderPath(id)).then((r) => r.data),
  create: (payload: {
    clientId: string;
    transportTypeId: string;
    items: Array<{ itemId: string; quantity: number }>;
  }) => apiClient.post<Order>("/orders", payload).then((r) => r.data),
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<Order>(orderPath(id, "/status"), { status }).then((r) => r.data),
  updateTransportType: (id: string, transportTypeId: string) =>
    apiClient
      .patch<Order>(orderPath(id, "/transport-type"), { transportTypeId })
      .then((r) => r.data),
  schedule: (id: string, payload: { scheduledDate: string; deliveryWindow: string }) =>
    apiClient.patch<Order>(orderPath(id, "/schedule"), payload).then((r) => r.data),
  confirmSchedule: (id: string) =>
    apiClient.patch<Order>(orderPath(id, "/confirm-schedule")).then((r) => r.data),
};

export const auditLogsApi = {
  list: () => apiClient.get<AuditLog[]>("/audit-logs").then((r) => r.data),
};

export const dashboardApi = {
  getKpis: () => apiClient.get<DashboardKpis>("/dashboard/kpis").then((r) => r.data),
};
