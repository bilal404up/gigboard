"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/ui/rating-stars";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [overall, setOverall] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [described, setDescribed] = useState(5);
  const [recommend, setRecommend] = useState(true);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: id,
        overall_rating: overall,
        communication_rating: communication,
        service_as_described_rating: described,
        would_recommend: recommend,
        review_text: text,
      }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Review posted");
      router.push(`/order/${id}`);
    } else {
      toast.error("Failed to post review");
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
          <h1 className="t-sign mb-3 mt-3">Leave a review</h1>
          <p className="text-sm text-ink-2 leading-relaxed mb-6">
            Your review is public. Be specific: other buyers read it before they book.
          </p>

          <div className="space-y-5">
            <RatingRow label="Overall experience" value={overall} onChange={setOverall} />
            <RatingRow label="Communication" value={communication} onChange={setCommunication} />
            <RatingRow label="Service as described" value={described} onChange={setDescribed} />

            <div className="flex items-center justify-between gap-3 py-3 border-y border-line">
              <label htmlFor="recommend" className="text-sm font-medium text-ink">
                Would you recommend this seller?
              </label>
              <Switch id="recommend" checked={recommend} onCheckedChange={setRecommend} />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Your review</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Share your experience working with this seller…"
              />
              <p className="num mt-1 text-xs text-ink-2">{text.length}/1000 · min 15</p>
            </div>

            <button
              onClick={submit}
              disabled={loading || text.length < 15}
              className="btn btn-primary w-full"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post review
            </button>
          </div>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm font-medium text-ink">{label}</label>
      <RatingStars value={value} onChange={onChange} interactive size={22} />
    </div>
  );
}
