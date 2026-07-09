"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { transportTypesApi } from "@/lib/api";
import { auditLogsQueryKey } from "@/features/orders/hooks/useOrders";
import type { TransportTypeFormValues } from "@/features/registry/schemas";
import type { TransportType } from "@/lib/types";

export const transportTypesQueryKey = ["transport-types"] as const;

export function useTransportTypes() {
  return useQuery({
    queryKey: transportTypesQueryKey,
    queryFn: () => transportTypesApi.list(),
  });
}

export function useCreateTransportType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransportTypeFormValues) =>
      transportTypesApi.create({
        name: payload.name,
        capacity: payload.capacity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportTypesQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Tipo de transporte criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar tipo de transporte");
    },
  });
}

export function useUpdateTransportType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransportTypeFormValues }) =>
      transportTypesApi.update(id, {
        name: payload.name,
        capacity: payload.capacity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportTypesQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Tipo de transporte atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar tipo de transporte");
    },
  });
}

export function useDeleteTransportType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transportTypesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportTypesQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Tipo de transporte excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir tipo de transporte");
    },
  });
}

export type { TransportType };
