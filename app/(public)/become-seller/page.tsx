"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronLeft, Landmark } from "lucide-react";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const SUGGESTED_SKILLS = ["React", "Next.js", "Node.js", "Python", "Figma", "Bubble.io", "Webflow", "TypeScript", "AI Integration", "UI/UX Design"];
const BANKS = [
  "HBL - Habib Bank Limited",
  "MCB Bank",
  "United Bank Limited (UBL)",
  "Allied Bank Limited (ABL)",
  "Bank Alfalah",
  "Meezan Bank",
  "Faysal Bank",
  "Standard Chartered Pakistan",
  "Other International Bank",
];

const STEPS = ["About you", "Background", "Bank", "Done"];

const PRIMARY = "inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2D32] disabled:cursor-not-allowed disabled:opacity-50";
const BACK = "inline-flex h-11 items-center gap-1 rounded-[10px] px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-laminate-sunk hover:text-ink";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routing, setRouting] = useState("");

  async function activate() {
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      router.push("/login?redirect=/become-seller");
      return;
    }
    await sb.from("users").update({ is_seller: true }).eq("id", user.id);
    await sb.from("seller_profiles").upsert({
      user_id: user.id,
      tagline,
      description: bio,
      skills,
      seller_level: "new_seller",
      stripe_onboarding_complete: false,
    });
  }

  async function connectBank() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      await sb
        .from("seller_profiles")
        .update({
          stripe_onboarding_complete: true,
          mock_bank_name: bankName,
          mock_account_last4: accountNumber.slice(-4),
        })
        .eq("user_id", user.id);
    }
    setLoading(false);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#2BB673", "#121417", "#E3E4E6"] });
    }
    setStep(4);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <h1 className="t-sign">Become a seller</h1>
          <p className="mt-2 text-[15px] text-ink-muted">Takes about two minutes. You can change everything later from your dashboard.</p>
        </header>

        {/* Stepper: every label sits on one line, and the connector runs between the numbers at a fixed height. */}
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Onboarding steps">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const done = s < step;
            const current = s === step;
            return (
              <li key={label} className="relative">
                {s < STEPS.length && <div aria-hidden="true" className={cn("absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4 h-0.5", done ? "bg-ink" : "bg-line")} />}
                <div className="flex flex-col items-center gap-2">
                  <div
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "relative grid h-8 w-8 place-items-center rounded-full text-sm font-semibold tabular-nums",
                      done ? "bg-ink text-white" : current ? "bg-white text-ink shadow-[inset_0_0_0_2px_#121417]" : "bg-white text-ink-muted shadow-[inset_0_0_0_1px_#C5C8CD]"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : s}
                  </div>
                  <span className={cn("text-center text-xs font-medium leading-4", current || done ? "text-ink" : "text-ink-muted")}>{label}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="tray p-6 sm:p-8">
          {step === 1 && (
            <>
              <h2 className="t-head">Tell us about yourself</h2>
              <p className="mb-6 mt-1.5 text-sm text-ink-muted">This appears at the top of your seller profile.</p>
              <div className="space-y-5">
                <Field label="Tagline" hint={`${tagline.length}/100`}>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="For example: Full-stack web and mobile developer" maxLength={100} />
                </Field>
                <Field label="Bio" hint={`${bio.length}/600`}>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Your background, what you're good at, and how you work" rows={5} maxLength={600} />
                </Field>
                <Field label="Top skills" hint="Add 3 to 5 for best results">
                  <TagInput value={skills} onChange={setSkills} suggestions={SUGGESTED_SKILLS} placeholder="Add a skill and press Enter" />
                </Field>
              </div>
              <div className="mt-7 flex justify-end border-t border-line pt-5">
                <button onClick={() => setStep(2)} disabled={!tagline || !bio} className={PRIMARY}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="t-head">Background</h2>
              <p className="mb-6 mt-1.5 text-sm text-ink-muted">Optional. You can fill these in later from settings.</p>
              <p className="mb-6 rounded-[10px] bg-laminate-sunk p-4 text-sm leading-relaxed text-ink-muted">
                Education, certifications, portfolio items and social links can all be added from your seller dashboard once your account is active.
              </p>
              <div className="flex justify-between border-t border-line pt-5">
                <button onClick={() => setStep(1)} className={BACK}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    await activate();
                    setLoading(false);
                    setStep(3);
                  }}
                  className={PRIMARY}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue to bank
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="t-head">Connect your bank</h2>
              <p className="mb-4 mt-1.5 text-sm text-ink-muted">Required to receive payouts.</p>
              <p className="mb-6 rounded-[10px] bg-laminate-sunk p-3 text-sm leading-relaxed text-ink-muted">
                <strong className="text-ink">Demo mode.</strong> This is a portfolio project. Nothing connects to a real bank, and these fields are stored as sample values only.
              </p>
              <div className="space-y-5">
                <Field label="Bank">
                  <div className="relative">
                    <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} className="field h-11 appearance-none pl-9 pr-3 text-sm">
                      <option value="">Select a bank</option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label="Account holder name">
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="As shown on your bank statement" />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Account number">
                    <Input type="text" inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="8 to 16 digits" />
                  </Field>
                  <Field label="Routing number">
                    <Input type="text" inputMode="numeric" value={routing} onChange={(e) => setRouting(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="9 digits" />
                  </Field>
                </div>
              </div>
              <div className="mt-7 flex justify-between border-t border-line pt-5">
                <button onClick={() => setStep(2)} className={BACK}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button onClick={connectBank} disabled={loading || !bankName || !accountHolder || accountNumber.length < 8} className={PRIMARY}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Verifying" : "Connect account"}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-release-tint">
                <Check className="h-7 w-7 text-release-deep" strokeWidth={2.5} />
              </div>
              <h2 className="t-head">You&apos;re a seller</h2>
              <p className="mx-auto mb-7 mt-2 max-w-md text-sm leading-relaxed text-ink-muted">Your profile is active. Create your first gig to start receiving orders.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => router.push("/seller/gigs/create")} className={PRIMARY}>
                  Create your first gig
                </button>
                <button
                  onClick={() => router.push("/seller/dashboard")}
                  className="inline-flex h-11 items-center rounded-[10px] px-5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_#8A9096] transition-colors hover:bg-laminate-sunk"
                >
                  Go to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
