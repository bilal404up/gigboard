"use client";

/*
 * GigBoard: the live departures board, the Gigboard hero.
 *
 * - Columns: Gig (two flap lines) / Seller / Ready by / Price / Status, plus the rating as plain text.
 * - Cells persist and only their letters change. A change flips through at most three letters
 *   using the Web Animations API on transform only. Every flip ends on the real character.
 * - One wake-up riffle on first view. It settles within about 1.2s, and a guard repaints the
 *   final text after 1.3s, so the board never rests on scrambled letters.
 * - In demo mode the board cycles the site's own gigs every 15s. Hover and focus hold it, a
 *   search or a category pauses it for the session, and Pause and Play are a button.
 * - Off-screen boards and hidden tabs sleep. Under reduced motion letters swap instantly.
 * - The server render already shows the real rows, so nothing starts blank and it works
 *   without JavaScript. "Ready by" dates are recomputed in the visitor's own time zone.
 * - On phones titles are plain text; only Ready by and Price are flaps.
 */

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { CATEGORY_SHORT, DRUM, WINDOWS, readyBy, type BoardGig, type WindowNo } from "@/lib/board";
import "./gig-board.css";

/* Timing ------------------------------------------------------------- */

type Cadence = "wake" | "user" | "arrival";

const CADENCE: Record<Cadence, { row: number; col: number; step: number }> = {
  wake: { row: 60, col: 6, step: 64 },
  user: { row: 40, col: 5, step: 60 },
  arrival: { row: 80, col: 8, step: 70 },
};

const ROWS = 6;
const COMPACT_ROWS = 4;
const LINE = 24;
const ARRIVAL_MS = 15_000;
const DEBOUNCE_MS = 150;
const SETTLE_MS = 1300;
const PAUSE_KEY = "gigboard:board-paused";

/* Must match gig-board.css */
const BP_COMPACT = 768;
const BP_SELLER = 1200;

type Glyph = { t: string; tone?: string };
type Strip = "wide" | "compact" | "both";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function charPath(from: string, to: string, max = 3): string[] {
  const L = DRUM.length;
  const a = Math.max(0, DRUM.indexOf(from));
  const b = DRUM.indexOf(to);
  if (b < 0) return [];
  const d = (b - a + L) % L;
  const out: string[] = [];
  for (let k = Math.max(1, d - max); k < d; k++) out.push(DRUM[(a + k) % L]);
  return out;
}

function wordPath(from: string, to: string, drum?: Glyph[]): Glyph[] {
  if (!drum || drum.length < 3) return [];
  const i = drum.findIndex((g) => g.t === to);
  if (i < 0) return [];
  const prev = drum[(i - 1 + drum.length) % drum.length];
  return prev.t === from || prev.t === to ? [] : [prev];
}

function riffle(target: Glyph, n: number, drum?: Glyph[]): Glyph[] {
  if (n === 1) {
    if (!target.t.trim()) return [target];
    return [{ t: LETTERS[Math.floor(Math.random() * 26)] }, target];
  }
  const others = drum?.filter((g) => g.t && g.t !== target.t) ?? [];
  if (!others.length) return [target];
  return [others[Math.floor(Math.random() * others.length)], target];
}

function isShown(strip: Strip, row: number, hideBelow?: number) {
  const w = window.innerWidth;
  const compact = w < BP_COMPACT;
  if (strip === "wide" && compact) return false;
  if (strip === "compact" && !compact) return false;
  if (compact && row >= COMPACT_ROWS) return false;
  if (hideBelow && w < hideBelow) return false;
  return true;
}

/* Halves and leaves -------------------------------------------------- */

function paint(face: HTMLElement, g: Glyph) {
  if (face.textContent !== g.t) face.textContent = g.t;
  if (g.tone) face.dataset.tone = g.tone;
  else delete face.dataset.tone;
}

function ensureLeaves(cell: HTMLElement): [HTMLElement, HTMLElement] {
  if (cell.children.length >= 4) return [cell.children[2] as HTMLElement, cell.children[3] as HTMLElement];
  const top = document.createElement("span");
  top.className = "gb-face gb-face--top gb-leaf";
  const bot = document.createElement("span");
  bot.className = "gb-face gb-face--bot gb-leaf";
  cell.append(top, bot);
  return [top, bot];
}

function dropLeaves(cell: HTMLElement) {
  while (cell.children.length > 2) cell.lastElementChild?.remove();
}

