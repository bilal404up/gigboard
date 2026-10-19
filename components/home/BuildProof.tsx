import Link from "next/link";
import type { PaymentMode } from "@/lib/stripe/mode";

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
                Card <span className="num">4242 4242 4242 4242</span>, any future date, any CVC. Stripe test mode, so no real money moves.
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
        <ol className="bp-steps">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="bp-n num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="bp-step-title">{s.title}</span>
                <span className="bp-step-body">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const MAP: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Buyers",
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
    links: [
      { label: "Admin home", href: "/admin" },
      { label: "Gig review", href: "/admin/gigs/review" },
      { label: "Disputes", href: "/admin/disputes" },
      { label: "Emails", href: "/admin/emails" },
    ],
  },
];

/** A compact case study: the problem, the approach, the stack, and every page that is built. */
export function BuildNotes({ mode }: { mode: PaymentMode }) {
  return (
    <section className="home-section home-section--rule" aria-labelledby="bp-notes-title">
      <div className="wrap">
        <div className="bp-notes">
          <div>
            <p className="eyebrow">About this build</p>
            <h2 id="bp-notes-title" className="t-sign mt-3">
              A working marketplace, end to end
            </h2>
            <dl className="bp-dl">
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
            </dl>
          </div>
          <div className="bp-map">
            {MAP.map((group) => (
              <nav key={group.title} className="bp-col" aria-label={`${group.title} pages`}>
                <h3 className="eyebrow">{group.title}</h3>
                <ul>
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <p className="bp-note">Pages that need an account ask you to sign in. In the demo, pick a role in the top menu.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
