import Link from "next/link"
import { Reveal } from "@/components/motion/Reveal"

export type CategoryTile = { slug: string; name: string; count: number; from: number | null }

/* Categories as departure lines: one full-width row each, with the real open-gig count
   and lowest package price. The row turns into a board row on hover. */
export function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  if (!categories.length) return null
  const total = categories.reduce((n, c) => n + c.count, 0)
  return (
    <section className="home-section home-section--rule" aria-labelledby="ct-title">
      <div className="wrap">
        <div className="ct-head">
          <div className="home-head">
            <p className="eyebrow">Categories</p>
            <h2 id="ct-title" className="t-sign">
              Pick a line
            </h2>
            <p className="home-lead">Every gig has a fixed price and a delivery date, whatever the category.</p>
          </div>
          <Link href="/search" className="ct-all">
            Browse all {total} gigs
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="ct-board">
          <div className="ct-cols" aria-hidden="true">
            <span>Line</span>
            <span>Category</span>
            <span className="ct-cols-r">From</span>
            <span className="ct-cols-r">Open</span>
          </div>
          <Reveal as="ul" stagger={55} className="ct-list">
            {categories.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="ct-row"
                  aria-label={`${c.name}: ${c.count === 0 ? "no gigs yet" : `${c.count} ${c.count === 1 ? "gig" : "gigs"}`}${c.from !== null ? `, from $${c.from}` : ""}`}
                >
                  <span className="ct-no num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ct-name">{c.name}</span>
                  <span className="ct-lead" aria-hidden="true" />
                  <span className="ct-facts">
                    <span className="ct-from num">{c.from !== null ? `$${c.from}` : "None"}</span>
                    <span className="ct-count num">{c.count === 0 ? "No gigs yet" : `${c.count} ${c.count === 1 ? "gig" : "gigs"}`}</span>
                  </span>
                  <span className="ct-arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