async function play(
  cell: HTMLElement,
  landed: MutableRefObject<Glyph>,
  seq: Glyph[],
  delay: number,
  step: number,
  running: MutableRefObject<Animation[]>,
  stale: () => boolean,
) {
  const top = cell.children[0] as HTMLElement;
  const bot = cell.children[1] as HTMLElement;
  const [leafTop, leafBot] = ensureLeaves(cell);
  const half = step / 2;
  let wait = delay;

  for (const next of seq) {
    if (stale()) return;
    const cur = landed.current;
    paint(top, next);
    paint(bot, cur);
    paint(leafTop, cur);
    paint(leafBot, next);

    const fall = leafTop.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], {
      duration: half,
      delay: wait,
      easing: "cubic-bezier(0.55, 0, 0.9, 0.45)",
      fill: "both",
    });
    const land = leafBot.animate(
      [
        { transform: "rotateX(90deg)", easing: "cubic-bezier(0.45, 0, 0.9, 0.5)" },
        { transform: "rotateX(0deg)", offset: 0.65, easing: "ease-out" },
        { transform: "rotateX(8deg)", offset: 0.82, easing: "ease-in" },
        { transform: "rotateX(0deg)" },
      ],
      { duration: half * 1.5, delay: wait + half, fill: "both" },
    );
    running.current = [fall, land];

    try {
      await land.finished;
    } catch {
      return;
    }
    if (stale()) return;
    paint(bot, next);
    fall.cancel();
    land.cancel();
    landed.current = next;
    wait = 0;
  }
  running.current = [];
  dropLeaves(cell);
}

/* Context ------------------------------------------------------------ */

type BoardCtx = { wake: number; reduced: MutableRefObject<boolean>; cadence: MutableRefObject<Cadence> };

const BoardContext = createContext<BoardCtx>({ wake: 0, reduced: { current: false }, cadence: { current: "user" } });

/* One flap unit ------------------------------------------------------- */

type CellProps = {
  value: string;
  tone?: string;
  n?: number;
  row: number;
  col: number;
  strip?: Strip;
  hideBelow?: number;
  drum?: Glyph[];
  className?: string;
  cadence?: Cadence;
};

const FlapCell = memo(function FlapCell({ value, tone, n = 1, row, col, strip = "both", hideBelow, drum, className, cadence }: CellProps) {
  const board = useContext(BoardContext);
  const ref = useRef<HTMLSpanElement>(null);
  const [first] = useState<Glyph>(() => ({ t: value, tone }));
  const landed = useRef<Glyph>(first);
  const running = useRef<Animation[]>([]);
  const runId = useRef(0);
  const seenWake = useRef(board.wake);
  const guard = useRef(0);

  useEffect(
    () => () => {
      runId.current++;
      running.current.forEach((a) => a.cancel());
      window.clearTimeout(guard.current);
    },
    [],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target: Glyph = { t: value, tone };
    const wake = board.wake !== seenWake.current;
    seenWake.current = board.wake;
    const same = target.t === landed.current.t && target.tone === landed.current.tone;
    if (same && (!wake || !target.t.trim())) return;

    const id = ++runId.current;
    running.current.forEach((a) => a.cancel());
    running.current = [];
    window.clearTimeout(guard.current);
    const top = el.children[0] as HTMLElement;
    const bot = el.children[1] as HTMLElement;

    const settle = () => {
      if (runId.current !== id) return;
      running.current.forEach((a) => a.cancel());
      running.current = [];
      dropLeaves(el);
      landed.current = target;
      paint(top, target);
      paint(bot, target);
    };

    if (board.reduced.current || typeof el.animate !== "function" || !isShown(strip, row, hideBelow)) {
      settle();
      return;
    }

    paint(top, landed.current);
    paint(bot, landed.current);
    const seq = same
      ? riffle(target, n, drum)
      : n === 1
        ? [...charPath(landed.current.t, target.t).map((t) => ({ t, tone })), target]
        : [...wordPath(landed.current.t, target.t, drum), target];

    const c = CADENCE[cadence ?? board.cadence.current];
    void play(el, landed, seq, row * c.row + col * c.col, c.step, running, () => runId.current !== id);
    // The guard: whatever happens to the animation, the cell shows the real text after SETTLE_MS.
    guard.current = window.setTimeout(settle, SETTLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, tone, board.wake]);

  const style = n > 1 ? ({ "--n": n } as CSSProperties) : undefined;
  return (
    <span ref={ref} className={`gb-cell${n > 1 ? " gb-cell--word" : ""}${className ? ` ${className}` : ""}`} style={style}>
      <span className="gb-face gb-face--top" data-tone={first.tone}>
        {first.t}
      </span>
      <span className="gb-face gb-face--bot" data-tone={first.tone}>
        {first.t}
      </span>
    </span>
  );
});

