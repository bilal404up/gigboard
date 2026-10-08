import Link from "next/link";
import { WordMark } from "@/components/layout/wordmark";

const CATEGORIES: [string, string][] = [
  ["Web development", "web-development"],
  ["Mobile development", "mobile-development"],
  ["Design and creative", "design-creative"],
  ["AI and automation", "ai-automation"],
  ["Digital marketing", "digital-marketing"],
  ["Business support", "business-support"],
];

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 text-[15px] leading-[22px] sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" aria-label="Gigboard home">
            <WordMark />
          </Link>
          <p className="max-w-[40ch] text-ink-muted">
            Hire one freelancer for one defined job. Payment is held until you approve the work.
          </p>
        </div>
        <Col title="Categories">
          {CATEGORIES.map(([label, slug]) => (
            <FooterLink key={slug} href={`/category/${slug}`}>{label}</FooterLink>
          ))}
        </Col>
        <Col title="Gigboard">
          <FooterLink href="/search">Browse gigs</FooterLink>
          <FooterLink href="/how-it-works">How it works</FooterLink>
          <FooterLink href="/become-seller">Create a gig</FooterLink>
        </Col>
      </div>
      <div className="border-t border-ink">
        <div className="mx-auto max-w-[1200px] px-4 py-4 text-[13px] leading-[18px] text-ink-muted sm:px-6">
          Gigboard is a demo. All gigs, sellers, ratings and reviews are sample data, and payments run in Stripe test mode.
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[15px] font-semibold leading-[22px] text-ink">{title}</h4>
      <div className="space-y-2 text-ink-muted">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block py-1.5 hover:text-ink hover:underline underline-offset-4">
      {children}
    </Link>
  );
}
