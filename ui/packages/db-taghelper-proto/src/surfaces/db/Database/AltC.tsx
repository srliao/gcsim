import { Input } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useMemo, useState } from "react";
import { FaCheck, FaSearch } from "react-icons/fa";
import { TeamRow } from "./components";
import { FilterSheet, SortControl } from "./FilterUI";
import {
	applyFilter,
	cycleTri,
	emptyFilter,
	type FilterState,
	tagOptions,
} from "./filter";

/**
 * Alt C — "Dense rows".
 * Horizontal rows (portraits · stats · notes · actions) with a quick tag-chip
 * bar and sortable controls up top. Built for power users triaging a long list;
 * rows collapse to stacked cards on mobile.
 */
export function DatabaseAltC({
	entries,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const [filter, setFilter] = useState<FilterState>(emptyFilter);
	const list = useMemo(() => applyFilter(entries, filter), [entries, filter]);
	const tags = tagOptions(entries);

	return (
		<div className="mx-auto flex max-w-wide flex-col gap-g-base-lg p-g-page">
			<div className="flex flex-col gap-g-base">
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
					<SortControl filter={filter} onChange={setFilter} />
					<span className="ml-auto whitespace-nowrap font-g-mono text-g-sm text-g-ink-dim">
						{list.length} sims
					</span>
				</div>
				{tags.length > 0 && (
					<div className="flex flex-wrap items-center gap-g-base-sm">
						<span className="g-label text-g-xs text-g-ink-mute">
							quick tags
						</span>
						{tags.map(({ id, label }) => {
							const on = filter.tags.get(id) === "include";
							return (
								<button
									type="button"
									key={id}
									onClick={() =>
										setFilter({ ...filter, tags: cycleTri(filter.tags, id) })
									}
									className={`inline-flex items-center gap-1 rounded-g-pill border px-2.5 py-1 text-g-xs font-medium transition-colors ${
										on
											? "border-transparent bg-g-accent text-g-accent-fg"
											: "border-g-line-soft bg-g-surface-2 text-g-ink-dim hover:border-g-line"
									}`}
								>
									{on && <FaCheck size={9} />}
									{label}
								</button>
							);
						})}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-g-base-lg">
				{list.map((entry) => (
					<TeamRow key={entry._id} entry={entry} />
				))}
				{list.length === 0 && (
					<div className="py-16 text-center text-g-ink-mute">
						No matching sims.
					</div>
				)}
			</div>
		</div>
	);
}