/* Rows --------------------------------------------------------------- */

type Drums = Record<"seller" | "ready" | "price" | "status", Glyph[]>;

function pad(s: string, len: number) {
  return Array.from(s.toUpperCase().slice(0, len).padEnd(len, " "));
}

const Row = memo(function Row({ gig, row, blank, drums, today }: { gig: BoardGig | null; row: number; blank?: string; drums: Drums; today: Date }) {
  const l1 = pad(gig ? gig.lines[0] : (blank ?? ""), LINE);
  const l2 = pad(gig ? gig.lines[1] : "", LINE);
  const ready = gig ? readyBy(gig.days, today) : "";

  return (
    <li className="gb-row" aria-hidden={gig ? undefined : true}>
      <a className="gb-link" href={gig?.href} aria-label={gig?.label}>
        <span className="gb-cells" aria-hidden="true">
          <span className="gb-col gb-col--title gb-strip-wide">
            <span className="gb-line">
              {l1.map((ch, i) => (
                <FlapCell key={i} value={ch} row={row} col={i} strip="wide" />
              ))}
            </span>
            <span className="gb-line">
              {l2.map((ch, i) => (
                <FlapCell key={i} value={ch} row={row} col={i + 3} strip="wide" />
              ))}
            </span>
          </span>
          <span className="gb-plain">
            <span className="gb-plain-title">{gig?.title ?? (blank ? "No gig matches that search" : "")}</span>
            {gig ? (
              <span className="gb-plain-meta">
                {gig.seller}
                {gig.ratingText ? <span className="gb-plain-rating"> · {gig.ratingText}</span> : null}
              </span>
            ) : null}
          </span>
          <FlapCell value={gig?.sellerBoard ?? ""} n={11} row={row} col={26} strip="wide" hideBelow={BP_SELLER} drum={drums.seller} className="gb-col--seller" />
          <span className="gb-tail">
            <FlapCell value={ready} n={6} row={row} col={38} drum={drums.ready} className="gb-col--ready" />
            <FlapCell value={gig?.priceText ?? ""} n={5} row={row} col={45} drum={drums.price} className="gb-col--price" />
          </span>
          <FlapCell value={gig?.status ?? ""} tone={gig ? "held" : undefined} n={7} row={row} col={51} strip="wide" drum={drums.status} className="gb-col--status" />
          <span className="gb-rating">{gig ? (gig.ratingText ? `★ ${gig.ratingText}` : "No rating yet") : ""}</span>
        </span>
      </a>
    </li>
  );
});

function buildDrums(gigs: BoardGig[], today: Date): Drums {
  const make = (values: string[], tone?: string): Glyph[] => ["", ...Array.from(new Set(values)).sort()].map((t) => ({ t, tone: t ? tone : undefined }));
  return {
    seller: make(gigs.map((g) => g.sellerBoard)),
    ready: make(gigs.map((g) => readyBy(g.days, today))),
    price: make(gigs.map((g) => g.priceText)),
    status: make(gigs.map((g) => g.status), "held"),
  };
}

function matches(hay: string, term: string) {
  if (hay.includes(term)) return true;
  return term.length > 3 && term.endsWith("s") && hay.includes(term.slice(0, -1));
}

/* Clock: the visitor's local time, flips on the minute ---------------- */

