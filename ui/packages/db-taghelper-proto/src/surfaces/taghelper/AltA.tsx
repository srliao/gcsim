import { Card } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useMemo } from "react";
import {
	DecisionButtons,
	DuplicateRow,
	deriveReview,
	ReviewHeadline,
} from "./shared";

/**
 * Taghelper Alt A — "Stacked review".
 * The submission under review sits in a highlighted card with its decision
 * actions, then the same-team existing sims follow as compact rows. A clean,
 * linear version of the live tool.
 */
export function TagHelperAltA({
	entries,
	viewport,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const { main, duplicates } = useMemo(() => deriveReview(entries), [entries]);
	return (
		<div className="mx-auto flex max-w-4xl flex-col gap-g-section p-g-page">
			<section className="flex flex-col gap-g-gap">
				<div className="flex items-center justify-between">
					<h2 className="font-g-display text-g-h3 font-semibold text-g-ink">
						Under review
					</h2>
					<span className="font-g-mono text-g-xs text-g-ink-mute">
						id {main._id}
					</span>
				</div>
				<Card className="flex flex-col gap-g-gap border-g-accent/40 p-g-card ring-1 ring-g-accent/20">
					<ReviewHeadline entry={main} viewport={viewport} />
					<div className="flex flex-wrap justify-end gap-g-base border-t border-g-line-soft pt-g-gap">
						<DecisionButtons entry={main} />
					</div>
				</Card>
			</section>

			<section className="flex flex-col gap-g-gap">
				<div className="flex items-center gap-g-base">
					<h2 className="font-g-display text-g-h3 font-semibold text-g-ink">
						Existing sims with the same team
					</h2>
					<span className="rounded-g-pill bg-g-surface-2 px-2 py-0.5 font-g-mono text-g-xs text-g-ink-dim">
						{duplicates.length}
					</span>
				</div>
				{duplicates.length === 0 ? (
					<div className="rounded-g-md border border-dashed border-g-line py-10 text-center text-g-ink-mute">
						No existing sims share this team.
					</div>
				) : (
					<div className="flex flex-col gap-g-base">
						{duplicates.map((d) => (
							<DuplicateRow key={d._id} entry={d} main={main} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
