import { Button, Input } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import {
	author,
	created,
	mode,
	simTime,
	targetCount,
} from "../../../lib/entry";
import { CardActions, DpsStat, StatChip, TagBadges, Team } from "./components";
import { FilterSheet, SortControl, useCharName } from "./FilterUI";
import { applyFilter, cycleTri, emptyFilter, type FilterState } from "./filter";

/**
 * Alt A — "Command bar + full cards".
 * A single sticky command bar (search, selected-character chips, filters, sort,
 * count) over a comfortable one-column list of full detail cards. Closest to the
 * live layout, cleaned onto Gauge; best for reading descriptions.
 */
export function DatabaseAltA({
	entries,
	viewport,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const [filter, setFilter] = useState<FilterState>(emptyFilter);
	const charName = useCharName();
	const list = useMemo(() => applyFilter(entries, filter), [entries, filter]);
	const selectedChars = [...filter.chars]
		.filter(([, v]) => v === "include")
		.map(([k]) => k);

	return (
		<div className="mx-auto flex max-w-[1160px] flex-col gap-g-base-lg p-g-page">
			<div className="sticky top-0 z-10 -mx-g-page flex flex-col gap-g-base border-b border-g-line-soft bg-g-canvas/90 px-g-page py-g-base backdrop-blur">
				<div className="flex flex-wrap items-center gap-g-base">
					<FilterSheet
						entries={entries}
						filter={filter}
						onChange={setFilter}
						onClear={() => setFilter(emptyFilter())}
					/>
					<div className="relative min-w-[180px] flex-1">
						<FaSearch
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-g-ink-mute"
							size={13}
						/>
						<Input
							className="pl-8"
							placeholder="Search teams, authors, notes…"
							value={filter.text}
							onChange={(e) => setFilter({ ...filter, text: e.target.value })}
						/>
					</div>
					<div className="hidden sm:block">
						<SortControl filter={filter} onChange={setFilter} />
					</div>
					<span className="ml-auto whitespace-nowrap font-g-mono text-g-sm text-g-ink-dim">
						{list.length} sims
					</span>
				</div>
				{selectedChars.length > 0 && (
					<div className="flex flex-wrap items-center gap-g-base-sm">
						{selectedChars.map((c) => (
							<button
								type="button"
								key={c}
								onClick={() =>
									setFilter({
										...filter,
										chars: cycleTri(cycleTri(filter.chars, c), c),
									})
								}
								className="inline-flex items-center gap-1.5 rounded-g-pill bg-g-accent-weak py-1 pl-1.5 pr-2 text-g-xs text-g-accent"
							>
								<img
									src={`/api/assets/avatar/${c}.png`}
									alt=""
									className="size-4"
								/>
								{charName(c)}
								<FaTimes size={9} />
							</button>
						))}
						<Button
							variant="ghost"
							size="xs"
							onClick={() => setFilter({ ...filter, chars: new Map() })}
						>
							Clear characters
						</Button>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-g-base-lg">
				{list.map((entry) => (
					<FullCard key={entry._id} entry={entry} viewport={viewport} />
				))}
				{list.length === 0 && <Empty />}
			</div>
		</div>
	);
}

function FullCard({
	entry,
	viewport,
}: {
	entry: db.Entry;
	viewport: "desktop" | "mobile";
}) {
	const row = viewport === "desktop";
	return (
		<div
			className={`flex flex-col gap-g-base rounded-g-lg border border-g-line-soft bg-g-surface p-g-card ${
				row ? "md:flex-row md:items-stretch" : ""
			}`}
		>
			<div className={`w-full shrink-0 ${row ? "md:w-[420px]" : ""}`}>
				<Team entry={entry} viewport={viewport} />
				<div className="mt-g-base flex flex-wrap gap-g-base-sm">
					<StatChip label="mode" value={mode(entry)} />
					<StatChip label="targets" value={String(targetCount(entry))} />
					<StatChip label="sim" value={simTime(entry)} />
					<StatChip label="date" value={created(entry)} />
				</div>
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-g-base">
				<div className="flex items-start justify-between gap-g-base">
					<TagBadges entry={entry} />
					<DpsStat entry={entry} size="num-sm" />
				</div>
				<p className="text-g-sm text-g-ink-dim">
					<span className="font-semibold text-g-accent">{author(entry)}: </span>
					{entry.description}
				</p>
				<div className="mt-auto flex justify-end pt-g-base-sm">
					<CardActions entry={entry} />
				</div>
			</div>
		</div>
	);
}

function Empty() {
	return (
		<div className="flex flex-col items-center gap-g-base py-16 text-center text-g-ink-mute">
			<span className="font-g-display text-g-h3 text-g-ink-dim">
				No matching sims
			</span>
			<span className="text-g-sm">
				Try clearing a filter or widening your search.
			</span>
		</div>
	);
}