function Clock() {
  const [hhmm, setHhmm] = useState("    ");
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const d = new Date();
      setHhmm(`${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`);
      timer = window.setTimeout(tick, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    tick();
    const onVisible = () => {
      if (document.hidden) return;
      window.clearTimeout(timer);
      tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return (
    <span className="gb-clock" aria-hidden="true">
      <FlapCell value={hhmm[0]} row={0} col={0} cadence="user" />
      <FlapCell value={hhmm[1]} row={0} col={1} cadence="user" />
      <span className="gb-colon">:</span>
      <FlapCell value={hhmm[2]} row={0} col={2} cadence="user" />
      <FlapCell value={hhmm[3]} row={0} col={3} cadence="user" />
    </span>
  );
}

const TRY = [
  { term: "logo", text: "a logo" },
  { term: "landing page", text: "a landing page" },
  { term: "app", text: "an app fix" },
];

function TryLinks({ action, onTry }: { action: string; onTry: (term: string) => void }) {
  return (
    <>
      Try{" "}
      {TRY.map((t, i) => (
        <span key={t.term}>
          <a
            href={`${action}?q=${encodeURIComponent(t.term)}`}
            onClick={(e) => {
              e.preventDefault();
              onTry(t.term);
            }}
          >
            {t.text}
          </a>
          {i < TRY.length - 2 ? ", " : i === TRY.length - 2 ? " or " : "."}
        </span>
      ))}
    </>
  );
}

/* The board ----------------------------------------------------------- */

type Props = {
  gigs: BoardGig[];
  /** Active gigs on the site, for the line above the board */
  openCount?: number;
  simulateArrivals?: boolean;
  searchAction?: string;
  howHref?: string;
};

export default function GigBoard({ gigs, openCount, simulateArrivals = true, searchAction = "/search", howHref = "/how-it-works" }: Props) {
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [win, setWin] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedUI, setReducedUI] = useState(false);
  const [arrivals, setArrivals] = useState(0);
  const [wake, setWake] = useState(0);
  // Server date first, then the visitor's own date (they can differ around midnight or across zones).
  const [today, setToday] = useState(() => new Date());

  const reduced = useRef(false);
  const cadence = useRef<Cadence>("user");
  const hover = useRef(false);
  const focus = useRef(false);
  const inView = useRef(true);
  const live = useRef(false);
  const woke = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  const canCycle = gigs.length > ROWS;
  const drums = useMemo(() => buildDrums(gigs, today), [gigs, today]);
  const ctx = useMemo<BoardCtx>(() => ({ wake, reduced, cadence }), [wake]);

  useEffect(() => {
    setToday(new Date());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduced.current = mq.matches;
      setReducedUI(mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    try {
      if (sessionStorage.getItem(PAUSE_KEY) === "1") setPaused(true);
    } catch {
      /* storage unavailable */
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = searchRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(([entry]) => {
      root.dataset.heroSearch = entry.isIntersecting ? "on" : "off";
    });
    io.observe(el);
    return () => {
      io.disconnect();
      delete root.dataset.heroSearch;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      cadence.current = "user";
      setQ(query.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);

  const filtered = useMemo(() => {
    if (!terms.length && !win) return null;
    return gigs.filter((g) => (!win || g.window === win) && terms.every((t) => matches(g.hay, t)));
  }, [gigs, terms, win]);

  const rows = useMemo<(BoardGig | null)[]>(() => {
    if (filtered) return Array.from({ length: ROWS }, (_, i) => filtered[i] ?? null);
    if (!canCycle) return Array.from({ length: ROWS }, (_, i) => gigs[i] ?? null);
    const n = gigs.length;
    return Array.from({ length: ROWS }, (_, i) => gigs[(((i + arrivals * ROWS) % n) + n) % n] ?? null);
  }, [filtered, gigs, arrivals, canCycle]);

  const empty = filtered !== null && filtered.length === 0;

  useEffect(() => {
    live.current = simulateArrivals && canCycle && !paused && !filtered && !reducedUI;
  }, [simulateArrivals, canCycle, paused, filtered, reducedUI]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!live.current || hover.current || focus.current || !inView.current || document.hidden) return;
      cadence.current = "arrival";
      setArrivals((a) => a + 1);
    }, ARRIVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  /* Wake on first view; sleep when off-screen */
  useEffect(() => {
    const el = rootRef.current;
    const wakeUp = () => {
      if (woke.current || reduced.current) return;
      woke.current = true;
      cadence.current = "wake";
      setWake(1);
    };
    if (!el || !("IntersectionObserver" in window)) {
      wakeUp();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) wakeUp();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pauseForSession = useCallback(() => {
    setPaused(true);
    try {
      sessionStorage.setItem(PAUSE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const onType = (value: string) => {
    setQuery(value);
    pauseForSession();
  };
  const onTry = (term: string) => {
    cadence.current = "user";
    setQuery(term);
    setQ(term);
    pauseForSession();
  };
  const onTab = (n: number) => {
    cadence.current = "user";
    setWin(n);
    pauseForSession();
  };
  const onControl = () => {
    if (filtered) {
      cadence.current = "user";
      setQuery("");
      setQ("");
      setWin(0);
      return;
    }
    if (paused) {
      setPaused(false);
      try {
        sessionStorage.removeItem(PAUSE_KEY);
      } catch {
        /* storage unavailable */
      }
      return;
    }
    pauseForSession();
  };

  const count = filtered?.length ?? 0;
  const forQ = q ? ` for “${q}”` : "";
  const where = win ? ` in ${WINDOWS[win as WindowNo]}` : "";
  const status = !filtered ? "" : count === 0 ? `Nothing on the board${forQ}${where}.` : `${count} ${count === 1 ? "gig" : "gigs"}${forQ}${where}.`;

  const control = filtered
    ? { text: "Show all", label: "Show all gigs on the board" }
    : paused
      ? { text: "Play", label: "Play the board" }
      : { text: "Pause", label: "Pause the board" };
  const showControl = Boolean(filtered) || (simulateArrivals && canCycle && !reducedUI);

  return (
    <BoardContext.Provider value={ctx}>
      <section
        ref={rootRef}
        className="gb"
        aria-labelledby="gb-title"
        onFocus={() => {
          focus.current = true;
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focus.current = false;
        }}
      >
        <div className="gb-inner">
          <div className="gb-plate">
            <div className="gb-head-copy">
              <p className="gb-kicker">
                <span className="gb-kicker-dot" aria-hidden="true" />
                Departures{typeof openCount === "number" && openCount > 0 ? ` · ${openCount} gigs open for booking` : ""}
              </p>
              <h1 id="gb-title" className="gb-h1">
                <span className="gb-h1-line">Fixed price.</span> <span className="gb-h1-line">Fixed date.</span>
              </h1>
            </div>

            <div className="gb-find">
              <p className="gb-sub">Your payment is held until you approve the work.</p>
              <form ref={searchRef} className="gb-search" action={searchAction} method="get" role="search">
                <label htmlFor="gb-q" className="gb-sr">
                  What do you need done?
                </label>
                <input
                  id="gb-q"
                  name="q"
                  type="search"
                  className="gb-input"
                  placeholder="What do you need done?"
                  autoComplete="off"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => onType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && query) setQuery("");
                  }}
                />
                <button type="submit" className="gb-go">
                  Search
                </button>
              </form>
              <p className="gb-try">
                {!filtered ? (
                  <TryLinks action={searchAction} onTry={onTry} />
                ) : count > 0 ? (
                  <>
                    {status}
                    {q ? " Search shows every match." : ""}
                  </>
                ) : (
                  <>
                    {status} <TryLinks action={searchAction} onTry={onTry} />
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="gb-frame">
            <div className="gb-topline">
              <span className="gb-board-name">Departures</span>
              <span className="gb-topline-end">
                <span className="gb-local">Local time</span>
                <Clock />
              </span>
            </div>
            <div
              className="gb-field"
              onPointerEnter={() => {
                hover.current = true;
              }}
              onPointerLeave={() => {
                hover.current = false;
              }}
            >
              <div className="gb-grid">
                <div className="gb-heads" aria-hidden="true">
                  <span className="gb-head gb-col--title">Gig</span>
                  <span className="gb-head gb-col--seller">Seller</span>
                  <span className="gb-head gb-col--ready">Ready by</span>
                  <span className="gb-head gb-col--price">From</span>
                  <span className="gb-head gb-col--status">Status</span>
                  <span className="gb-head gb-rating">Rating</span>
                </div>
                <ul className="gb-rows" aria-label="Gigs on the board">
                  {rows.map((gig, i) => (
                    <Row key={i} gig={gig} row={i} blank={empty && i === 0 ? "NO MATCH" : undefined} drums={drums} today={today} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="gb-rail">
              <div className="gb-tabs" role="group" aria-label="Show one category">
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="gb-tab"
                    aria-pressed={win === n}
                    aria-label={n ? WINDOWS[n as WindowNo] : "All categories"}
                    onClick={() => onTab(n)}
                  >
                    {n ? CATEGORY_SHORT[n as WindowNo] : "All"}
                  </button>
                ))}
              </div>
              {showControl && (
                <button type="button" className="gb-ctl" aria-label={control.label} onClick={onControl}>
                  {control.text}
                </button>
              )}
            </div>
          </div>

          <p className="gb-counter">
            You pay when you book. The seller is paid when you approve. <a href={howHref}>How held payment works</a>
          </p>
        </div>

        <p className="gb-sr" role="status">
          {status}
        </p>
      </section>
    </BoardContext.Provider>
  );
}
