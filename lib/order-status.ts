import type { OrderStatus } from "@/types/database.types";

/*
 * Order statuses in the timetable vocabulary. The tone says where the money is:
 * held (amber) while Gigboard holds it, go (green) once it is released to the seller,
 * stop (red) for a dispute, neutral for everything else.
 */
export type StatusTone = "held" | "go" | "stop" | "neutral";

export const STATUS_INFO: Record<OrderStatus, { label: string; board: string; tone: StatusTone; money: string }> = {
  pending_payment: { label: "Awaiting payment", board: "BOOKED", tone: "neutral", money: "Not paid yet" },
  active: { label: "Held", board: "HELD", tone: "held", money: "Payment held by Gigboard" },
  requires_requirements: { label: "Brief needed", board: "BRIEF DUE", tone: "held", money: "Payment held by Gigboard" },
  in_progress: { label: "In progress", board: "IN PROGRESS", tone: "held", money: "Payment held by Gigboard" },
  delivered: { label: "Delivered", board: "DELIVERED", tone: "held", money: "Payment held until approval" },
  revision_requested: { label: "Revision", board: "REVISION", tone: "held", money: "Payment held by Gigboard" },
  completed: { label: "Released", board: "RELEASED", tone: "go", money: "Payment released to the seller" },
  cancelled: { label: "Cancelled", board: "CANCELLED", tone: "neutral", money: "Order cancelled" },
  disputed: { label: "Disputed", board: "DISPUTED", tone: "stop", money: "Payment held until the dispute is resolved" },
};

export function statusInfo(status: string) {
  return STATUS_INFO[status as OrderStatus] ?? { label: status.replace(/_/g, " "), board: status.toUpperCase(), tone: "neutral" as StatusTone, money: "" };
}

export const OPEN_STATUSES: OrderStatus[] = ["active", "requires_requirements", "in_progress", "delivered", "revision_requested", "disputed"];

/** "I will design a logo..." reads as "Design a logo..." everywhere a gig is named. */
export function gigTitle(t: string | null | undefined): string {
  if (!t) return "Order";
  const s = t.replace(/^\s*i\s+will\s+/i, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : t;
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
