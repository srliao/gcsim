import { Button, Card } from "@gcsim/primitives";
import { FaArrowRight, FaBook, FaDatabase } from "react-icons/fa";

/**
 * DB Home — a single opinionated Gauge layout: a compact hero with the primary
 * "Browse database" CTA, the what-is-this note, the collection (tag) legend as
 * cards, and a latest-release highlight. Replaces the live page's stacked
 * full-width text blocks.
 */

const COLLECTIONS: { name: string; desc: string; accent?: boolean }[] = [
	{
		name: "(Not tagged)",
		desc: "Hundreds of example sims to search for a team and build from. No standardization required; optimization varies widely.",
		accent: true,
	},
	{
		name: "Itto Simps",
		desc: "Sims of Itto doing Itto things. Maintained by Tris.",
	},
	{
		name: "Action Execution Delays",
		desc: "Sims modelling delays and swap-delay variance — what happens when execution isn't frame-perfect.",
	},
	{
		name: "Arfoire for Newbies",
		desc: "Arfoire's collection of sims aimed at new players.",
	},
	{
		name: "APL",
		desc: "Sims written as a priority list instead of a fixed action loop.",
	},
	{ name: "Guides", desc: "Sims used by guide writers for KQM and others." },
];

const RELEASE = {
	version: "v2.47.3",
	date: "9/18/2026",
	notes: [
		{ sign: "+", text: "Added support for the latest 5.x banner units" },
		{ sign: "+", text: "New characters wired into the damage model" },
		{ sign: "~", text: "Faster Teams DB deployment pipeline" },
	],
};

export function DbHome({
	onBrowse,
}: {
	onBrowse?: () => void;
	viewport: "desktop" | "mobile";
}) {
	return (
		<div className="mx-auto flex max-w-wide flex-col gap-g-section p-g-page">
			<section className="flex flex-col gap-g-gap-lg rounded-g-xl border border-g-line-soft bg-g-surface p-8">
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
				<div className="flex flex-wrap gap-g-gap">
					<Button size="lg" onClick={onBrowse}>
						<FaDatabase size={14} /> Browse database
					</Button>
					<Button size="lg" variant="ghost">
						<FaBook size={14} /> Read the docs
					</Button>
				</div>
			</section>

			<section className="flex flex-col gap-g-gap">
				<div>
					<h2 className="font-g-display text-g-h2 font-semibold text-g-ink">
						Collections
					</h2>
					<p className="text-g-sm text-g-ink-dim">
						Each tag is a collection of sims maintained by volunteers, with its
						own rules.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-g-gap sm:grid-cols-2 xl:grid-cols-3">
					{COLLECTIONS.map((c) => (
						<Card
							key={c.name}
							className={`flex flex-col gap-g-base-sm p-g-card ${
								c.accent ? "border-g-accent/40" : ""
							}`}
						>
							<span
								className={`font-g-display font-semibold ${
									c.accent ? "text-g-accent" : "text-g-ink"
								}`}
							>
								{c.name}
							</span>
							<span className="text-g-sm text-g-ink-dim">{c.desc}</span>
						</Card>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-g-gap">
				<h2 className="font-g-display text-g-h2 font-semibold text-g-ink">
					What's new
				</h2>
				<Card className="flex flex-col gap-g-gap p-g-card">
					<div className="flex items-center gap-g-base">
						<span className="rounded-g-pill bg-g-accent-weak px-2.5 py-1 font-g-mono text-g-xs text-g-accent">
							{RELEASE.version}
						</span>
						<span className="text-g-sm text-g-ink-mute">
							latest release · {RELEASE.date}
						</span>
					</div>
					<div className="flex flex-col gap-g-base-sm">
						{RELEASE.notes.map((n) => (
							<div
								key={n.text}
								className="flex gap-g-base text-g-sm text-g-ink-dim"
							>
								<span
									className={
										n.sign === "+" ? "text-g-success" : "text-g-accent"
									}
								>
									{n.sign}
								</span>
								{n.text}
							</div>
						))}
					</div>
					<a
						href="https://gcsim.app"
						className="inline-flex items-center gap-1.5 text-g-sm font-semibold text-g-accent hover:underline"
					>
						Full changelog <FaArrowRight size={11} />
					</a>
				</Card>
			</section>
		</div>
	);
}
