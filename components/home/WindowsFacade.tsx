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
          Or start at a window
        </h2>
        <p className="wf-intro">
          Each window has its own sellers. Every job is one fixed price, paid the same way.
        </p>
      </div>

      <ol className="wf-wall">
        {NOS.map((no) => {
          const name = WINDOWS[no];
          const n = byWindow[no];
          const next = gigs.find((g) => g.window === no);
          const href = hrefs[no] ?? `/search?q=${encodeURIComponent(name)}`;
          const countText = n ? count(n, "gig", "gigs") : "No gigs yet";
          const meta = next ? `$${next.price}, ${count(next.days, "day", "days")}` : "";
          const label = `Window ${no}, ${name}. ${countText}.${next ? ` Next up: ${next.title}, ${meta}.` : ""}`;

          return (
            <li key={no} className="wf-bay" data-w={no}>
              <Link className="wf-window" href={href} aria-label={label}>
                <span className="wf-sign" aria-hidden="true">
                  <span className="wf-no">{no}</span>
                  <span className="wf-name">{name}</span>
                </span>
                <span className="wf-pane" aria-hidden="true">
                  <span className="wf-glint" />
                  <span className="wf-count">{countText}</span>
                  {next && (
                    <span className="wf-next">
                      <span className="wf-next-label">Next up</span>
                      <span className="wf-next-title">{next.title}</span>
                      <span className="wf-next-meta">{meta}</span>
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
