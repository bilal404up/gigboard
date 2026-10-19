import Link from "next/link"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import { RatingGlyph } from "@/components/ui/rating-stars"
import { Reveal } from "@/components/motion/Reveal"
import { CountUp } from "@/components/motion/CountUp"

export type SellerCardData = {
  username: string
  fullName: string
  avatarUrl: string | null
  level: string
  rating: number
  jobs: number
  gigs: number
  from: number | null
  tagline: string | null
}

/* People first: face, name, tagline, then the real numbers. */
export function SellerCards({ sellers }: { sellers: SellerCardData[] }) {
  if (!sellers.length) return null
  return (
    <section className="home-section home-section--rule" aria-labelledby="sc-title">
      <div className="wrap">
        <div className="home-head">
          <p className="eyebrow">Sellers</p>
          <h2 id="sc-title" className="t-sign">
            The people behind the gigs
          </h2>
          <p className="home-lead">Sample sellers. Each one lists fixed prices and is paid only when the buyer approves.</p>
        </div>
        <Reveal as="ul" stagger={70} className="sc-grid">
          {sellers.map((s) => (
            <li key={s.username}>
              <Link href={`/seller/${s.username}`} className="sc-card">
                <span className="sc-top">
                  <SellerMark username={s.username} level={s.level} size={56} label={`${s.fullName}, initials`} />
                  <LevelPlate level={s.level} />
                </span>
                <span className="sc-name">{s.fullName}</span>
                <span className="sc-tagline">{s.tagline ?? "No tagline yet."}</span>
                <span className="sc-facts">
                  <span>
                    <span className="sc-k">Jobs</span>
                    <CountUp className="num sc-v" value={s.jobs} ms={800} />
                  </span>
                  <span>
                    <span className="sc-k">Rating</span>
                    <span className="num sc-v inline-flex items-center gap-1">
                      {s.rating > 0 ? (
                        <>
                          <RatingGlyph size={11} />
                          <CountUp value={s.rating} ms={800} decimals={1} />
                        </>
                      ) : (
                        "None yet"
                      )}
                    </span>
                  </span>
                  <span>
                    <span className="sc-k">Gigs</span>
                    <span className="num sc-v">{s.gigs ? `${s.gigs}${s.from !== null ? ` from $${s.from}` : ""}` : "0"}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
