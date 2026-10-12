"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { GigArt } from "@/components/gig/GigArt";
import { cn } from "@/lib/utils/cn";

type Suggestion = {
  categories: Array<{ id: string; slug: string; name: string; gig_count: number | null }>;
  gigs: Array<{ id: string; slug: string; title: string; thumbnail_url: string | null; average_rating: number | null }>;
};

interface Props {
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
  initialQuery?: string;
}

export function SearchAutocomplete({ placeholder = "What do you need done?", size = "md", className, initialQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [data, setData] = useState<Suggestion>({ categories: [], gigs: [] });
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length < 2) {
        setData({ categories: [], gigs: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = (await res.json()) as Suggestion;
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items: Array<{ kind: "category" | "gig"; href: string }> = [
    ...data.categories.map((c) => ({ kind: "category" as const, href: `/category/${c.slug}` })),
    ...data.gigs.map((g) => ({ kind: "gig" as const, href: `/gig/${g.slug}` })),
  ];

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (active >= 0 && items[active]) {
      router.push(items[active].href);
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    const q = query.trim();
    if (q.length === 0) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && (loading || items.length > 0 || query.trim().length >= 2);
  const lg = size === "lg";

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form onSubmit={submit} className="relative">
        <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted", lg ? "left-4 h-5 w-5" : "left-3 h-4 w-4")} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className={cn("field", lg ? "h-14 pl-12 pr-24 text-base" : "h-11 pl-10 pr-20 text-sm md:h-10")}
        />
        <button
          type="submit"
          className={cn(
            "absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-[7px] bg-ink px-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2D32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
            lg ? "h-11" : "h-8 md:h-7"
          )}
        >
          Find
        </button>
      </form>

      {showDropdown && (
        <div role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[12px] bg-white text-ink shadow-[0_0_0_1px_#E3E4E6,0_18px_40px_-20px_rgba(18,20,23,0.35)]">
          {loading && items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-ink-muted">Searching</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-4 text-sm text-ink-muted">No matches. Press Enter to search anyway.</div>
          ) : (
            <>
              {data.categories.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-3 text-xs font-semibold text-ink-muted">Categories</p>
                  {data.categories.map((c, i) => (
                    <SuggestionRow
                      key={c.id}
                      href={`/category/${c.slug}`}
                      active={active === i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setOpen(false)}
                      icon={<span className="grid h-7 w-9 place-items-center rounded-[6px] bg-laminate-sunk text-xs font-semibold text-ink-muted">All</span>}
                      label={c.name}
                      meta={c.gig_count ? `${c.gig_count} gigs` : undefined}
                    />
                  ))}
                </div>
              )}
              {data.gigs.length > 0 && (
                <div className="border-t border-line">
                  <p className="px-4 pb-1 pt-3 text-xs font-semibold text-ink-muted">Top gigs</p>
                  {data.gigs.map((g, i) => {
                    const idx = data.categories.length + i;
                    return (
                      <SuggestionRow
                        key={g.id}
                        href={`/gig/${g.slug}`}
                        active={active === idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => setOpen(false)}
                        icon={
                          g.thumbnail_url ? (
                            <div className="relative h-7 w-9 shrink-0 overflow-hidden rounded-[6px] bg-laminate-sunk">
                              <Image src={g.thumbnail_url} alt="" fill className="object-cover" sizes="36px" />
                            </div>
                          ) : (
                            <div className="h-7 w-9 shrink-0 overflow-hidden rounded-[6px]">
                              <GigArt seed={g.slug} cover />
                            </div>
                          )
                        }
                        label={g.title}
                        meta={
                          g.average_rating && g.average_rating > 0 ? (
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Star className="h-3 w-3 fill-ink text-ink" />
                              {g.average_rating.toFixed(1)}
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </div>
              )}
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setOpen(false)}
                className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-ink hover:bg-laminate-sunk"
              >
                See all results for &quot;{query.trim()}&quot;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionRow({
  href,
  active,
  onMouseEnter,
  onClick,
  icon,
  label,
  meta,
}: {
  href: string;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  meta?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      role="option"
      aria-selected={active}
      className={cn("flex min-h-11 items-center gap-3 px-4 py-2 text-sm transition-colors", active ? "bg-laminate-sunk text-ink" : "text-ink hover:bg-laminate-sunk")}
    >
      <span className="flex shrink-0 items-center justify-center">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {meta && <span className="shrink-0 text-xs text-ink-muted">{meta}</span>}
    </Link>
  );
}
