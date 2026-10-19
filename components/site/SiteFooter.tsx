import Link from "next/link";
import { WordMark } from "@/components/layout/wordmark";
import "./site-footer.css";

type FooterLink = { label: string; href: string };

const BUYERS: FooterLink[] = [
  { label: "Browse gigs", href: "/search" },
  { label: "How held payment works", href: "/#how-held-payment-works" },
  { label: "Log in", href: "/login" },
];
const SELLERS: FooterLink[] = [
  { label: "Become a seller", href: "/become-seller" },
  { label: "Seller dashboard", href: "/seller/dashboard" },
];
const COMPANY: FooterLink[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "All gigs", href: "/search" },
];

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav className="sf-col" aria-label={title}>
      <h2 className="sf-h">{title}</h2>
      <ul className="sf-list">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* Marketing footer on public pages; a single slim line inside the app (dashboards, orders, admin). */
export default function SiteFooter({ variant = "site", year = new Date().getFullYear() }: { variant?: "site" | "app"; year?: number }) {
  if (variant === "app") {
    return (
      <footer className="sf-app">
        <div className="wrap sf-app-inner">
          <span>Gigboard demo. Sample data, no real money moves.</span>
          <span className="sf-app-links">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/search">Browse gigs</Link>
          </span>
        </div>
      </footer>
    );
  }
  return (
    <footer className="site-footer sf">
      <div className="sf-inner">
        <div className="sf-brand">
          <Link href="/" className="sf-mark" aria-label="Gigboard home">
            <WordMark />
          </Link>
          <p className="sf-tagline">Fixed-price freelance work. You pay when you book, and the seller is paid when you approve.</p>
          <ul className="sf-rules">
            <li>Nothing is paid out before the work is delivered.</li>
            <li>Three days without a reply after delivery approves the order.</li>
            <li>If the work is not what you asked for, ask for a revision before you approve.</li>
          </ul>
        </div>
        <Column title="For buyers" links={BUYERS} />
        <Column title="For sellers" links={SELLERS} />
        <Column title="Gigboard" links={COMPANY} />
      </div>
      <div className="sf-bottom">
        <p>A demo marketplace with sample data. No real money moves.</p>
        <p className="num">{year} Gigboard</p>
      </div>
    </footer>
  );
}
