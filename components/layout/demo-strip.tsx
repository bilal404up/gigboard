"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PinTile } from "@/components/ui/pin-tile";
import { useUser } from "@/lib/contexts/user-context";
import { DEMO_ROLES, type DemoRole } from "@/lib/demo";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<DemoRole, string> = { buyer: "Buyer", seller: "Seller", admin: "Admin" };

/**
 * Fixed strip at the bottom of every page in demo mode. It says the data is sample data
 * and lets a visitor sign in as a sample buyer, seller or admin in one click.
 * The server decides whether a switch is allowed; this component only asks.
 */
export function DemoStrip() {
  const router = useRouter();
  const { user } = useUser();
  const [pending, setPending] = useState<DemoRole | null>(null);
  const current: DemoRole | null = user ? (user.is_admin ? "admin" : user.is_seller ? "seller" : "buyer") : null;

  async function switchTo(role: DemoRole) {
    if (pending) return;
    setPending(role);
    try {
      const res = await fetch("/api/demo/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not switch account");
        return;
      }
      router.push(data.redirect ?? "/");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      role="region"
      aria-label="Demo notice"
      className="fixed inset-x-0 bottom-0 z-50 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-ink bg-canvas-subtle px-4 py-1 text-[13px] leading-[18px] text-ink-muted"
    >
      <p className="flex min-w-0 items-center gap-2">
        <PinTile tone="demo">Demo</PinTile>
        <span className="truncate">
          <span className="sm:hidden">Sample data. Stripe test mode.</span>
          <span className="hidden sm:inline">
            Sample data: gigs, sellers and reviews are invented. Stripe test mode, no real money moves.
          </span>
        </span>
      </p>
      <div className="flex items-center gap-2">
        <span>View as</span>
        <div role="group" aria-label="View as" className="flex overflow-hidden rounded-xs border border-ink">
          {DEMO_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => switchTo(role)}
              disabled={pending !== null}
              aria-pressed={current === role}
              className={cn(
                "h-7 px-3 text-[13px] font-semibold",
                current === role ? "bg-ink text-white" : "bg-white text-ink hover:bg-brand-primary-50"
              )}
            >
              {pending === role ? "Switching" : LABELS[role]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
