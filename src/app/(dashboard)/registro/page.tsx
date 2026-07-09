"use client";

import { useQuery } from "@tanstack/react-query";
import { AuditTimelineSkeleton } from "@/components/skeletons";
import { auditLogsApi } from "@/lib/api";
import { auditLogsQueryKey } from "@/features/orders/hooks/useOrders";
import type { AuditLog } from "@/lib/types";
import { formatDateTime } from "@/utils/formatters";

const ACTION_LABELS: Record<AuditLog["action"], string> = {
  CREATE: "Criação de Ordem de Venda",
  UPDATE_STATUS: "Alteração de status",
  SCHEDULE: "Alteração de agendamento",
  CONFIRM_SCHEDULE: "Confirmação de agendamento",
  UPDATE_TRANSPORT_TYPE: "Alteração de transporte",
  CREATE_CLIENT: "Criação de cliente",
  UPDATE_CLIENT: "Alteração de cliente",
  DELETE_CLIENT: "Exclusão de cliente",
  CREATE_TRANSPORT_TYPE: "Criação de tipo de transporte",
  UPDATE_TRANSPORT_TYPE_ENTITY: "Alteração de tipo de transporte",
  DELETE_TRANSPORT_TYPE: "Exclusão de tipo de transporte",
  CREATE_ITEM: "Criação de item",
  UPDATE_ITEM: "Alteração de item",
  DELETE_ITEM: "Exclusão de item",
};

function formatAuditValue(value?: string): string {
  if (value === undefined || value === "") {
    return "—";
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || typeof parsed !== "object") {
      return String(parsed);
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

export default function RegistroPage() {
  const logsQuery = useQuery({
    queryKey: auditLogsQueryKey,
    queryFn: () => auditLogsApi.list(),
  });

  const logs = logsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoria</h1>
        <p className="text-muted-foreground">
          Rastreabilidade de eventos relevantes do sistema, incluindo o usuário
          responsável.
        </p>
      </div>

      {logsQuery.isLoading && <AuditTimelineSkeleton />}

      {logsQuery.isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os logs de auditoria.
        </p>
      )}

      {!logsQuery.isLoading && !logsQuery.isError && logs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum evento registrado ainda. Crie ou altere um registro para gerar
          rastreabilidade.
        </p>
      )}

      {!logsQuery.isLoading && !logsQuery.isError && logs.length > 0 && (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {logs.map((log) => (
            <li key={log.id} className="relative">
              <span className="absolute -left-[1.625rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Usuário:{" "}
                      <span className="font-medium text-foreground">
                        {log.username}
                      </span>
                    </p>
                  </div>
                  <p className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    {log.entityType} · {log.entityId}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estado anterior
                    </p>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/60 p-2 text-xs">
                      {formatAuditValue(log.oldValue)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estado posterior
                    </p>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/60 p-2 text-xs">
                      {formatAuditValue(log.newValue)}
                    </pre>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
