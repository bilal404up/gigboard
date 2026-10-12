"use client";

/*
 * How payment works: escrow as a two-way exchange.
 * Steps 1 to 3 play once when the section scrolls into view. Step 4 waits
 * for the visitor to press Approve. Reduced motion opens at step 3 and
 * every change snaps.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./counter-story.css";

type Step = 0 | 1 | 2 | 3 | 4;

type Props = {
  title: string;
  price: number;
  days: number;
  sellerName: string;
  /** Demo number: the platform's share of each job. */
  feeRate?: number;
};

const LABELS = ["You pay", "They start", "Work arrives", "You approve"];
/* When steps 1, 2 and 3 play, in ms after the section comes into view */
const PLAY_AT = [300, 1900, 3500];

function Odometer({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="cs-odo" aria-hidden="true">
      <span>$</span>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="cs-odo-wheel">
          <span className="cs-odo-strip" style={{ "--d": Number(d) } as CSSProperties}>
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function CounterStory({ title, price, days, sellerName, feeRate = 0.1 }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [instant, setInstant] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const played = useRef(false);
  const reduced = useRef(false);

  const first = sellerName.split(" ")[0] || sellerName;
  const fee = Math.round(price * feeRate);
  const payout = price - fee;
  const dayWords = `${days} ${days === 1 ? "day" : "days"}`;

  const captions: Record<Step, string> = {
    0: "Here is one job, start to finish.",
    1: `You pay $${price}. Gigboard holds it, and ${first} can see it's there.`,
    2: `${first} starts work. Ready in ${dayWords}, as listed.`,
    3: "The work arrives. Check it against your brief before anything is paid.",
    4: `You approve, and the payment is released. ${first} gets $${payout} and Gigboard keeps a $${fee} fee.`,
  };

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /* Reset without sliding backwards, then play steps 1 to 3 */
  const play = () => {
    clear();
    setInstant(true);
    setStep(0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setInstant(false);
        PLAY_AT.forEach((ms, i) => {
          timers.current.push(window.setTimeout(() => setStep((i + 1) as Step), ms));
        });
      }),
    );
  };

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = rootRef.current;
    if (reduced.current || !el || !("IntersectionObserver" in window)) {
      played.current = true;
      setStep(3);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played.current) {
          played.current = true;
          io.disconnect();
          play();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onButton = () => {
    if (step === 3) {
      setStep(4);
      return;
    }
    if (step === 4) {
      if (reduced.current) setStep(3);
      else play();
    }
  };

  const btn =
    step === 4
      ? { text: "Play again", variant: "again", disabled: false }
      : { text: "Approve the work", variant: "approve", disabled: step !== 3 };

  return (
    <section ref={rootRef} id="how-the-counter-works" className="cs" aria-labelledby="cs-title">
      <div className="cs-head">
        <h2 id="cs-title" className="cs-h2">
          How payment works
        </h2>
        <p className="cs-intro">Every job runs the same way. Here is one, start to finish.</p>
      </div>

      <div className="cs-stage" data-step={step} data-instant={instant || undefined}>
        <span className="cs-side cs-side--you" aria-hidden="true">
          You
        </span>
        <span className="cs-side cs-side--seller" aria-hidden="true">
          {sellerName}
        </span>
        <span className="cs-seller-note" aria-hidden="true">
          Started. Ready in {dayWords}.
        </span>

        <span className="cs-track" aria-hidden="true" />

        <span className="cs-work" aria-hidden="true">
          <svg viewBox="0 0 40 40">
            <rect width="40" height="40" rx="6" fill="#F0F1F2" />
            <circle cx="15" cy="17" r="8" fill="#121417" />
            <rect x="20" y="20" width="12" height="12" rx="2" fill="#2BB673" transform="rotate(12 26 26)" />
          </svg>
          <span className="cs-work-title">{title}</span>
          <span className="cs-stamp cs-stamp--delivered">Delivered</span>
        </span>

        <span className="cs-ticket" aria-hidden="true">
          <span className="cs-ticket-no">Order 0412</span>
          <span className="cs-amount">
            <Odometer value={step === 4 ? payout : price} />
          </span>
          <span className="cs-stamp cs-stamp--held">Held</span>
          <span className="cs-stamp cs-stamp--approved">Released</span>
        </span>

        <span className="cs-glass" aria-hidden="true">
          <span className="cs-glass-glint" />
        </span>

        <span className="cs-fee" aria-hidden="true">
          ${fee} Gigboard fee
        </span>

        <button type="button" className="cs-approve" data-variant={btn.variant} disabled={btn.disabled} onClick={onButton}>
          {btn.text}
        </button>
      </div>

      <ol className="cs-progress">
        {LABELS.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} aria-current={step === n ? "step" : undefined} data-done={step > n || undefined}>
              <span className="cs-n">{n}</span> {label}
            </li>
          );
        })}
      </ol>

      <p className="cs-caption" aria-live="polite">
        {captions[step]}
      </p>

      <div className="cs-rules">
        <h3 className="cs-h3">The rules</h3>
        <ul>
          <li>If the work arrives late, you get a full refund.</li>
          <li>If you don&apos;t respond within three days of delivery, the job approves itself, so sellers are never left waiting.</li>
          <li>If something&apos;s wrong, ask for changes, or a person from Gigboard steps in.</li>
        </ul>
      </div>
    </section>
  );
}
