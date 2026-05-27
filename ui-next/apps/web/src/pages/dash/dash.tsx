import { Link } from "@tanstack/react-router";

const cardBase =
  "group relative flex min-h-[180px] flex-col gap-3 overflow-hidden rounded-xl border p-[22px] no-underline transition-[border-color,background,transform] duration-150 ease-out";

const cardNeutral =
  "border-[var(--line-2)] bg-[var(--bg-1)] hover:border-[var(--line-3)] hover:bg-[oklch(0.21_0.012_250)]";

const cardPrimary =
  "border-[var(--accent-line)] bg-[var(--bg-1)] bg-[radial-gradient(120%_100%_at_100%_0%,var(--accent-soft),transparent_60%),var(--bg-1)] hover:border-[var(--accent)]";

const hoverOverlay =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_100%_0%,var(--accent-soft),transparent_60%)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-70";

const ctaRow =
  "mt-auto inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] transition-[gap] duration-150 ease-out group-hover:gap-3";

export function Dash() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pt-20 pb-24">
      <section className="flex flex-col items-center gap-[14px] text-center">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 translate-y-2 rounded-full bg-[radial-gradient(closest-side,var(--accent-glow),transparent_70%)] blur-xl"
          />
          <img
            src="/assets/gcsim-logo.png"
            alt="gcsim mascot"
            className="h-16 w-16 object-contain drop-shadow-[0_14px_32px_var(--accent-glow)]"
          />
        </div>
        <h1 className="text-[40px] font-semibold tracking-tight text-[var(--fg-0)]">gcsim</h1>
        <p className="max-w-lg text-lg leading-relaxed text-[var(--fg-1)]">
          Genshin Impact team damage simulation and optimization tool
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/simulator" data-variant="primary" className={`${cardBase} ${cardPrimary}`}>
          <span aria-hidden className={hoverOverlay} />
          <div className="relative flex items-start justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--fg-0)]">Simulator</h3>
          </div>
          <p className="relative flex-1 text-sm leading-[1.55] text-[var(--fg-1)]">
            Build and run team damage simulations with the gcsl config language
          </p>
          <div className={`relative ${ctaRow}`}>
            <span>Open simulator</span>
            <span aria-hidden>&rarr;</span>
          </div>
        </Link>

        <a
          href="https://db.gcsim.app"
          target="_blank"
          rel="noopener noreferrer"
          data-variant="external"
          data-external="true"
          className={`${cardBase} ${cardNeutral}`}
        >
          <span aria-hidden className={hoverOverlay} />
          <div className="relative flex items-start justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--fg-0)]">Teams DB</h3>
            <span aria-hidden className="text-sm text-[var(--fg-2)]">
              &#x2197;
            </span>
          </div>
          <p className="relative flex-1 text-sm leading-[1.55] text-[var(--fg-1)]">
            Browse community-submitted team configurations and results
          </p>
          <div className={`relative ${ctaRow}`}>
            <span>Visit database</span>
            <span aria-hidden>&rarr;</span>
          </div>
        </a>

        <a
          href="https://docs.gcsim.app"
          target="_blank"
          rel="noopener noreferrer"
          data-variant="external"
          data-external="true"
          className={`${cardBase} ${cardNeutral}`}
        >
          <span aria-hidden className={hoverOverlay} />
          <div className="relative flex items-start justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--fg-0)]">
              Documentation
            </h3>
            <span aria-hidden className="text-sm text-[var(--fg-2)]">
              &#x2197;
            </span>
          </div>
          <p className="relative flex-1 text-sm leading-[1.55] text-[var(--fg-1)]">
            Learn the gcsl language, explore character and weapon data
          </p>
          <div className={`relative ${ctaRow}`}>
            <span>Read docs</span>
            <span aria-hidden>&rarr;</span>
          </div>
        </a>
      </section>
    </div>
  );
}
