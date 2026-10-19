import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GigCard, GigRow, GigBoardHeader, type GigCardData } from "@/components/gig/gig-card";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SortSelect } from "./sort-select";
import { MobileFilterTrigger } from "./mobile-filter-trigger";
import { Reveal } from "@/components/motion/Reveal";
import { ShowMore } from "@/components/gig/show-more";

export const revalidate = 0;

interface SearchParams {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  delivery_days?: string;
  level?: string | string[];
  rating?: string;
  sort?: string;
  view?: string;
  page?: string;
}

type GigRow = {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  seller_id: string;
  category_id: string;
  starting_price: number;
  delivery_days: number | null;
  seller: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    seller_level: "new_seller" | "level_one" | "level_two" | "top_rated";
  };
};

function toArray(v?: string | string[]): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

async function searchGigs(params: SearchParams): Promise<{ gigs: GigRow[]; count: number }> {
  try {
    const sb = createClient();
    let query = sb
      .from("gigs")
      .select("id, slug, title, thumbnail_url, average_rating, total_reviews, seller_id, category_id")
      .eq("status", "active");

    if (params.q) query = query.textSearch("search_vector", params.q.split(" ").join(" & "));
    if (params.category) query = query.eq("category_id", params.category);

    const minRating = params.rating ? parseFloat(params.rating) : 0;
    if (minRating > 0) query = query.gte("average_rating", minRating);

    const sort = params.sort ?? "relevance";
    if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "rating") query = query.order("average_rating", { ascending: false });
    else if (sort === "best_selling") query = query.order("total_orders", { ascending: false });
    else query = query.order("total_orders", { ascending: false });

    const page = parseInt(params.page ?? "1", 10);
    query = query.range((page - 1) * 24, page * 24 - 1);

    const { data: gigRows, count } = await query;
    if (!gigRows || gigRows.length === 0) return { gigs: [], count: count ?? 0 };

    const sellerIds = Array.from(new Set(gigRows.map((g: any) => g.seller_id)));
    const gigIds = gigRows.map((g: any) => g.id);

    const [{ data: users }, { data: profiles }, { data: packages }] = await Promise.all([
      sb.from("public_profiles").select("id, username, full_name, avatar_url").in("id", sellerIds),
      sb.from("public_seller_profiles").select("user_id, seller_level").in("user_id", sellerIds),
      sb.from("gig_packages").select("gig_id, price, delivery_days").in("gig_id", gigIds),
    ]);

    const userById = new Map((users ?? []).map((u: any) => [u.id, u]));
    const profileById = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const pkgByGig = new Map<string, Array<{ price: number; delivery_days: number }>>();
    for (const p of packages ?? []) {
      const list = pkgByGig.get((p as any).gig_id) ?? [];
      list.push({ price: Number((p as any).price), delivery_days: Number((p as any).delivery_days) });
      pkgByGig.set((p as any).gig_id, list);
    }

    const minPrice = params.min_price ? parseFloat(params.min_price) : null;
    const maxPrice = params.max_price ? parseFloat(params.max_price) : null;
    const maxDelivery = params.delivery_days ? parseInt(params.delivery_days, 10) : null;
    const levels = toArray(params.level);

    const mapped: GigRow[] = gigRows.map((g: any) => {
      const u = userById.get(g.seller_id) as any;
      const p = profileById.get(g.seller_id) as any;
      const pkgs = pkgByGig.get(g.id) ?? [];
      const startingPrice = pkgs.length > 0 ? Math.min(...pkgs.map((x) => x.price)) : 0;
      return {
        ...g,
        starting_price: startingPrice,
        delivery_days: pkgs.length > 0 ? Math.min(...pkgs.map((x) => x.delivery_days)) : null,
        seller: {
          username: u?.username ?? "seller",
          full_name: u?.full_name ?? "Seller",
          avatar_url: u?.avatar_url ?? null,
          seller_level: p?.seller_level ?? "new_seller",
        },
      };
    });

    const filtered = mapped.filter((g) => {
      if (minPrice != null && g.starting_price < minPrice) return false;
      if (maxPrice != null && g.starting_price > maxPrice) return false;
      if (maxDelivery != null) {
        const pkgs = pkgByGig.get(g.id) ?? [];
        if (pkgs.length === 0) return false;
        const minDelivery = Math.min(...pkgs.map((x) => x.delivery_days));
        if (minDelivery > maxDelivery) return false;
      }
      if (levels.length > 0 && !levels.includes(g.seller.seller_level)) return false;
      return true;
    });

    return { gigs: filtered, count: count ?? 0 };
  } catch {
    return { gigs: [], count: 0 };
  }
}

