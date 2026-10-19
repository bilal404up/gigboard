"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function RequirementsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}/submit-requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirements: text }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Requirements submitted");
      router.push(`/order/${id}`);
    } else {
      toast.error("Failed to submit");
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
          <p className="eyebrow">Step 2 of 2</p>
          <h1 className="t-sign mb-3 mt-3">Send your brief</h1>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            The seller starts once they have your project details. Your payment stays held until you approve the delivery.
          </p>

          <label className="block text-sm font-medium text-ink mb-1.5">Requirements</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Describe your project, brand guidelines, references, deadlines, links to relevant docs, etc."
          />
          <p className="num mt-1 text-xs text-ink-2">{text.length} characters, at least 10</p>

          <div className="mt-6 pt-5 border-t border-line flex justify-between gap-3">
            <button
              onClick={() => router.push(`/order/${id}`)}
              className="btn btn-small text-ink-2 hover:bg-surface-sunk hover:text-ink"
            >
              I&apos;ll do this later
            </button>
            <button
              onClick={submit}
              disabled={loading || text.length < 10}
              className="btn btn-primary btn-small"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send requirements
            </button>
          </div>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
