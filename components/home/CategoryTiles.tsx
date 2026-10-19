import Link from "next/link"

export type CategoryTile = { slug: string; name: string; count: number; from: number | null }

/* Six large text tiles with the real count of open gigs and the lowest package price. */
export function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  if (!categories.length) return null
  return (
    <section className="home-section home-section--rule" aria-labelledby="ct-title">
      <div className="wrap">
        <div className="home-head">
          <p className="eyebrow">Categories</p>
          <h2 id="ct-title" className="t-sign">
            Six lines, one rule
          </h2>
          <p className="home-lead">Every gig has a fixed price and a delivery date, whatever the category.</p>
        </div>
        <ul className="ct-grid">
          {categories.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="ct-tile">
                <span className="ct-no num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ct-name">{c.name}</span>
                <span className="ct-facts">
                  <span className="num">{c.count === 0 ? "No gigs yet" : `${c.count} ${c.count === 1 ? "gig" : "gigs"}`}</span>
                  {c.from !== null ? <span className="num">from ${c.from}</span> : null}
                </span>
                <span className="ct-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
