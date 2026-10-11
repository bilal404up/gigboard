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
    <footer className="booth booth--deep mt-auto">
      <div className="wrap grid gap-8 py-12 text-[15px] leading-[22px] md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Link href="/" aria-label="Gigboard home" className="inline-block rounded-[4px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-4 focus-visible:outline-release">
            <WordMark />
          </Link>
          <p className="max-w-[40ch] text-sand">
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
      <div className="border-t border-brass-deep/60">
        <div className="wrap flex items-center gap-3 py-4 text-[13px] leading-[18px] text-sand">
          <span className="lamp lamp--on shrink-0" aria-hidden="true" />
          Gigboard is a demo. All gigs, sellers, ratings and reviews are sample data, and payments run in Stripe test mode.
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="t-plate mb-3 text-brass-light">{title}</h4>
      <div className="space-y-1 text-sand">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link block py-1.5 hover:text-laminate focus-visible:text-laminate">
      {children}
    </Link>
  );
}
