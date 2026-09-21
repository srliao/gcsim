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
 * Taghelper Alt B — "Split compare".
 * Two panes on desktop: the submission under review is pinned on the left with
 * its decision actions, while the same-team sims scroll independently on the
 * right — matching the moderator's real task of comparing against duplicates.
 * Stacks to a single column on mobile.
 */
export function TagHelperAltB({
	entries,
	viewport,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const { main, duplicates } = useMemo(() => deriveReview(entries), [entries]);
	const split = viewport === "desktop";

	return (
		<div
			className={`mx-auto max-w-[1160px] gap-g-base-lg p-g-page ${split ? "flex" : "flex flex-col"}`}
		>
			<section
				className={
					split ? "sticky top-g-page w-[420px] shrink-0 self-start" : ""
				}
			>
				<div className="mb-g-base flex items-center justify-between">
					<h2 className="font-g-display text-g-h3 font-semibold text-g-ink">
						Under review
					</h2>
					<span className="font-g-mono text-g-xs text-g-ink-mute">
						id {main._id}
					</span>
				</div>
				<Card className="flex flex-col gap-g-base border-g-accent/40 p-g-card ring-1 ring-g-accent/20">
					<ReviewHeadline entry={main} viewport={viewport} />
					<div className="flex flex-wrap gap-g-base border-t border-g-line-soft pt-g-base [&>*]:flex-1">
						<DecisionButtons entry={main} />
					</div>
				</Card>
			</section>

			<section className="flex min-w-0 flex-1 flex-col gap-g-base-lg">
				<div className="flex items-center gap-g-base">
					<h2 className="font-g-display text-g-h3 font-semibold text-g-ink">
						Same team
					</h2>
					<span className="rounded-g-pill bg-g-surface-2 px-2 py-0.5 font-g-mono text-g-xs text-g-ink-dim">
						{duplicates.length}
					</span>
					<span className="text-g-sm text-g-ink-mute">
						— replace one with this submission
					</span>
				</div>
				{duplicates.length === 0 ? (
					<div className="rounded-g-md border border-dashed border-g-line py-10 text-center text-g-ink-mute">
						No existing sims share this team.
					</div>
				) : (
					duplicates.map((d) => (
						<DuplicateRow key={d._id} entry={d} main={main} />
					))
				)}
			</section>
		</div>
	);
}
