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
import {
  transportTypeSchema,
  type TransportTypeFormValues,
} from "@/features/registry/schemas";
import {
  useCreateTransportType,
  useUpdateTransportType,
} from "@/features/registry/hooks/useTransportTypes";
import type { TransportType } from "@/lib/types";

type TransportTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transportType?: TransportType | null;
};

export function TransportTypeForm({
  open,
  onOpenChange,
  transportType,
}: TransportTypeFormProps) {
  const createTransportType = useCreateTransportType();
  const updateTransportType = useUpdateTransportType();
  const isEditing = Boolean(transportType);

  const form = useForm<TransportTypeFormValues>({
    resolver: zodResolver(transportTypeSchema),
    defaultValues: {
      name: "",
      capacity: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: transportType?.name ?? "",
        capacity: transportType?.capacity,
      });
    }
  }, [open, transportType, form]);

  async function onSubmit(values: TransportTypeFormValues) {
    if (isEditing && transportType) {
      await updateTransportType.mutateAsync({ id: transportType.id, payload: values });
    } else {
      await createTransportType.mutateAsync(values);
    }
    onOpenChange(false);
    form.reset();
  }

  const isPending = createTransportType.isPending || updateTransportType.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar tipo de transporte" : "Novo tipo de transporte"}
          </DialogTitle>
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
                    <Input placeholder="Ex: Caminhão, Carreta, Bi-truck" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade (kg) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      placeholder="Ex: 1200"
                      required
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
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
