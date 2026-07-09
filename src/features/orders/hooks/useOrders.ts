"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { ordersApi, type OrdersListParams } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

export const ordersQueryKey = ["orders"] as const;
export const auditLogsQueryKey = ["audit-logs"] as const;

export function useOrders(params?: OrdersListParams) {
  return useQuery({
    queryKey: [...ordersQueryKey, params ?? {}],
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ordersQueryKey, id],
    queryFn: () => ordersApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Ordem criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar ordem");
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, variables.id] });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Status atualizado");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const message = error.response.data?.message as string | undefined;
        if (message?.toLowerCase().includes("schedule")) {
          toast.error("Confirme o agendamento antes de iniciar o transporte.");
          return;
        }
        toast.error("Transição de status inválida");
        return;
      }
      toast.error("Erro ao atualizar status");
    },
  });
}

export function useUpdateOrderTransportType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transportTypeId }: { id: string; transportTypeId: string }) =>
      ordersApi.updateTransportType(id, transportTypeId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, variables.id] });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Tipo de transporte atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar tipo de transporte");
    },
  });
}

export function useScheduleOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      scheduledDate,
      deliveryWindow,
    }: {
      id: string;
      scheduledDate: string;
      deliveryWindow: string;
    }) => ordersApi.schedule(id, { scheduledDate, deliveryWindow }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, variables.id] });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Agendamento salvo com sucesso");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error("Não é possível agendar neste status.");
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        toast.error("Data ou janela de entrega inválida.");
        return;
      }
      toast.error("Erro ao agendar ordem");
    },
  });
}

export function useConfirmScheduleOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.confirmSchedule(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, id] });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Agendamento confirmado");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error("Só é possível confirmar agendamento em ordens AGENDADAS.");
        return;
      }
      toast.error("Erro ao confirmar agendamento");
    },
  });
}
