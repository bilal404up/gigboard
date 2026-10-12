"use client";

/*
 * GigBoard: the split-flap board that is the Gigboard hero. Loop 2.
 *
 * - Cells persist and only their letters change. A change flips through at
 *   most three letters (the tail of the drum, like a real flap unit), using
 *   the Web Animations API on transform only.
 * - At rest a cell is three elements: the cell and its two halves. The two
 *   moving leaves are created when a cell flips and removed when it lands.
 * - Title letters flip per character. Every other column is a word flap.
 * - One riffle on load. In demo mode the board cycles the site's own sample
 *   gigs every 15s. Hover and focus hold it, a search or tab press pauses it
 *   for the session, and Pause and Play are a button.
 * - Off-screen boards and hidden tabs sleep. Under reduced motion, letters
 *   swap instantly, with no riffle and no arrivals.
 * - The server render already shows the real rows, so nothing starts blank,
 *   nothing shifts, and the board works without JavaScript.
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
import { WINDOWS, type BoardGig, type WindowNo } from "@/lib/board";
import "./gig-board.css";

/* Timing ------------------------------------------------------------- */

type Cadence = "wake" | "user" | "arrival";

const CADENCE: Record<Cadence, { row: number; col: number; step: number }> = {
  wake: { row: 110, col: 12, step: 76 },
  user: { row: 45, col: 8, step: 70 },
  arrival: { row: 120, col: 14, step: 84 },
};

const ROWS = 6;
const COMPACT_ROWS = 4;
const TITLE_WIDE = 18;
const TITLE_COMPACT = 11;
const ARRIVAL_MS = 15_000;
const DEBOUNCE_MS = 150;
const PAUSE_KEY = "gigboard:board-paused";
const TAB_NAMES: Record<WindowNo, string> = { 1: "Web", 2: "Mobile", 3: "Design", 4: "AI", 5: "Marketing", 6: "Business" };

/* Must match the media queries in gig-board.css */
const BP_COMPACT = 768;
const BP_SELLER = 1024;
const BP_DONE = 1440;

/* Glyphs ------------------------------------------------------------- */

type Glyph = { t: string; tone?: string };
type Strip = "wide" | "compact" | "both";

