"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api";
import { auditLogsQueryKey } from "@/features/orders/hooks/useOrders";
import type { ClientFormValues } from "@/features/registry/schemas";
import type { Client } from "@/lib/types";

export const clientsQueryKey = ["clients"] as const;

export function useClients() {
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: () => clientsApi.list(),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientFormValues) =>
      clientsApi.create({
        name: payload.name,
        authorizedTransportTypes: payload.authorizedTransportTypes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Cliente criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar cliente");
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientFormValues }) =>
      clientsApi.update(id, {
        name: payload.name,
        authorizedTransportTypes: payload.authorizedTransportTypes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Cliente atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente");
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Cliente excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir cliente");
    },
  });
}

export type { Client };
