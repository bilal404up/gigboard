import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface PriceDisplayProps {
  subtotal: number;
  serviceFee: number;
  smallOrderFee?: number;
  total: number;
  className?: string;
}

/* A receipt: dotted leaders between label and amount, the total under a perforated rule. Labels are verbatim. */
export function PriceDisplay({ subtotal, serviceFee, smallOrderFee = 0, total, className }: PriceDisplayProps) {
  return (
    <div className={cn("text-sm", className)}>
      <Row label="Subtotal" value={formatMoney(subtotal)} />
      <Row label="Service fee (5.5%)" value={formatMoney(serviceFee)} muted />
      {smallOrderFee > 0 && <Row label="Small-order fee" value={formatMoney(smallOrderFee)} muted />}
      <div className="mt-2 border-t-2 border-dotted border-sand pt-2">
        <Row label="Total" value={formatMoney(total)} bold />
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className={cn("shrink-0", muted && "text-ink-muted", bold && "font-semibold")}>{label}</span>
      <span aria-hidden="true" className="mb-1 min-w-3 flex-1 border-b-2 border-dotted border-sand" />
      <span className={cn("num shrink-0", bold ? "fig-price text-ink" : "")}>{value}</span>
    </div>
  );
}
