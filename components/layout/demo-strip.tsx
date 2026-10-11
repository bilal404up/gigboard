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
    <div role="region" aria-label="Demo notice" className="demo-bar">
      <div className="wrap flex h-full flex-wrap items-center gap-x-4 gap-y-2 py-2 text-[13px] leading-[18px] text-sand">
        <p className="flex min-w-0 flex-1 items-center gap-2">
          <PinTile tone="demo">Demo</PinTile>
          <span className="truncate">
            <span className="sm:hidden">Sample data. Stripe test mode.</span>
            <span className="hidden sm:inline">
              Sample data: gigs, sellers and reviews are invented. Stripe test mode, no real money moves.
            </span>
          </span>
        </p>
        <div className="flex basis-full items-center gap-2 md:basis-auto">
          <span className="hidden md:inline">View as</span>
          <div role="group" aria-label="View as" className="flex flex-1 gap-1 md:flex-none">
            {DEMO_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => switchTo(role)}
                disabled={pending !== null}
                aria-pressed={current === role}
                className={cn(
                  "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[4px] px-3 text-[13px] font-semibold transition-colors duration-120 md:h-9 md:flex-none",
                  "focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release disabled:opacity-60",
                  current === role
                    ? "bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] text-ink shadow-[0_1px_0_#7A5A14]"
                    : "text-laminate shadow-[inset_0_0_0_1.5px_rgba(239,233,223,0.5)] hover:bg-mahogany-raised"
                )}
              >
                {current === role ? <span className="lamp lamp--release h-2 w-2" aria-hidden="true" /> : null}
                {pending === role ? "Switching" : LABELS[role]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
