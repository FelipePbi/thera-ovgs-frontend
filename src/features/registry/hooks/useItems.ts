"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { itemsApi } from "@/lib/api";
import { auditLogsQueryKey } from "@/features/orders/hooks/useOrders";
import type { ItemFormValues } from "@/features/registry/schemas";
import type { Item } from "@/lib/types";

export const itemsQueryKey = ["items"] as const;

export function useItems() {
  return useQuery({
    queryKey: itemsQueryKey,
    queryFn: () => itemsApi.list(),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemFormValues) =>
      itemsApi.create({
        sku: payload.sku,
        name: payload.name,
        weight: payload.weight,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Item criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar item");
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ItemFormValues }) =>
      itemsApi.update(id, {
        sku: payload.sku,
        name: payload.name,
        weight: payload.weight,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Item atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar item");
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
      queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
      toast.success("Item excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir item");
    },
  });
}

export type { Item };
