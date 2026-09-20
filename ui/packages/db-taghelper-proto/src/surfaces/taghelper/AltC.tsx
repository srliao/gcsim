import { Button, Card } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useMemo } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { author, created, dpsFull, simTime } from "../../lib/entry";
import {
	commands,
	DecisionButtons,
	DuplicateRow,
	deriveReview,
	MetaChips,
	MiniTeam,
	ReviewHeadline,
} from "./shared";

/**
 * Taghelper Alt C — "Decision toolbar + comparison table".
 * The submission under review pins its decision actions to a sticky bottom
 * toolbar, and duplicates are laid out as a scannable comparison table (with the
 * submission as the highlighted top row) for fast dedup calls. On mobile the
 * table degrades to stacked rows.
 */
export function TagHelperAltC({
	entries,
	viewport,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const { main, duplicates } = useMemo(() => deriveReview(entries), [entries]);

	return (
		<div className="mx-auto flex max-w-wide flex-col gap-g-section p-g-page pb-24">
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
				</Card>
			</section>

			<section className="flex flex-col gap-g-gap">
				<h2 className="font-g-display text-g-h3 font-semibold text-g-ink">
					Compare against same-team sims
				</h2>
				{viewport === "mobile" ? (
					<div className="flex flex-col gap-g-base">
						{duplicates.map((d) => (
							<DuplicateRow key={d._id} entry={d} main={main} />
						))}
					</div>
				) : (
					<div className="overflow-x-auto rounded-g-lg border border-g-line-soft">
						<table className="w-full border-collapse text-left">
							<thead>
								<tr className="border-b border-g-line-soft bg-g-surface-2 text-g-ink-mute">
									<Th>Team</Th>
									<Th className="text-right">DPS</Th>
									<Th className="text-right">Sim</Th>
									<Th>Date</Th>
									<Th>Author</Th>
									<Th />
								</tr>
							</thead>
							<tbody>
								<Row entry={main} highlight />
								{duplicates.map((d) => (
									<Row key={d._id} entry={d} main={main} />
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<div className="fixed inset-x-0 bottom-0 z-20 border-t border-g-line bg-g-canvas/95 backdrop-blur">
				<div className="mx-auto flex max-w-wide items-center gap-g-gap p-g-gap">
					<div className="hidden min-w-0 flex-1 sm:block">
						<MetaChips entry={main} />
					</div>
					<div className="flex flex-1 flex-wrap justify-end gap-g-base sm:flex-none">
						<DecisionButtons entry={main} />
					</div>
				</div>
			</div>
		</div>
	);
}

function Th({
	children,
	className = "",
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<th className={`g-label px-g-card py-2.5 text-g-xs font-bold ${className}`}>
			{children}
		</th>
	);
}

function Row({
	entry,
	main,
	highlight,
}: {
	entry: db.Entry;
	main?: db.Entry;
	highlight?: boolean;
}) {
	return (
		<tr
			className={`border-b border-g-line-soft last:border-0 ${
				highlight ? "bg-g-accent-weak/50" : "hover:bg-g-surface-2"
			}`}
		>
			<td className="px-g-card py-2">
				<div className="flex items-center gap-g-base">
					<MiniTeam entry={entry} />
					{highlight && (
						<span className="rounded-g-pill bg-g-accent px-2 py-0.5 text-g-xs text-g-accent-fg">
							this
						</span>
					)}
				</div>
			</td>
			<td className="px-g-card py-2 text-right font-g-mono text-g-sm text-g-ink">
				{dpsFull(entry)}
			</td>
			<td className="px-g-card py-2 text-right font-g-mono text-g-sm text-g-ink-dim">
				{simTime(entry)}
			</td>
			<td className="px-g-card py-2 font-g-mono text-g-xs text-g-ink-dim">
				{created(entry)}
			</td>
			<td className="max-w-[160px] truncate px-g-card py-2 text-g-sm text-g-ink-dim">
				{author(entry)}
			</td>
			<td className="px-g-card py-2 text-right">
				{main && (
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							commands.replace(entry._id ?? "", main.share_key ?? "")
						}
					>
						<FaExchangeAlt size={11} /> Replace
					</Button>
				)}
			</td>
		</tr>
	);
}
