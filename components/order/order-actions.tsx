"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { toast } from "sonner";
import type { Order } from "@/types/database.types";

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="panel space-y-4 p-5 md:p-6" aria-label={title}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="t-head mt-2">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* The actions for the current step. Buttons are sentence case; the green one is the only control that releases money. */
export function OrderActions({ order, isBuyer }: { order: Order; isBuyer: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [revisionMsg, setRevisionMsg] = useState("");

  async function call(path: string, body?: any, key = path) {
    setLoading(key);
    const res = await fetch(`/api/orders/${order.id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(null);
    if (!res.ok) {
      toast.error("That did not work. Try again.");
      return;
    }
    toast.success("Done");
    router.refresh();
  }

  if (order.status === "requires_requirements") {
    return isBuyer ? (
      <Panel eyebrow="Your next step" title="Send your brief">
        <p className="text-sm text-ink-2">The seller needs your project details before they start. Your payment stays held while they work.</p>
        <Button asChild className="w-full">
          <Link href={`/order/${order.id}/requirements`}>Send requirements</Link>
        </Button>
      </Panel>
    ) : (
      <Panel eyebrow="Waiting" title="Waiting for the brief">
        <p className="text-sm text-ink-2">The buyer has paid. The payment is held until they approve your delivery.</p>
      </Panel>
    );
  }

  if (order.status === "in_progress" || order.status === "revision_requested") {
    return (
      <Panel eyebrow={order.status === "revision_requested" ? "Revision requested" : "In progress"} title={isBuyer ? "The seller is working on it" : "Deliver the work"}>
        {order.status === "revision_requested" && order.revision_message ? (
          <div className="rounded-[8px] bg-surface-sunk p-3">
            <p className="eyebrow mb-1">Requested changes</p>
            <p className="text-sm">{order.revision_message}</p>
          </div>
        ) : null}
        {order.delivery_due_at && (
          <div>
            <p className="text-sm text-ink-2">Due in</p>
            <CountdownTimer to={order.delivery_due_at} className="fig-price-xl mt-1 text-ink" />
          </div>
        )}
        {!isBuyer && order.status === "in_progress" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Deliver order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deliver order</DialogTitle>
                <DialogDescription>Add a message. The buyer is notified and can approve or ask for a revision.</DialogDescription>
              </DialogHeader>
              <Textarea value={deliveryMsg} onChange={(e) => setDeliveryMsg(e.target.value)} rows={5} placeholder="What you delivered and anything the buyer should check" />
              <Button onClick={() => call("deliver", { message: deliveryMsg }, "deliver")} disabled={loading === "deliver"}>
                {loading === "deliver" ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Sending" /> : "Send delivery"}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </Panel>
    );
  }

  if (order.status === "delivered") {
    if (!isBuyer) {
      return (
        <Panel eyebrow="Delivered" title="Waiting for approval">
          <p className="text-sm text-ink-2">The payment is released to you when the buyer approves.</p>
          {order.auto_complete_at && (
            <p className="text-sm text-ink-2">
              If they do not reply, the order approves itself on <span className="num">{new Date(order.auto_complete_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>.
            </p>
          )}
        </Panel>
      );
    }
    const left = order.revisions_allowed === -1 ? null : order.revisions_allowed - order.revisions_used;
    return (
      <Panel eyebrow="Delivered" title="Review the delivery">
        {order.delivery_message && (
          <div className="rounded-[8px] bg-surface-sunk p-3">
            <p className="eyebrow mb-1">Message from the seller</p>
            <p className="text-sm">{order.delivery_message}</p>
          </div>
        )}
        {order.delivery_files && order.delivery_files.length > 0 && (
          <div className="space-y-1">
            {order.delivery_files.map((url, i) => (
              <a key={i} href={url} className="link inline-flex min-h-11 items-center gap-2 text-sm">
                <FileText className="h-4 w-4" aria-hidden="true" /> Delivery file {i + 1} <Download className="h-3 w-3" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
        <p className="text-sm text-ink-2">Approving releases your payment to the seller. Until then it stays held.</p>
        <div className="grid gap-2">
          <Button size="lg" variant="release" onClick={() => call("accept", undefined, "accept")} disabled={loading === "accept"}>
            {loading === "accept" ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Approving" /> : "Approve and release payment"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg" disabled={left !== null && left <= 0}>
                Ask for a revision
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask for a revision</DialogTitle>
                <DialogDescription>{left === null ? "Unlimited revisions in this package." : `${left} ${left === 1 ? "revision" : "revisions"} left in this package.`}</DialogDescription>
              </DialogHeader>
              <Textarea value={revisionMsg} onChange={(e) => setRevisionMsg(e.target.value)} rows={5} placeholder="What should change" />
              <Button onClick={() => call("request-revision", { message: revisionMsg }, "revision")} disabled={loading === "revision"}>
                {loading === "revision" ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Sending" /> : "Send revision request"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        {order.auto_complete_at && (
          <p className="text-xs text-ink-2">
            If you do not reply, the order approves itself on <span className="num">{new Date(order.auto_complete_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>.
          </p>
        )}
      </Panel>
    );
  }

  if (order.status === "completed") {
    return (
      <Panel eyebrow="Released" title="Order complete">
        <p className="text-sm text-ink-2">{isBuyer ? "You approved the work and the payment was released to the seller." : "The buyer approved the work. The payment was released to you."}</p>
        {isBuyer && (
          <div className="grid gap-2">
            <Button asChild>
              <Link href={`/order/${order.id}/review`}>Leave a review</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/order/${order.id}/tip`}>Send a tip</Link>
            </Button>
          </div>
        )}
      </Panel>
    );
  }

  return null;
}
