"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  useTransportTypes,
  useDeleteTransportType,
} from "@/features/registry/hooks/useTransportTypes";
import { DeleteConfirmDialog } from "@/features/registry/components/DeleteConfirmDialog";
import type { TransportType } from "@/lib/types";
import { TransportTypeForm } from "@/features/registry/components/TransportTypeForm";

export default function TransportTypesPage() {
  const { data: transportTypes = [], isLoading } = useTransportTypes();
  const deleteTransportType = useDeleteTransportType();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TransportType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransportType | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Transporte</h1>
          <p className="text-muted-foreground">
            Cadastro de tipos de transporte (Caminhão, Carreta, Bi-truck, etc.).
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          Novo Tipo de Transporte
        </Button>
      </div>
      <DataTable
        isLoading={isLoading}
        data={transportTypes}
        emptyMessage="Nenhum tipo de transporte cadastrado."
        columns={[
          { header: "Nome", accessor: "name" },
          {
            header: "Capacidade",
            accessor: "capacity",
            cell: (row) => row.capacity ?? "—",
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
      <TransportTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transportType={selected}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir tipo de transporte"
        description={`Tem certeza que deseja excluir o tipo de transporte "${deleteTarget?.name}"?`}
        isPending={deleteTransportType.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteTransportType.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
