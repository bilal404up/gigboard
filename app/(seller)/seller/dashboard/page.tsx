import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { SellerLevelBadge } from "@/components/seller/seller-level-badge";
import { SellerMark } from "@/components/seller/SellerMark";
import { StatPlate, StatRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default async function SellerDashboardPage() {
  const sb = createClient();
  const { data: { user: au } } = await sb.auth.getUser();
  if (!au) redirect("/login");
  const { data: user } = await sb.from("users").select("*").eq("id", au.id).single();
  if (!user?.is_seller) redirect("/become-seller");

  const { data: profile } = await sb.from("seller_profiles").select("*").eq("user_id", user.id).single();
  if (!profile) redirect("/become-seller");

  const [{ count: activeGigs }, { count: openOrders }, { data: monthOrders }] = await Promise.all([
    sb.from("gigs").select("id", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "active"),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", user.id).in("status", ["active", "in_progress", "requires_requirements"]),
    sb.from("orders").select("seller_earnings, created_at").eq("seller_id", user.id).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);
  const monthEarnings = (monthOrders ?? []).reduce((s, o) => s + Number(o.seller_earnings), 0);

  const completion = [
    { label: "Add a profile photo", done: Boolean(user.avatar_url), href: "/settings" },
    { label: "Write a tagline", done: Boolean(profile.tagline && profile.tagline.length > 10), href: "/settings" },
    { label: "Write a bio (120+ chars)", done: Boolean(profile.description && profile.description.length >= 120), href: "/settings" },
    { label: "Add 3+ skills", done: Boolean(profile.skills && profile.skills.length >= 3), href: "/settings" },
    { label: "Publish your first gig", done: (activeGigs ?? 0) > 0, href: "/seller/gigs/create" },
    { label: "Add portfolio items", done: Boolean((profile.portfolio_items as any[] | null)?.length), href: "/settings" },
    { label: "Connect your bank", done: Boolean(profile.stripe_onboarding_complete), href: "/become-seller" },
  ];
  const completedCount = completion.filter((c) => c.done).length;
  const completionPct = Math.round((completedCount / completion.length) * 100);
  const missing = completion.filter((c) => !c.done);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <header className="flex flex-wrap items-center gap-4">
          <SellerMark username={user.username ?? user.id} level={profile.seller_level} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="t-sign truncate">{user.full_name}</h1>
              <SellerLevelBadge level={profile.seller_level} />
            </div>
            <p className="mt-1 text-sm text-ink-muted">Your window at the counter.</p>
          </div>
          <Button asChild variant="cta">
            <Link href="/seller/gigs/create">Create a gig</Link>
          </Button>
        </header>

        <StatRow className="mt-8">
          <StatPlate label="Earnings, last 30 days" value={formatMoney(monthEarnings)} tone={monthEarnings > 0 ? "release" : "laminate"} />
          <StatPlate label="Open orders" value={String(openOrders ?? 0)} tone={(openOrders ?? 0) > 0 ? "brass" : "laminate"} hint="Money waiting under the glass" />
          <StatPlate label="Active gigs" value={String(activeGigs ?? 0)} />
          <StatPlate label="Profile complete" value={`${completionPct}%`} hint={`${completedCount} of ${completion.length} done`} />
        </StatRow>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <section aria-labelledby="finish-title" className="tray p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="finish-title" className="t-head">
                Finish setting up your window
              </h2>
              <span className="num text-sm text-ink-muted">{completionPct}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-pill bg-laminate-sunk" role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
              <div className="h-full rounded-pill bg-[linear-gradient(180deg,#E7C978,#C9A24A_60%,#B08A2C)]" style={{ width: `${completionPct}%` }} />
            </div>
            <ul className="mt-4 grid gap-1">
              {completion.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className={cn("flex min-h-11 items-center gap-3 rounded-[4px] px-2 text-sm hover:bg-laminate-sunk focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany", c.done ? "text-ink-muted" : "text-ink")}
                  >
                    <span className={cn("lamp shrink-0", c.done && "lamp--release")} aria-hidden="true" />
                    <span className={cn(c.done && "line-through")}>{c.label}</span>
                    <span className="sr-only">{c.done ? ", done" : ", not done"}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {missing.length === 0 ? <p className="mt-3 text-sm text-release-deep">Your window is fully set up.</p> : null}
          </section>

          <aside className="grid gap-3">
            {[
              ["/seller/orders", "Orders", "Deliver and track"],
              ["/seller/earnings", "Earnings", "Held, cleared, paid out"],
              ["/seller/analytics", "Analytics", "Views, clicks, orders"],
              ["/seller/gigs", "Your gigs", "Edit what is on the board"],
              ["/messages", "Messages", "Buyers waiting on you"],
            ].map(([href, title, body]) => (
              <Link key={href} href={href} className="tray tray--hover flex min-h-11 items-center gap-3 p-4 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
                <span className="lamp lamp--on shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-ink-muted">{body}</span>
                </span>
              </Link>
            ))}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
