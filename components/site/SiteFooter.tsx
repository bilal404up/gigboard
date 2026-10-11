import Link from "next/link";
import "./site-footer.css";

type FooterLink = { label: string; href: string };

type Props = {
  buyers?: FooterLink[];
  sellers?: FooterLink[];
  company?: FooterLink[];
  year?: number;
};

/* Only link to routes that exist. Drop any that don't. */
const BUYERS: FooterLink[] = [
  { label: "Browse the board", href: "/search" },
  { label: "How the counter works", href: "/#how-the-counter-works" },
  { label: "Log in", href: "/login" },
];
const SELLERS: FooterLink[] = [
  { label: "Become a seller", href: "/become-seller" },
  { label: "Seller dashboard", href: "/seller/dashboard" },
];
const COMPANY: FooterLink[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Browse gigs", href: "/search" },
];

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  if (!links.length) return null;
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

export default function SiteFooter({
  buyers = BUYERS,
  sellers = SELLERS,
  company = COMPANY,
  year = new Date().getFullYear(),
}: Props) {
  return (
    <footer className="site-footer sf">
      <div className="sf-inner">
        <div className="sf-brand">
          <Link href="/" className="sf-mark">
            Gigboard
          </Link>
          <p className="sf-tagline">Fixed-price freelance work, paid through the counter.</p>
          <ul className="sf-rules">
            <li>Late delivery means a full refund.</li>
            <li>Three days of silence after delivery approves the job.</li>
            <li>If something's wrong, a person at the counter steps in.</li>
          </ul>
        </div>

        <Column title="For buyers" links={buyers} />
        <Column title="For sellers" links={sellers} />
        <Column title="Gigboard" links={company} />
      </div>

      <div className="sf-bottom">
        <p>Sample data, Stripe test mode. No real money moves.</p>
        <p>{year} Gigboard</p>
      </div>
    </footer>
  );
}
