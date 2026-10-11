import Link from "next/link"
import { GigArt } from "@/components/gig/GigArt"

export type CategoryWindow = { slug: string; name: string; count?: number | null }

type Props = { categories: CategoryWindow[]; heading?: string; className?: string }

/* Categories as numbered service windows along the counter. Scrolls sideways on small screens. */
export function CategoryWindows({ categories, heading = "Pick a window", className = "" }: Props) {
  return (
    <section aria-labelledby="windows-title" className={`wrap py-12 lg:py-16 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="windows-title" className="t-sign">
          {heading}
        </h2>
        <p className="max-w-[36ch] text-sm text-ink-muted">Every window takes one job at a fixed price. The drawer works the same at all of them.</p>
      </div>

      <ol className="mt-8 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6">
        {categories.map((c, i) => (
          <li key={c.slug} className="min-w-[11.5rem] snap-start md:min-w-0">
            <Link
              href={`/category/${c.slug}`}
              className="sign group relative block overflow-hidden p-2 pb-3 transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release"
            >
              <span className="plate t-plate absolute left-4 top-4 z-10 min-h-6 px-2">Window {i + 1}</span>
              <GigArt seed={c.slug} category={c.slug} className="rounded-[6px]" />
              <span className="mt-3 block px-2 font-display text-lg font-bold leading-tight text-laminate">{c.name}</span>
              {typeof c.count === "number" ? (
                <span className="num mt-0.5 block px-2 text-xs text-sand">
                  {c.count} {c.count === 1 ? "gig" : "gigs"}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
