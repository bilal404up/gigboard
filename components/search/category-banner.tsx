import { GigArt } from "@/components/gig/GigArt"

type Props = { name: string; slug: string; count?: number | null; description?: string | null }

export function CategoryBanner({ name, slug, count, description }: Props) {
  return (
    <section className="border-b border-line bg-white" aria-labelledby="category-title">
      <div className="wrap grid items-center gap-6 py-10 md:grid-cols-[10rem_minmax(0,1fr)] lg:py-14">
        <div className="overflow-hidden rounded-[12px] border border-line">
          <GigArt seed={slug} category={slug} text={name} />
        </div>
        <div>
          <h1 id="category-title" className="t-sign">
            {name}
          </h1>
          {description ? <p className="mt-3 max-w-[52ch] text-ink-muted">{description}</p> : null}
          {typeof count === "number" ? (
            <p className="mt-3 text-sm tabular-nums text-ink-muted">
              {count} {count === 1 ? "gig" : "gigs"} in this category
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
