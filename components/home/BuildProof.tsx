import Link from "next/link";
import "./build-proof.css";

type Gig = { title: string; href: string; price: number };

/** A complete test-mode order, step by step: the quickest proof that payment really is held. */
export function TestOrder({ gig }: { gig: Gig }) {
  const steps = [
    { title: "Switch to Buyer", body: <>Use the demo bar at the top of the page.</> },
    {
      title: "Order the cheapest gig",
      body: (
        <>
          <Link href={gig.href} className="bp-link">
            {gig.title}
          </Link>
          , ${gig.price}.
        </>
      ),
    },
    {
      title: "Pay with a Stripe test card",
      body: (
        <>
          Card <span className="bp-card">4242 4242 4242 4242</span>, any future date, any CVC. The money is held, not paid out.
        </>
      ),
    },
    { title: "Deliver it as the seller", body: <>Switch to Seller in the demo bar, open the order and deliver it.</> },
    { title: "Approve it as the buyer", body: <>Switch back and approve. Only then is the seller paid.</> },
  ];

  return (
    <section className="bp bp-order" aria-labelledby="bp-order-title">
      <div className="bp-intro">
        <h2 id="bp-order-title" className="bp-h2">
          Try a real order in two minutes
        </h2>
        <p className="bp-lead">Everything runs in Stripe test mode, so no real money moves. The demo bar switches you between buyer and seller.</p>
      </div>
      <ol className="bp-steps">
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="bp-n" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <span className="bp-step-title">{s.title}</span>
              <span className="bp-step-body">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
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

/** The case study: what problem this solves, how, and everything that's actually built. */
export function BuildNotes() {
  return (
    <section className="bp bp-notes" aria-labelledby="bp-notes-title">
      <h2 id="bp-notes-title" className="bp-h2">
        About this build
      </h2>
      <dl className="bp-dl">
        <div>
          <dt>The problem</dt>
          <dd>Buyers worry about paying for work that never arrives. Sellers worry about doing work that never gets paid.</dd>
        </div>
        <div>
          <dt>The approach</dt>
          <dd>
            Fixed-price gigs with a delivery date. The platform holds the payment, and only the buyer&apos;s approval releases it. Late work is refunded,
            and three days of silence after delivery approves the job.
          </dd>
        </div>
        <div>
          <dt>The outcome</dt>
          <dd>A working marketplace with separate buyer, seller and admin sides, from search and checkout to payouts and disputes.</dd>
        </div>
      </dl>
      <p className="bp-stack">Built with Next.js 14, TypeScript and Tailwind, on Supabase (Postgres, auth and realtime), with Stripe in test mode.</p>
      <div className="bp-map">
        {MAP.map((group) => (
          <nav key={group.title} className="bp-col" aria-label={`${group.title} pages`}>
            <h3 className="bp-h3">{group.title}</h3>
            <ul>
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="bp-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="bp-note">Pages that need an account ask you to sign in. In the demo, pick a role in the demo bar.</p>
    </section>
  );
}
