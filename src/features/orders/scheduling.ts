export const DELIVERY_WINDOWS = [
  "08:00-12:00",
  "13:00-18:00",
  "18:00-22:00",
] as const;

export type DeliveryWindow = (typeof DELIVERY_WINDOWS)[number];

export function isValidDeliveryWindow(value: string): value is DeliveryWindow {
  return (DELIVERY_WINDOWS as readonly string[]).includes(value);
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isScheduledDateNotPast(scheduledDate: string): boolean {
  return scheduledDate >= todayISODate();
}
