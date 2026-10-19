import Link from "next/link";
import type { PaymentMode } from "@/lib/stripe/mode";
import { StepsProgress } from "./StepsProgress";
import { Reveal } from "@/components/motion/Reveal";
import { ShoppingBag, Store, Shield, ArrowUpRight } from "lucide-react";

/* Role for each step, in order: 1 Switch to Buyer, 2 Book, 3 Pay, 4 Deliver as seller, 5 Approve as buyer. */
const STEP_ROLES = ["Buyer", "Buyer", "Buyer", "Seller", "Buyer"] as const;

type Gig = { title: string; href: string; price: number };

/** A complete order in the demo, step by step: the quickest proof that payment really is held. */
export function TestOrder({ gig, mode }: { gig: Gig; mode: PaymentMode }) {
  const pay =
    mode === "demo"
      ? {
          title: "Pay at the demo checkout",
          body: <>Enter any card details. This is a demo checkout: no card is charged and the details are not sent anywhere. The order is recorded as held.</>,
        }
      : mode === "stripe-test"
        ? {
            title: "Pay with a Stripe test card",
            body: (
              <>
                Card <span className="num">4242 4242 4242 4242</span>, any future date, any CVC. Demo payments, no real money moves.
              </>
            ),
          }
        : { title: "Pay", body: <>Payment is taken by Stripe and held until you approve.</> };

  const steps = [
    { title: "Switch to Buyer", body: <>Use the Buyer / Seller / Admin switch in the top menu.</> },
    {
      title: "Book the cheapest gig",
      body: (
        <>
          <Link href={gig.href} className="link">
            {gig.title}
          </Link>
          , from <span className="num">${gig.price}</span>.
        </>
      ),
    },
    pay,
    { title: "Deliver it as the seller", body: <>Switch to Seller in the top menu, open the order and deliver it.</> },
    { title: "Approve it as the buyer", body: <>Switch back and approve. Only then is the payment released to the seller.</> },
  ];

  return (
    <section className="home-section home-section--rule" aria-labelledby="bp-order-title">
      <div className="wrap bp-layout">
        <div className="home-head">
          <p className="eyebrow">Try it</p>
          <h2 id="bp-order-title" className="t-sign">
            Run a full order in two minutes
          </h2>
          <p className="home-lead">
            {mode === "demo"
              ? "This demo runs without a payment provider, so no real money moves. The switch in the top menu moves you between buyer and seller."
              : "The switch in the top menu moves you between buyer and seller."}
          </p>
        </div>
        <StepsProgress className="bp-steps">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="bp-n num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="bp-step-title">
                  {s.title}
                  <span className="bp-role">{STEP_ROLES[i]}</span>
                </span>
                <span className="bp-step-body">{s.body}</span>
              </span>
            </li>
          ))}
        </StepsProgress>
      </div>
    </section>
  );
}

const MAP: Array<{ title: string; blurb: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Buyers",
    blurb: "Find a gig, pay into held payment, approve the work.",
    links: [
      { label: "Browse gigs", href: "/search" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Orders", href: "/orders" },
      { label: "Messages", href: "/messages" },
      { label: "Favourites", href: "/favorites" },
    ],
  },
  {
    title: "Sellers",
    blurb: "List gigs, deliver orders, see what has been released.",
    links: [
      { label: "Become a seller", href: "/become-seller" },
      { label: "Seller dashboard", href: "/seller/dashboard" },
      { label: "Gigs", href: "/seller/gigs" },
      { label: "Orders", href: "/seller/orders" },
      { label: "Earnings", href: "/seller/earnings" },
      { label: "Analytics", href: "/seller/analytics" },
    ],
  },
  {
    title: "Admins",
    blurb: "Review new gigs, settle disputes, read the sent emails.",
    links: [
      { label: "Admin home", href: "/admin" },
      { label: "Gig review", href: "/admin/gigs/review" },
      { label: "Disputes", href: "/admin/disputes" },
      { label: "Emails", href: "/admin/emails" },
    ],
  },
];

const ICONS: Record<string, typeof ShoppingBag> = { Buyers: ShoppingBag, Sellers: Store, Admins: Shield }

/** A compact case study: the problem, the approach, the stack, and every page that is built. */
export function BuildNotes({ mode }: { mode: PaymentMode }) {
  return (
    <section className="home-section home-section--rule" aria-labelledby="bp-notes-title">
      <div className="wrap bp-about">
        <Reveal as="div" variant="rise" className="bp-about-head">
          <p className="eyebrow">About this build</p>
          <h2 id="bp-notes-title" className="t-sign mt-3">
            A working marketplace, end to end
          </h2>
          <p className="home-lead mt-4">A portfolio demo with sample gigs, sellers and reviews. Every order runs the same held-payment flow.</p>
        </Reveal>
        <Reveal as="dl" stagger={90} className="bp-dl">
          <div>
            <dt>The problem</dt>
            <dd>Buyers worry about paying for work that never arrives. Sellers worry about doing work that never gets paid.</dd>
          </div>
          <div>
            <dt>The approach</dt>
            <dd>
              Fixed-price gigs with a delivery date. The platform holds the payment and only the buyer&apos;s approval releases it. Three days without a reply
              after delivery approves the order.
            </dd>
          </div>
          <div>
            <dt>The stack</dt>
            <dd>
              Next.js 14, TypeScript and Tailwind on Supabase (Postgres, auth and realtime). Card payments use Stripe when keys are configured.
              {mode === "demo" ? " This demo runs without them, so checkout is simulated." : ""}
            </dd>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* Every screen in the demo, grouped by who uses it. */
export function DemoMap() {
  const pages = MAP.reduce((n, g) => n + g.links.length, 0)
  return (
    <section className="home-section home-section--rule" aria-labelledby="dm-title">
      <div className="wrap">
        <div className="home-head">
          <p className="eyebrow">Explore the demo</p>
          <h2 id="dm-title" className="t-sign">
            Every screen, one click away
          </h2>
          <p className="home-lead">
            {pages} pages across three roles. Pages that need an account ask you to sign in. In the demo, pick a role in the top menu.
          </p>
        </div>
        <Reveal as="div" stagger={90} className="dm-grid">
          {MAP.map((group) => {
            const Icon = ICONS[group.title]
            return (
              <nav key={group.title} className="dm-panel" aria-label={`${group.title} pages`}>
                <div className="dm-top">
                  <span className="dm-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="dm-count num">{group.links.length} pages</span>
                </div>
                <h3 className="dm-title">{group.title}</h3>
                <p className="dm-blurb">{group.blurb}</p>
                <ul className="dm-links">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="dm-link" prefetch={false}>
                        {l.label}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          })}
        </Reveal>
      </div>
    </section>
  );
}
