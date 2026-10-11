import Link from "next/link";
import { SellerMark } from "@/components/seller/SellerMark";
import type { BoardGig, WindowNo } from "@/lib/board";
import "./seller-roster.css";

type SellerLevel = "new_seller" | "level_one" | "level_two" | "top_rated";

export type RosterSeller = {
  username: string;
  fullName: string;
  avatarUrl: string | null;
  level: SellerLevel;
  rating: number;
  totalOrders: number;
  tagline?: string | null;
};

const LEVEL: Record<SellerLevel, string> = {
  new_seller: "New seller",
  level_one: "Level one",
  level_two: "Level two",
  top_rated: "Top rated",
};

type Props = {
  sellers: RosterSeller[];
  gigs: BoardGig[];
  /** Which board gigs belong to a seller. Defaults to matching the full name. */
  owns?: (gig: BoardGig, seller: RosterSeller) => boolean;
};

function list(ns: number[]) {
  return ns.length > 1 ? `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}` : String(ns[0] ?? "");
}

export default function SellerRoster({ sellers, gigs, owns }: Props) {
  if (!sellers.length) return null;
  const isOwner = owns ?? ((g: BoardGig, s: RosterSeller) => g.seller === s.fullName);

  return (
    <section className="sr" aria-labelledby="sr-title">
      <div className="sr-head">
        <h2 id="sr-title" className="sr-h2">
          Sellers at the window
        </h2>
        <p className="sr-intro">Every seller lists a fixed price and is paid when you approve the work.</p>
      </div>

      <div className="sr-strip">
        <div className="sr-cols" aria-hidden="true">
          <span>Seller</span>
          <span>Windows</span>
          <span>Jobs done</span>
          <span>Rating</span>
          <span>On the board</span>
        </div>

        <ul className="sr-rows">
          {sellers.map((s) => {
            const theirs = gigs.filter((g) => isOwner(g, s));
            const windows = Array.from(new Set(theirs.map((g) => g.window))).sort() as WindowNo[];
            const from = theirs.length ? Math.min(...theirs.map((g) => g.price)) : null;
            const gigText = theirs.length
              ? `${theirs.length} ${theirs.length === 1 ? "gig" : "gigs"} from $${from}`
              : "Nothing listed yet";
            const ratingText = s.rating > 0 ? s.rating.toFixed(1) : "New";
            const label = [
              `${s.fullName}, ${LEVEL[s.level]}.`,
              windows.length ? `Window ${list(windows)}.` : "",
              `${s.totalOrders} jobs done.`,
              s.rating > 0 ? `Rated ${ratingText}.` : "Not rated yet.",
              `${gigText}.`,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={s.username} className="sr-row">
                <Link href={`/seller/${s.username}`} className="sr-link" aria-label={label}>
                  <span className="sr-who">
                    {s.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.avatarUrl} alt="" width={44} height={44} className="sr-avatar" />
                    ) : (
                      <span className="sr-mark">
                        <SellerMark username={s.username} level={s.level} size={44} />
                      </span>
                    )}
                    <span className="sr-name">{s.fullName}</span>
                    <span className="sr-sub">
                      {LEVEL[s.level]}
                      {s.tagline ? `. ${s.tagline}` : ""}
                    </span>
                  </span>

                  <span className="sr-facts" aria-hidden="true">
                    <span className="sr-windows">
                      {windows.map((w) => (
                        <i key={w} className="sr-pip" data-w={w}>
                          {w}
                        </i>
                      ))}
                    </span>
                    <span className="sr-fact">
                      <b>{s.totalOrders}</b> <small>jobs done</small>
                    </span>
                    <span className="sr-fact">
                      <b>{ratingText}</b> <small>{s.rating > 0 ? "rating" : ""}</small>
                    </span>
                    <span className="sr-fact sr-gigs">{gigText}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
