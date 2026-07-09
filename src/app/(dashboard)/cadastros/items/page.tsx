"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useItems, useDeleteItem } from "@/features/registry/hooks/useItems";
import { DeleteConfirmDialog } from "@/features/registry/components/DeleteConfirmDialog";
import type { Item } from "@/lib/types";
import * as RegistryItem from "@/features/registry/components/ItemForm";

export default function ItemsPage() {
  const { data: items = [], isLoading } = useItems();
  const deleteItem = useDeleteItem();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Itens</h1>
          <p className="text-muted-foreground">Cadastro de itens, SKU e peso.</p>
        </div>
        <Button onClick={() => { setSelected(null); setFormOpen(true); }}>Novo Item</Button>
      </div>
      <DataTable
        isLoading={isLoading}
        data={items}
        emptyMessage="Nenhum item cadastrado."
        columns={[
          { header: "SKU", accessor: "sku" },
          { header: "Nome", accessor: "name" },
          { header: "Peso (kg)", accessor: "weight" },
          {
            header: "Ações",
            accessor: "actions",
            cell: (row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSelected(row); setFormOpen(true); }}>
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
      <RegistryItem.ItemForm open={formOpen} onOpenChange={setFormOpen} item={selected} />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir item"
        description={`Tem certeza que deseja excluir o item "${deleteTarget?.name}"?`}
        isPending={deleteItem.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteItem.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
