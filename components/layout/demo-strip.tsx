"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/lib/contexts/user-context";
import { DEMO_ROLES, type DemoRole } from "@/lib/demo";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<DemoRole, string> = { buyer: "Buyer", seller: "Seller", admin: "Admin" };

/**
 * Demo mode lives in the nav now. This exports two things:
 * DemoSwitch is the Buyer, Seller, Admin control that the navbar renders.
 * DemoStrip is the one-line notice above the nav. It scrolls away and covers nothing.
 * The server decides whether a switch is allowed; this component only asks.
 */
export function DemoSwitch({ className }: { className?: string }) {
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
    <div role="group" aria-label="View the demo as" className={cn("inline-flex items-center gap-0.5 rounded-[10px] bg-laminate-sunk p-0.5", className)}>
      {DEMO_ROLES.map((role) => {
        const on = current === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => switchTo(role)}
            disabled={pending !== null}
            aria-pressed={on}
            className={cn(
              "inline-flex h-9 min-w-11 flex-1 items-center justify-center rounded-[8px] px-3 text-[13px] font-semibold transition-colors md:h-8 md:flex-none",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60",
              on ? "bg-white text-ink shadow-[0_0_0_1px_#E3E4E6]" : "text-ink-muted hover:text-ink"
            )}
          >
            {pending === role ? "Switching" : LABELS[role]}
          </button>
        );
      })}
    </div>
  );
}

export function DemoStrip() {
  return (
    <div role="region" aria-label="Demo notice" className="demo-bar">
      <p className="wrap flex items-center gap-2 text-[13px] leading-[18px]">
        <span className="demo-tag">Demo</span>
        <span className="truncate">
          <span className="sm:hidden">Sample data. Stripe test mode, no real money moves.</span>
          <span className="hidden sm:inline">Sample data: gigs, sellers and reviews are invented. Stripe test mode, no real money moves. Switch roles in the menu.</span>
        </span>
      </p>
    </div>
  );
}
