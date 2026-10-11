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

/* the one release button: the only control on the site that moves money */
const RELEASE = "bg-release text-ink shadow-[0_2px_0_#0B6B40] hover:bg-release hover:shadow-[0_3px_0_#0B6B40,0_0_0_4px_rgba(31,199,122,0.22)] focus-visible:bg-release focus-visible:outline-mahogany active:shadow-[0_0_0_#0B6B40,inset_0_2px_0_rgba(0,0,0,0.18)]";

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
      toast.error("Action failed");
      return;
    }
    toast.success("Done");
    router.refresh();
  }

  if (order.status === "requires_requirements" && isBuyer) {
    return (
      <div className="tray p-6">
        <div className="flex items-center gap-3">
          <span className="lamp lamp--on" aria-hidden="true" />
          <h3 className="t-head">Submit your requirements to begin</h3>
        </div>
        <p className="mt-2 max-w-[52ch] text-sm text-ink-muted">
          The seller needs details about your project before they can start. Your delivery clock begins after submission.
        </p>
        <Button asChild variant="cta" className="mt-4">
          <Link href={`/order/${order.id}/requirements`}>Submit Requirements</Link>
        </Button>
      </div>
    );
  }

  if (order.status === "in_progress") {
    return (
      <div className="tray p-6">
        <div className="flex items-center gap-3">
          <span className="lamp lamp--on" aria-hidden="true" />
          <h3 className="t-head">In Progress</h3>
        </div>
        {order.delivery_due_at && (
          <div className="mt-4">
            <p className="text-sm text-ink-muted">Delivery expected by:</p>
            <CountdownTimer to={order.delivery_due_at} className="fig-price-xl mt-1 text-ink" />
          </div>
        )}
        {!isBuyer && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="mt-5">Deliver Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deliver Order</DialogTitle>
                <DialogDescription>Share a message and the buyer will be notified.</DialogDescription>
              </DialogHeader>
              <Textarea value={deliveryMsg} onChange={(e) => setDeliveryMsg(e.target.value)} rows={5} placeholder="Hi! I've attached..." />
              <Button onClick={() => call("deliver", { message: deliveryMsg }, "deliver")} disabled={loading === "deliver"}>
                {loading === "deliver" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Delivery"}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  if (order.status === "delivered" && isBuyer) {
    return (
      <div className="tray space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="lamp lamp--on" aria-hidden="true" />
          <h3 className="t-head">Delivery Received</h3>
        </div>
        {order.delivery_message && (
          <div className="rounded-[6px] bg-laminate-sunk p-3">
            <p className="mb-1 text-xs font-semibold text-ink-muted">Seller&apos;s message</p>
            <p className="text-sm">{order.delivery_message}</p>
          </div>
        )}
        {order.delivery_files && order.delivery_files.length > 0 && (
          <div className="space-y-1">
            {order.delivery_files.map((url, i) => (
              <a key={i} href={url} className="link inline-flex min-h-11 items-center gap-2 text-sm">
                <FileText className="w-4 h-4" /> Delivery file {i + 1} <Download className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="lg" className={RELEASE} onClick={() => call("accept", undefined, "accept")} disabled={loading === "accept"}>
            {loading === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Delivery"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg">Request Revision</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Revision</DialogTitle>
                <DialogDescription>
                  {order.revisions_allowed - order.revisions_used} revisions remaining.
                </DialogDescription>
              </DialogHeader>
              <Textarea value={revisionMsg} onChange={(e) => setRevisionMsg(e.target.value)} rows={5} placeholder="Please change..." />
              <Button onClick={() => call("request-revision", { message: revisionMsg }, "revision")} disabled={loading === "revision"}>
                {loading === "revision" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Revision Request"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-ink-muted">Accepting slides the drawer to the seller. Until then your payment stays under the glass.</p>
        {order.auto_complete_at && (
          <p className="text-xs text-ink-muted">
            Auto-completes on {new Date(order.auto_complete_at).toLocaleDateString()} if no action.
          </p>
        )}
      </div>
    );
  }

  if (order.status === "completed") {
    return (
      <div className="tray space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="lamp lamp--release" aria-hidden="true" />
          <h3 className="t-head">Order Complete!</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBuyer && (
            <>
              <Button asChild variant="cta">
                <Link href={`/order/${order.id}/review`}>Leave a Review</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/order/${order.id}/tip`}>Send a Tip</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
