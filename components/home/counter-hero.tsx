import Link from "next/link";

const TRY = [
  { label: "Logo", q: "logo" },
  { label: "Landing page", q: "landing page" },
  { label: "Bug fix", q: "bug fix" },
  { label: "Translation", q: "translation" },
  { label: "Video edit", q: "video edit" },
];

type Props = {
  gigCount?: number;
  sellerCount?: number;
};

export function CounterHero({ gigCount = 24, sellerCount = 8 }: Props) {
  return (
    <section className="ch" aria-labelledby="ch-title">
      {/* Fascia: enamel sign, brass number plate, lamp */}
      <div className="ch-fascia">
        <div className="ch-sign">
          <i className="ch-screw ch-screw--l" aria-hidden="true" />
          <span className="ch-sign-kicker">Gigboard · pass-through counter</span>
          <span className="ch-sign-line">
            One freelancer. One fixed price. Paid when you say so.
          </span>
          <i className="ch-screw ch-screw--r" aria-hidden="true" />
        </div>

        <div className="ch-numplate" aria-hidden="true">
          <small>No.</small>01
        </div>

        <div className="ch-lamp" aria-hidden="true">
          <span className="ch-lamp-lens">
            <span className="ch-lamp-lit" />
          </span>
          <span className="ch-lamp-text">
            Next window
            <br />
            please
          </span>
        </div>
      </div>

      {/* Window: pane, drawer run, sill */}
      <div className="ch-window">
        <i className="ch-post ch-post--l" aria-hidden="true" />
        <i className="ch-post ch-post--r" aria-hidden="true" />

        <div className="ch-pane">
          <h1 id="ch-title" className="ch-h1">
            <span className="ch-h1-held">Held</span>{" "}
            <span className="ch-h1-rest">
              <span className="ch-h1-line">until you say</span>{" "}
              <span className="ch-h1-line">it&apos;s good.</span>
            </span>
          </h1>

          <p className="ch-note">Sample data, Stripe test mode.</p>
          <i className="ch-grille" aria-hidden="true" />
        </div>

        <div className="ch-track">
          <div className="ch-run">
            <i className="ch-hatch" aria-hidden="true" />
            <div className="ch-drawer" aria-hidden="true">
              <div className="ch-envelope">
                <span className="ch-stamp ch-stamp-held">Held</span>
                <span className="ch-stamp ch-stamp-delivered">Delivered</span>
                <span className="ch-stamp ch-stamp-approved">Approved</span>
              </div>
              <div className="ch-drawer-box">
                <i className="ch-pull" />
              </div>
            </div>
          </div>

          <ol className="ch-sill" aria-label="Where your payment is">
            <li className="ch-station ch-station--1">
              <b>Held</b>
              <span className="ch-station-sub">you</span>
            </li>
            <li className="ch-station ch-station--2">
              <b>Delivered</b>
              <span className="ch-station-sub">under the glass</span>
            </li>
            <li className="ch-station ch-station--3">
              <b>Approved</b>
              <span className="ch-station-sub">seller</span>
            </li>
          </ol>

          <p className="sr-only">
            Your payment goes into the drawer and is held. It sits under the glass where you and
            the seller can both see it. When the work is delivered you check it against the brief,
            and only when you approve does the drawer slide across to the seller.
          </p>
        </div>
      </div>

      {/* Counter top, customer side: search tray, chips, buttons */}
      <div className="ch-counter">
        <form className="ch-tray" action="/search" method="get" role="search">
          <label htmlFor="ch-q" className="sr-only">
            What service are you looking for?
          </label>
          <input
            id="ch-q"
            name="q"
            type="search"
            className="ch-input"
            placeholder="What service are you looking for?"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" className="ch-go">
            Go
          </button>
        </form>

        <nav className="ch-chips" aria-label="Popular searches">
          <span className="ch-chips-label">Try</span>
          {TRY.map((t) => (
            <Link key={t.q} href={`/search?q=${encodeURIComponent(t.q)}`} className="ch-chip">
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ch-actions">
          <Link href="/search" className="ch-btn-brass">
            Find a freelancer
          </Link>
          <Link href="/how-it-works" className="ch-btn-ghost">
            See how the counter works <span aria-hidden="true">→</span>
          </Link>
          <p className="ch-count">
            {gigCount} gigs on the board, {sellerCount} sellers
          </p>
        </div>
      </div>
    </section>
  );
}
