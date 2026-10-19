"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const label = current ? LABELS[current] : "Choose";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending !== null}
          aria-label={`Switch role. Demo: ${label}`}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full bg-surface-sunk px-4 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_#E2E0DA] md:h-9",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60",
            className
          )}
        >
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-2" aria-hidden="true">
            Demo:
          </span>
          <span aria-hidden="true">{pending ? "Switching" : label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>View the demo as</DropdownMenuLabel>
        {DEMO_ROLES.map((role) => (
          <DropdownMenuItem key={role} disabled={pending !== null} onSelect={() => switchTo(role)} className={cn(current === role && "font-semibold")}>
            {LABELS[role]}
            {current === role ? <span className="ml-auto text-xs font-normal text-ink-2">Current</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DemoStrip() {
  return (
    <div role="region" aria-label="Demo notice" className="demo-bar">
      <p className="wrap flex items-center gap-2.5 text-[12.5px] leading-[18px]">
        <span className="demo-tag">Demo</span>
        <span className="min-w-0 truncate">
          <span className="sm:hidden">Sample data · No real money moves</span>
          <span className="hidden sm:inline">Sample gigs, sellers and reviews · Demo payments, no real money moves · Switch roles in the menu</span>
        </span>
      </p>
    </div>
  );
}
