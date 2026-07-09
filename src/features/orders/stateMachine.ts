import type { OrderStatus } from '@/lib/types';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'CRIADA',
  'PLANEJADA',
  'AGENDADA',
  'EM_TRANSPORTE',
  'ENTREGUE',
];


const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  CRIADA: 'Marcar como planejada',
  PLANEJADA: 'Agendar entrega',
  AGENDADA: 'Iniciar transporte',
  EM_TRANSPORTE: 'Confirmar entrega',
};


export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(current);
  if (index === -1) {
    return null;
  }
  if (index + 1 === ORDER_STATUS_FLOW.length) {
    return null;
  }
  return ORDER_STATUS_FLOW[index + 1];
}


export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  const next = getNextStatus(from);
  return next === to;
}

export function getAvailableActions(
  status: OrderStatus,
): { label: string; nextStatus: OrderStatus }[] {
  const nextStatus = getNextStatus(status);
  if (!nextStatus) {
    return [];
  }
  const label = STATUS_LABELS[status] ?? `Avancar para ${nextStatus}`;
  return [{ label, nextStatus }];
}

