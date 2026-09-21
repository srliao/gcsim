import { Button } from "@gcsim/primitives";
import { WhatsNew } from "@gcsim/ui/src/Pages/Dash/WhatsNew";
import { FaCalculator, FaDatabase } from "react-icons/fa";

/**
 * DB Home — a single opinionated Gauge layout: a compact hero with the primary
 * "Browse database" CTA and a "Run simulations" link, followed by the live
 * "What's new" release feed (shared with the main web). Replaces the live
 * page's stacked full-width text blocks.
 */

export function DbHome({
	onBrowse,
}: {
	onBrowse?: () => void;
	viewport: "desktop" | "mobile";
}) {
	return (
		<div className="mx-auto flex max-w-[1160px] flex-col gap-g-section p-g-page">
			<section className="flex flex-col gap-g-base-lg rounded-g-xl border border-g-line-soft bg-g-surface p-8">
				<span className="g-label text-g-xs text-g-accent">
					gcsim · community database
				</span>
				<h1 className="font-g-display text-g-h1 font-bold text-g-ink md:text-g-hero">
					Simpact
				</h1>
				<p className="max-w-xl text-g-lg text-g-ink-dim">
					A database of gcsim simulations submitted and maintained by the
					community — browse team builds, benchmarked and reproducible.
				</p>
				<div className="flex flex-wrap gap-g-base">
					<Button size="lg" onClick={onBrowse}>
						<FaDatabase size={14} /> Browse database
					</Button>
					<Button size="lg" variant="ghost" asChild>
						<a
							href="https://gcsim.app/simulator"
							target="_blank"
							rel="noreferrer"
						>
							<FaCalculator size={14} /> Run simulations
						</a>
					</Button>
				</div>
			</section>

			<section className="flex flex-col gap-g-base">
				<h2 className="font-g-display text-g-h2 font-semibold text-g-ink">
					What's new
				</h2>
				<WhatsNew />
			</section>
		</div>
	);
}
