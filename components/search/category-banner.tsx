import { GigArt } from "@/components/gig/GigArt"

type Props = { name: string; slug: string; count?: number | null; description?: string | null }

/* The category page opens at its window: the enamel sign, the name, how many gigs are behind the glass. */
export function CategoryBanner({ name, slug, count, description }: Props) {
  return (
    <section className="booth" aria-labelledby="category-title">
      <div className="wrap grid items-center gap-6 py-10 md:grid-cols-[12rem_minmax(0,1fr)] lg:py-14">
        <div className="sign p-2">
          <GigArt seed={slug} category={slug} className="rounded-[6px]" />
        </div>
        <div>
          <h1 id="category-title" className="t-sign">
            {name}
          </h1>
          {description ? <p className="mt-3 max-w-[52ch] text-sand">{description}</p> : null}
          {typeof count === "number" ? (
            <p className="num mt-3 text-sm text-sand">
              {count} {count === 1 ? "gig" : "gigs"} at this window
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
