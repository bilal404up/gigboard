import Link from "next/link";
import { WINDOWS, countBoard, type BoardGig, type WindowNo } from "@/lib/board";
import "./windows-facade.css";

const NOS: WindowNo[] = [1, 2, 3, 4, 5, 6];

type Props = {
  gigs: BoardGig[];
  /** Real category links, keyed by window. Defaults to a search for the window name. */
  hrefs?: Partial<Record<WindowNo, string>>;
};

function count(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function WindowsFacade({ gigs, hrefs = {} }: Props) {
  const { byWindow } = countBoard(gigs);

  return (
    <section className="wf" aria-labelledby="wf-title">
      <div className="wf-head">
        <h2 id="wf-title" className="wf-h2">
          Browse by category
        </h2>
        <p className="wf-intro">Six categories. Every gig has one fixed price and a delivery date.</p>
      </div>

      <ol className="wf-list">
        {NOS.map((no) => {
          const name = WINDOWS[no];
          const n = byWindow[no];
          const mine = gigs.filter((g) => g.window === no);
          const next = mine[0];
          const from = mine.length ? Math.min(...mine.map((g) => g.price)) : null;
          const href = hrefs[no] ?? `/search?q=${encodeURIComponent(name)}`;
          const countText = n ? count(n, "gig", "gigs") : "No gigs yet";
          const fromText = from !== null ? `From $${from}` : "";
          const label = `${name}. ${countText}.${fromText ? ` ${fromText}.` : ""}${next ? ` Next up: ${next.title}.` : ""}`;

          return (
            <li key={no}>
              <Link className="wf-row" href={href} aria-label={label}>
                <span className="wf-no" aria-hidden="true">
                  {no}
                </span>
                <span className="wf-main" aria-hidden="true">
                  <span className="wf-name">{name}</span>
                  <span className="wf-next">{next ? `Next up: ${next.title}` : "Nothing listed yet"}</span>
                </span>
                <span className="wf-side" aria-hidden="true">
                  <span className="wf-count">{countText}</span>
                  {fromText && <span className="wf-meta">{fromText}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