const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$&.,'/:-";
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

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function riffle(target: Glyph, n: number, drum?: Glyph[]): Glyph[] {
  if (n === 1) return [{ t: randomLetter() }, { t: randomLetter() }, target];
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
  if (cell.children.length >= 4) {
    return [cell.children[2] as HTMLElement, cell.children[3] as HTMLElement];
  }
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

    const fall = leafTop.animate(
      [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }],
      { duration: half, delay: wait, easing: "cubic-bezier(0.55, 0, 0.9, 0.45)", fill: "both" },
    );
    const land = leafBot.animate(
      [
        { transform: "rotateX(90deg)", easing: "cubic-bezier(0.45, 0, 0.9, 0.5)" },
        { transform: "rotateX(0deg)", offset: 0.6, easing: "ease-out" },
        { transform: "rotateX(11deg)", offset: 0.8, easing: "ease-in" },
        { transform: "rotateX(0deg)" },
      ],
      { duration: half * 1.6, delay: wait + half, fill: "both" },
    );
    running.current = [fall, land];

    try {
      await land.finished;
    } catch {
      return; // a newer change took over
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

type BoardCtx = {
  wake: number;
  reduced: MutableRefObject<boolean>;
  cadence: MutableRefObject<Cadence>;
};

const BoardContext = createContext<BoardCtx>({
  wake: 0,
  reduced: { current: false },
  cadence: { current: "user" },
});

/* One flap unit ------------------------------------------------------- */

type CellProps = {
  value: string;
  tone?: string;
  n?: number;
  row: number;
  col: number;
  colCompact?: number;
  strip?: Strip;
  hideBelow?: number;
  drum?: Glyph[];
  className?: string;
  cadence?: Cadence;
};

const FlapCell = memo(function FlapCell({
  value,
  tone,
  n = 1,
  row,
  col,
  colCompact,
  strip = "both",
  hideBelow,
  drum,
  className,
  cadence,
}: CellProps) {
  const board = useContext(BoardContext);
  const ref = useRef<HTMLSpanElement>(null);
  const [first] = useState<Glyph>(() => ({ t: value, tone }));
  const landed = useRef<Glyph>(first);
  const running = useRef<Animation[]>([]);
  const runId = useRef(0);
  const seenWake = useRef(board.wake);

  useEffect(
    () => () => {
      runId.current++;
      running.current.forEach((a) => a.cancel());
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
    const top = el.children[0] as HTMLElement;
    const bot = el.children[1] as HTMLElement;
    paint(top, landed.current);
    paint(bot, landed.current);

    if (board.reduced.current || typeof el.animate !== "function" || !isShown(strip, row, hideBelow)) {
      dropLeaves(el);
      landed.current = target;
      paint(top, target);
      paint(bot, target);
      return;
    }

    const seq = same
      ? riffle(target, n, drum)
      : n === 1
        ? [...charPath(landed.current.t, target.t).map((t) => ({ t, tone })), target]
        : [...wordPath(landed.current.t, target.t, drum), target];

    const c = CADENCE[cadence ?? board.cadence.current];
    const compact = window.innerWidth < BP_COMPACT;
    const column = compact && colCompact !== undefined ? colCompact : col;
    void play(el, landed, seq, row * c.row + column * c.col, c.step, running, () => runId.current !== id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, tone, board.wake]);

  const style = n > 1 ? ({ "--n": n } as CSSProperties) : undefined;
  const cls = `gb-cell${n > 1 ? " gb-cell--word" : ""}${className ? ` ${className}` : ""}`;

  return (
    <span ref={ref} className={cls} style={style}>
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

type Drums = Record<
  "window" | "seller" | "done" | "ready" | "price" | "statusWide" | "statusCompact",
  Glyph[]
>;

function pad(s: string, len: number) {
  return Array.from(s.toUpperCase().slice(0, len).padEnd(len, " "));
}

const Row = memo(function Row({
  gig,
  row,
  blank,
  drums,
}: {
  gig: BoardGig | null;
  row: number;
  blank?: string;
  drums: Drums;
}) {
  const wide = pad(gig ? gig.board : (blank ?? ""), TITLE_WIDE);
  const compact = pad(gig ? gig.short : (blank ?? ""), TITLE_COMPACT);
  const tone = gig ? gig.tone : undefined;

  return (
    <li className="gb-row" aria-hidden={gig ? undefined : true}>
      <a className="gb-link" href={gig?.href} aria-label={gig?.label}>
        <span className="gb-cells" aria-hidden="true">
          <span className="gb-col gb-strip-wide">
            {wide.map((ch, i) => (
              <FlapCell key={i} value={ch} row={row} col={i} strip="wide" />
            ))}
          </span>
          <span className="gb-col gb-strip-compact">
            {compact.map((ch, i) => (
              <FlapCell key={i} value={ch} row={row} col={i} strip="compact" />
            ))}
          </span>
          <FlapCell
            value={gig ? String(gig.window) : ""}
            tone={gig ? `w${gig.window}` : undefined}
            n={2}
            row={row}
            col={19}
            strip="wide"
            drum={drums.window}
            className="gb-strip-wide gb-col--window"
          />
          <FlapCell
            value={gig?.sellerBoard ?? ""}
            n={9}
            row={row}
            col={22}
            strip="wide"
            hideBelow={BP_SELLER}
            drum={drums.seller}
            className="gb-strip-wide gb-col--seller"
          />
          <FlapCell
            value={gig ? String(gig.done) : ""}
            n={3}
            row={row}
            col={32}
            strip="wide"
            hideBelow={BP_DONE}
            drum={drums.done}
            className="gb-strip-wide gb-col--done"
          />
          <FlapCell
            value={gig?.ready ?? ""}
            n={6}
            row={row}
            col={36}
            strip="wide"
            hideBelow={BP_SELLER}
            drum={drums.ready}
            className="gb-strip-wide gb-col--ready"
          />
          <FlapCell
            value={gig?.priceText ?? ""}
            n={4}
            row={row}
            col={43}
            colCompact={12}
            drum={drums.price}
            className="gb-col--price"
          />
          <FlapCell
            value={gig?.statusWide ?? ""}
            tone={tone}
            n={8}
            row={row}
            col={48}
            strip="wide"
            drum={drums.statusWide}
            className="gb-strip-wide gb-col--status"
          />
          <FlapCell
            value={gig?.statusCompact ?? ""}
            tone={tone}
            n={4}
            row={row}
            col={17}
            strip="compact"
            drum={drums.statusCompact}
            className="gb-strip-compact gb-col--status"
          />
        </span>
        {gig && <span className="gb-plain" aria-hidden="true">{gig.title}</span>}
      </a>
    </li>
  );
});

function statusTone(t: string): string | undefined {
  if (!t) return undefined;
  if (t === "NEW") return "away";
  return Number(t) >= 4.8 ? "open" : "queue";
}

function buildDrums(gigs: BoardGig[]): Drums {
  const make = (values: string[], toneOf?: (t: string) => string | undefined): Glyph[] =>
    ["", ...Array.from(new Set(values)).sort()].map((t) => ({ t, tone: toneOf?.(t) }));
  return {
    window: make(gigs.map((g) => String(g.window)), (t) => (t ? `w${t}` : undefined)),
    seller: make(gigs.map((g) => g.sellerBoard)),
    done: make(gigs.map((g) => String(g.done))),
    ready: make(gigs.map((g) => g.ready)),
    price: make(gigs.map((g) => g.priceText)),
    statusWide: make(gigs.map((g) => g.statusWide), statusTone),
    statusCompact: make(gigs.map((g) => g.statusCompact), statusTone),
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

/* Try links: fill the search and flip the board, or navigate without JS */

const TRY = [
  { term: "logo", text: "a logo" },
  { term: "landing page", text: "a landing page" },
  { term: "bug fix", text: "a bug fix" },
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
  /** Demo: cycles the site's sample gigs as arrivals. */
  simulateArrivals?: boolean;
  /** Where the search form and try links go. */
  searchAction?: string;
  /** Link for "How the counter works". */
  howHref?: string;
};

export default function GigBoard({
  gigs,
  simulateArrivals = true,
  searchAction = "/search",
  howHref = "/how-it-works",
}: Props) {
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [win, setWin] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedUI, setReducedUI] = useState(false);
  const [arrivals, setArrivals] = useState(0);
  const [wake, setWake] = useState(0);

  const reduced = useRef(false);
  const cadence = useRef<Cadence>("user");
  const hover = useRef(false);
  const focus = useRef(false);
  const inView = useRef(true);
  const live = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  const canCycle = gigs.length > ROWS;
  const drums = useMemo(() => buildDrums(gigs), [gigs]);
  const ctx = useMemo<BoardCtx>(() => ({ wake, reduced, cadence }), [wake]);

  /* Motion preference, session pause, wake-up riffle */
  useEffect(() => {
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
    if (!mq.matches) {
      cadence.current = "wake";
      setWake((w) => (w === 0 ? 1 : w));
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* Tells the nav whether the hero search is on screen */
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

  /* Debounced search */
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
    return gigs.filter(
      (g) => (!win || g.window === win) && terms.every((t) => matches(g.hay, t)),
    );
  }, [gigs, terms, win]);

  const rows = useMemo<(BoardGig | null)[]>(() => {
    if (filtered) return Array.from({ length: ROWS }, (_, i) => filtered[i] ?? null);
    if (!canCycle) return Array.from({ length: ROWS }, (_, i) => gigs[i] ?? null);
    const n = gigs.length;
    return Array.from({ length: ROWS }, (_, i) => gigs[(((i - arrivals) % n) + n) % n] ?? null);
  }, [filtered, gigs, arrivals, canCycle]);

  const empty = filtered !== null && filtered.length === 0;

  /* Arrivals: one timer for the whole board */
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

  /* Sleep when off-screen */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
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
  const where = win ? ` in window ${win}` : "";
  const status = !filtered
    ? ""
    : count === 0
      ? `Nothing on the board${forQ}${where}.`
      : `${count} ${count === 1 ? "gig" : "gigs"}${forQ}${where}.`;

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
        <div className="gb-plate">
          <h1 id="gb-title" className="gb-h1">
            <span className="gb-h1-line">Fixed price, fixed date.</span>{" "}
            <span className="gb-h1-line">Paid when you approve.</span>
          </h1>

          <div className="gb-find">
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
                Find
              </button>
            </form>

            <p className="gb-try">
              {!filtered ? (
                <TryLinks action={searchAction} onTry={onTry} />
              ) : count > 0 ? (
                <>
                  {status}
                  {q ? " Find shows them all." : ""}
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
                <span className="gb-head gb-strip-wide gb-col--window">Window</span>
                <span className="gb-head gb-strip-wide gb-col--seller">Seller</span>
                <span className="gb-head gb-strip-wide gb-col--done">Jobs done</span>
                <span className="gb-head gb-strip-wide gb-col--ready">Ready in</span>
                <span className="gb-head gb-col--price">Price</span>
                <span className="gb-head gb-col--status">Rating</span>
              </div>

              <ul className="gb-rows" aria-label="Gigs on the board">
                {rows.map((gig, i) => (
                  <Row
                    key={i}
                    gig={gig}
                    row={i}
                    blank={empty && i === 0 ? "NO MATCH" : undefined}
                    drums={drums}
                  />
                ))}
              </ul>
            </div>
          </div>

          <div className="gb-rail">
            <div className="gb-tabs" role="group" aria-label="Show one window">
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="gb-tab"
                  data-w={n || undefined}
                  aria-pressed={win === n}
                  aria-label={n ? `Window ${n}, ${WINDOWS[n as WindowNo]}` : "All windows"}
                  onClick={() => onTab(n)}
                >
                  {n ? (
                    <>
                      <span className="gb-tab-n">{n}</span>
                      <span className="gb-tab-name">{TAB_NAMES[n as WindowNo]}</span>
                    </>
                  ) : (
                    "All"
                  )}
                </button>
              ))}
            </div>

            <p className="gb-note">Sample data, Stripe test mode.</p>

            <div className="gb-rail-end">
              {showControl && (
                <button type="button" className="gb-ctl" aria-label={control.label} onClick={onControl}>
                  {control.text}
                </button>
              )}
              <Clock />
            </div>
          </div>
        </div>

        <p className="gb-counter">
          You pay at the counter. The seller is paid when you approve the work.{" "}
          <a href={howHref}>How the counter works</a>
        </p>

        <p className="gb-sr" role="status">
          {status}
        </p>
      </section>
    </BoardContext.Provider>
  );
}
