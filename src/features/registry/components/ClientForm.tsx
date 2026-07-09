"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientSchema, type ClientFormValues } from "@/features/registry/schemas";
import { useCreateClient, useUpdateClient } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import type { Client } from "@/lib/types";

type ClientFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
};

export function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { data: transportTypes = [] } = useTransportTypes();
  const isEditing = Boolean(client);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      authorizedTransportTypes: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name ?? "",
        authorizedTransportTypes: client?.authorizedTransportTypes ?? [],
      });
    }
  }, [open, client, form]);

  async function onSubmit(values: ClientFormValues) {
    if (isEditing && client) {
      await updateClient.mutateAsync({ id: client.id, payload: values });
    } else {
      await createClient.mutateAsync(values);
    }
    onOpenChange(false);
    form.reset();
  }

  const isPending = createClient.isPending || updateClient.isPending;
  const selectedTypes = form.watch("authorizedTransportTypes");

  function toggleTransportType(transportTypeId: string) {
    const current = form.getValues("authorizedTransportTypes");
    if (current.includes(transportTypeId)) {
      form.setValue(
        "authorizedTransportTypes",
        current.filter((id) => id !== transportTypeId),
        { shouldValidate: true },
      );
    } else {
      form.setValue("authorizedTransportTypes", [...current, transportTypeId], {
        shouldValidate: true,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorizedTransportTypes"
              render={() => (
                <FormItem>
                  <FormLabel>Tipos de transporte autorizados</FormLabel>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                    {transportTypes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum tipo de transporte cadastrado.
                      </p>
                    ) : (
                      transportTypes.map((t) => (
                        <label
                          key={t.id}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(t.id)}
                            onChange={() => toggleTransportType(t.id)}
                            className="h-4 w-4 rounded border"
                          />
                          {t.name}
                        </label>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
