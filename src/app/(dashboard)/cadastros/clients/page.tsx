"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useClients, useDeleteClient } from "@/features/registry/hooks/useClients";
import { useTransportTypes } from "@/features/registry/hooks/useTransportTypes";
import { DeleteConfirmDialog } from "@/features/registry/components/DeleteConfirmDialog";
import type { Client } from "@/lib/types";
import * as RegistryClient from "@/features/registry/components/ClientForm";

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const { data: transportTypes = [] } = useTransportTypes();
  const deleteClient = useDeleteClient();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const transportTypeNameById = new Map(transportTypes.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Cadastro de clientes e tipos de transporte autorizados.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          Novo Cliente
        </Button>
      </div>
      <DataTable
        isLoading={isLoading}
        data={clients}
        emptyMessage="Nenhum cliente cadastrado."
        columns={[
          { header: "Nome", accessor: "name" },
          {
            header: "Tipos de transporte autorizados",
            accessor: "authorizedTransportTypes",
            cell: (row) =>
              row.authorizedTransportTypes
                .map((id) => transportTypeNameById.get(id) ?? id)
                .join(", "),
          },
          {
            header: "Ações",
            accessor: "actions",
            cell: (row) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelected(row);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="h-4 w-4" /> Excluir
                </Button>
              </div>
            ),
          },
        ]}
      />
      <RegistryClient.ClientForm open={formOpen} onOpenChange={setFormOpen} client={selected} />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir o cliente "${deleteTarget?.name}"?`}
        isPending={deleteClient.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteClient.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
