"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/utils/format";
import { calculateTipBreakdown, DEFAULT_PLATFORM_SETTINGS } from "@/lib/utils/fee-calculator";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const PRESETS = [5, 10, 20, 50];

export default function TipPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? parseFloat(custom) || 0 : amount;
  const breakdown = calculateTipBreakdown(finalAmount, DEFAULT_PLATFORM_SETTINGS);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}/tip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: finalAmount, message }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Tip sent");
      router.push(`/order/${id}`);
    } else {
      toast.error("Failed to send tip");
    }
  }

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <Link
          href={`/order/${id}`}
          className="link mb-4 inline-flex min-h-11 items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to order
        </Link>

        <div className="panel max-w-2xl p-6 sm:p-8">
          <p className="eyebrow">Order complete</p>
          <h1 className="t-sign mb-3 mt-3">Send a tip</h1>
          <p className="text-sm text-ink-2 leading-relaxed mb-6">
            Optional. The tip is recorded on the order and added to the seller&apos;s earnings. In this demo no real money moves.
          </p>

          <label className="block text-sm font-medium text-ink mb-1.5">Amount</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmount(p);
                  setCustom("");
                }}
                className={cn(
                  "h-11 rounded-[8px] font-mono text-sm transition-colors",
                  amount === p && !custom
                    ? "bg-ink text-white"
                    : "bg-surface text-ink shadow-[inset_0_0_0_1px_#C9C6BE] hover:shadow-[inset_0_0_0_1px_#111113]"
                )}
              >
                ${p}
              </button>
            ))}
          </div>
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="Custom amount"
            inputMode="decimal"
            className="mb-4"
          />

          <label className="block text-sm font-medium text-ink mb-1.5">Message (optional)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Thanks for the great work…"
            className="mb-5"
          />

          <div className="mb-5 space-y-1.5 rounded-[10px] bg-surface-sunk p-4 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>Tip amount</span>
              <span className="num">{formatMoney(breakdown.amount)}</span>
            </div>
            <div className="flex justify-between text-ink-2 text-xs">
              <span>Platform fee (20%)</span>
              <span className="num">-{formatMoney(breakdown.platformCommission)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink pt-2 mt-1 border-t border-line">
              <span>Seller receives</span>
              <span className="num">{formatMoney(breakdown.sellerAmount)}</span>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || finalAmount < 1}
            className="btn btn-primary w-full"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send a {formatMoney(finalAmount)} tip
          </button>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