const DELIVERY_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "1", label: "Within 1 day" },
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 7 days" },
  { value: "14", label: "Up to 14 days" },
];

const LEVEL_OPTIONS = [
  { value: "new_seller", label: "New seller" },
  { value: "level_one", label: "Level one" },
  { value: "level_two", label: "Level two" },
  { value: "top_rated", label: "Top rated" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4.5", label: "4.5 and up" },
  { value: "4.0", label: "4.0 and up" },
  { value: "3.5", label: "3.5 and up" },
];

/* Board results: the first 12 show at once, the rest wait behind "Show N more gigs". */
const BOARD_LIMIT = 12;
/* Grouping by category applies to relevance order only, and only when there is something to group. */
const GROUP_MIN = 8;

function categoryLabel(slug: string | null | undefined) {
  if (!slug) return "Other";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function renderBoard(cards: GigCardData[], grouped: boolean) {
  const row = (c: GigCardData, i: number) => (
    <div key={c.id} data-more={i >= BOARD_LIMIT ? "" : undefined} hidden={i >= BOARD_LIMIT || undefined}>
      <GigRow gig={c} />
    </div>
  );
  if (!grouped) return cards.map((c, i) => row(c, i));

  const groups = new Map<string, { label: string; items: Array<{ c: GigCardData; i: number }> }>();
  cards.forEach((c, i) => {
    const key = c.category_slug ?? "other";
    const g = groups.get(key) ?? { label: categoryLabel(c.category_slug), items: [] };
    g.items.push({ c, i });
    groups.set(key, g);
  });
  return Array.from(groups.entries()).map(([key, g]) => {
    const headHidden = g.items[0].i >= BOARD_LIMIT;
    return (
      <section key={key} aria-label={g.label}>
        <h2 data-more={headHidden ? "" : undefined} hidden={headHidden || undefined} className="search-group-head">
          <span>{g.label}</span>
          <span className="num">
            {g.items.length} {g.items.length === 1 ? "gig" : "gigs"}
          </span>
        </h2>
        {g.items.map(({ c, i }) => row(c, i))}
      </section>
    );
  });
}

function countActiveFilters(p: SearchParams) {
  let n = 0;
  if (p.min_price) n++;
  if (p.max_price) n++;
  if (p.delivery_days) n++;
  if (p.rating) n++;
  n += toArray(p.level).length;
  return n;
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { gigs } = await searchGigs(searchParams);
  const roots = await getCategoryRootSlugs();
  const q = searchParams.q ?? "";
  const sort = searchParams.sort ?? "relevance";
  const view = searchParams.view === "grid" ? "grid" : "board";
  const activeCount = countActiveFilters(searchParams);
  const selectedLevels = toArray(searchParams.level);

  const cards: GigCardData[] = gigs.map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    thumbnail_url: g.thumbnail_url,
    average_rating: g.average_rating ?? 0,
    total_reviews: g.total_reviews ?? 0,
    starting_price: g.starting_price,
    category_slug: roots.get(g.category_id) ?? null,
    delivery_days: g.delivery_days,
    seller: g.seller,
  }));

  const viewHref = (v: "board" | "grid") => buildRemoveUrl(searchParams, ["view"], v === "grid" ? { view: "grid" } : {});

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <div className="min-w-0">
            <p className="eyebrow">Browse</p>
            <h1 className="t-sign mt-3">
              {q ? (
                <>
                  <span className="num">{gigs.length}</span> {gigs.length === 1 ? "gig" : "gigs"} for &ldquo;{q}&rdquo;
                </>
              ) : (
                <>
                  <span className="num">{gigs.length}</span> {gigs.length === 1 ? "gig" : "gigs"} open for booking
                </>
              )}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav aria-label="Result view" className="tabs w-auto">
              <Link href={viewHref("board")} aria-current={view === "board" ? "page" : undefined} className="tab px-4" aria-selected={view === "board"}>
                Board
              </Link>
              <Link href={viewHref("grid")} aria-current={view === "grid" ? "page" : undefined} className="tab px-4" aria-selected={view === "grid"}>
                Grid
              </Link>
            </nav>
            <SortSelect defaultValue={sort} />
          </div>
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <MobileFilterTrigger activeCount={activeCount}>
            <FilterForm searchParams={searchParams} selectedLevels={selectedLevels} stacked />
          </MobileFilterTrigger>
          <div className="hidden lg:block">
            <FilterForm searchParams={searchParams} selectedLevels={selectedLevels} />
          </div>
          {activeCount > 0 && (
            <>
              {(searchParams.min_price || searchParams.max_price) && (
                <ActiveChip
                  label={`${searchParams.min_price ? `$${searchParams.min_price}` : "Any"} to ${searchParams.max_price ? `$${searchParams.max_price}` : "any"}`}
                  removeUrl={buildRemoveUrl(searchParams, ["min_price", "max_price"])}
                />
              )}
              {searchParams.delivery_days && (
                <ActiveChip
                  label={DELIVERY_OPTIONS.find((d) => d.value === searchParams.delivery_days)?.label ?? `${searchParams.delivery_days} days`}
                  removeUrl={buildRemoveUrl(searchParams, ["delivery_days"])}
                />
              )}
              {selectedLevels.map((lv) => (
                <ActiveChip
                  key={lv}
                  label={LEVEL_OPTIONS.find((l) => l.value === lv)?.label ?? lv}
                  removeUrl={buildRemoveUrl(searchParams, [], { level: selectedLevels.filter((x) => x !== lv) })}
                />
              ))}
              {searchParams.rating && (
                <ActiveChip label={RATING_OPTIONS.find((r) => r.value === searchParams.rating)?.label ?? searchParams.rating} removeUrl={buildRemoveUrl(searchParams, ["rating"])} />
              )}
              <Link href={buildRemoveUrl(searchParams, ["min_price", "max_price", "delivery_days", "rating", "level"])} className="link ml-1 text-sm font-semibold">
                Clear filters
              </Link>
            </>
          )}
        </div>

        <div className="mt-8">
          {gigs.length === 0 ? (
            <EmptyState
              sign="No match"
              title="No gigs match"
              description={activeCount > 0 ? "Try removing a filter, or search for something broader." : `Nothing matches “${q}”. Try a different word or browse every gig.`}
              action={
                <Button asChild>
                  <Link href="/search">Browse all gigs</Link>
                </Button>
              }
            />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((c) => (
                <GigCard key={c.id} gig={c} />
              ))}
            </div>
          ) : (
            <div className="panel px-0 pt-3">
              <GigBoardHeader />
              <ShowMore hiddenCount={Math.max(0, cards.length - BOARD_LIMIT)}>
                <Reveal as="div" stagger={30} className="[&>div:last-child>article]:border-b-0 [&>section:last-child>div:last-child>article]:border-b-0">
                  {renderBoard(cards, sort === "relevance" && cards.length > GROUP_MIN)}
                </Reveal>
              </ShowMore>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function buildRemoveUrl(current: SearchParams, removeKeys: string[], overrides: Partial<Record<string, string | string[]>> = {}): string {
  const params = new URLSearchParams();
  const entries: Array<[string, string | string[] | undefined]> = [
    ["q", current.q],
    ["category", current.category],
    ["sort", current.sort],
    ["view", current.view],
    ["min_price", current.min_price],
    ["max_price", current.max_price],
    ["delivery_days", current.delivery_days],
    ["rating", current.rating],
    ["level", current.level],
  ];
  for (const [k, v] of entries) {
    if (removeKeys.includes(k)) continue;
    if (k in overrides) continue;
    if (v == null || v === "") continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.append(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.append(k, v);
  }
  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}

function ActiveChip({ label, removeUrl }: { label: string; removeUrl: string }) {
  return (
    <Link href={removeUrl} className="chip chip--dark h-11 gap-1.5 pr-2 text-xs font-semibold md:h-9">
      <span>{label}</span>
      <X className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Remove filter</span>
    </Link>
  );
}

const CHOICE = "flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] px-2 text-sm text-ink hover:bg-surface-sunk";
const BOX = "h-[18px] w-[18px] shrink-0 accent-[#111113]";

/* One filter. In the top bar it is a popover (details/summary, works without JavaScript); in the mobile sheet it is a plain group. */
function FilterGroup({ title, value, stacked, children }: { title: string; value?: string; stacked?: boolean; children: React.ReactNode }) {
  if (stacked) {
    return (
      <fieldset className="border-t border-line py-4 first:border-t-0 first:pt-0">
        <legend className="eyebrow mb-3">{title}</legend>
        {children}
      </fieldset>
    );
  }
  return (
    <details className="filter-pop">
      <summary className="filter-pop-trigger">
        <span>{title}</span>
        {value ? <span className="filter-pop-value">{value}</span> : null}
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="filter-pop-panel">
        <fieldset>
          <legend className="sr-only">{title}</legend>
          {children}
        </fieldset>
        <button type="submit" className="btn btn-primary btn-small mt-3 w-full">
          Show results
        </button>
      </div>
    </details>
  );
}

function FilterForm({ searchParams, selectedLevels, stacked = false }: { searchParams: SearchParams; selectedLevels: string[]; stacked?: boolean }) {
  const q = searchParams.q ?? "";
  const category = searchParams.category ?? "";
  const sort = searchParams.sort ?? "";
  const view = searchParams.view ?? "";
  const selectedDelivery = searchParams.delivery_days ?? "";
  const selectedRating = searchParams.rating ?? "";
  const priceValue = searchParams.min_price || searchParams.max_price ? `${searchParams.min_price ? `$${searchParams.min_price}` : "$0"} to ${searchParams.max_price ? `$${searchParams.max_price}` : "any"}` : undefined;

  return (
    <form method="get" action="/search" className={stacked ? "" : "flex flex-wrap items-center gap-2"}>
      {q && <input type="hidden" name="q" value={q} />}
      {category && <input type="hidden" name="category" value={category} />}
      {sort && <input type="hidden" name="sort" value={sort} />}
      {view && <input type="hidden" name="view" value={view} />}

      <FilterGroup title="Price" value={priceValue} stacked={stacked}>
        <div className="flex items-center gap-2">
          <input type="number" name="min_price" min={0} inputMode="numeric" aria-label="Minimum price" placeholder="Min" defaultValue={searchParams.min_price ?? ""} className="field field-num min-w-0 flex-1" />
          <span className="shrink-0 text-sm text-ink-2">to</span>
          <input type="number" name="max_price" min={0} inputMode="numeric" aria-label="Maximum price" placeholder="Max" defaultValue={searchParams.max_price ?? ""} className="field field-num min-w-0 flex-1" />
        </div>
      </FilterGroup>

      <FilterGroup title="Delivery" value={selectedDelivery ? DELIVERY_OPTIONS.find((d) => d.value === selectedDelivery)?.label : undefined} stacked={stacked}>
        <div className="-mx-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <label key={opt.label} className={CHOICE}>
              <input type="radio" name="delivery_days" value={opt.value} defaultChecked={selectedDelivery === opt.value} className={BOX} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Seller level" value={selectedLevels.length ? String(selectedLevels.length) : undefined} stacked={stacked}>
        <div className="-mx-2">
          {LEVEL_OPTIONS.map((l) => (
            <label key={l.value} className={CHOICE}>
              <input type="checkbox" name="level" value={l.value} defaultChecked={selectedLevels.includes(l.value)} className={BOX} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Rating" value={selectedRating ? RATING_OPTIONS.find((r) => r.value === selectedRating)?.label : undefined} stacked={stacked}>
        <div className="-mx-2">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.label} className={CHOICE}>
              <input type="radio" name="rating" value={opt.value} defaultChecked={selectedRating === opt.value} className={BOX} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {stacked ? (
        <div className="flex gap-2 border-t border-line pt-4">
          <Button type="submit" className="flex-1">
            Show results
          </Button>
          <Button asChild variant="secondary">
            <Link href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}>Clear</Link>
          </Button>
        </div>
      ) : null}
    </form>
  );
}
