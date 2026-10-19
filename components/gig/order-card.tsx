"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageDrawer } from "@/components/gig/package-drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format";
import { calculateOrderPricing, DEFAULT_PLATFORM_SETTINGS } from "@/lib/utils/fee-calculator";
import type { GigPackage, GigExtra } from "@/types/database.types";

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className={cn("shrink-0", muted && "text-ink-muted", bold && "font-semibold")}>{label}</span>
      <span className={cn("num shrink-0", bold && "text-[1.125rem]")}>{value}</span>
    </div>
  );
}

export function OrderCard({ gigId, packages, extras }: { gigId: string; packages: GigPackage[]; extras: GigExtra[] }) {
  const [pkgType, setPkgType] = useState<string>(packages[0]?.package_type ?? "basic");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const currentPkg = packages.find((p) => p.package_type === pkgType) ?? packages[0];
  const extrasTotal = useMemo(() => extras.filter((e) => selectedExtras.includes(e.id)).reduce((sum, e) => sum + Number(e.price), 0), [extras, selectedExtras]);

  const pricing = calculateOrderPricing(Number(currentPkg?.price ?? 0), extrasTotal, DEFAULT_PLATFORM_SETTINGS);
  const orderUrl = `/checkout?gig=${gigId}&pkg=${currentPkg?.id}&extras=${selectedExtras.join(",")}`;

  return (
    <PackageDrawer
      packages={packages}
      selected={(currentPkg?.package_type ?? "basic") as GigPackage["package_type"]}
      onSelect={(t) => setPkgType(t)}
      total={pricing.buyerTotalPaid}
      extras={
        extras.length > 0 ? (
          <div className="grid gap-2">
            <p className="eyebrow">Add-ons</p>
            {extras.map((ex) => {
              const checked = selectedExtras.includes(ex.id);
              const id = `extra-${ex.id}`;
              return (
                <label
                  key={ex.id}
                  htmlFor={id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-sm transition-colors duration-120",
                    checked ? "bg-surface-sunk" : "hover:bg-surface-sunk"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Checkbox id={id} checked={checked} onCheckedChange={() => setSelectedExtras((s) => (s.includes(ex.id) ? s.filter((x) => x !== ex.id) : [...s, ex.id]))} />
                    <span className="truncate text-ink">{ex.title}</span>
                  </span>
                  <span className="num shrink-0 text-ink">+{formatMoney(Number(ex.price))}</span>
                </label>
              );
            })}
          </div>
        ) : undefined
      }
      receipt={
        <div className="text-sm">
          <Row label="Package" value={formatMoney(pricing.gigBasePrice)} muted />
          {pricing.extrasPrice > 0 && <Row label="Add-ons" value={`+${formatMoney(pricing.extrasPrice)}`} muted />}
          <Row label="Service fee" value={formatMoney(pricing.buyerServiceFee)} muted />
          {pricing.buyerSmallOrderFee > 0 && <Row label="Small order fee" value={formatMoney(pricing.buyerSmallOrderFee)} muted />}
          <div className="mt-2 border-t border-line pt-2">
            <Row label="Total" value={formatMoney(pricing.buyerTotalPaid)} bold />
          </div>
        </div>
      }
      action={
        <div className="grid gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href={orderUrl}>Continue for {formatMoney(pricing.buyerTotalPaid)}</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/messages">Message the seller</Link>
          </Button>
        </div>
      }
    />
  );
}
