import { Input } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { TeamCard } from "./components";
import { FilterRail, FilterSheet, SortControl } from "./FilterUI";
import { applyFilter, emptyFilter, type FilterState } from "./filter";

/**
 * Alt B — "Rail + grid".
 * A persistent filter rail on desktop (collapses to a sheet on mobile) beside a
 * responsive card grid. Highest scan density; best for browsing many teams and
 * comparing builds at a glance.
 */
export function DatabaseAltB({
	entries,
	viewport,
}: {
	entries: db.Entry[];
	viewport: "desktop" | "mobile";
}) {
	const [filter, setFilter] = useState<FilterState>(emptyFilter);
	const list = useMemo(() => applyFilter(entries, filter), [entries, filter]);
	const railVisible = viewport === "desktop";

	return (
		<div className="mx-auto flex max-w-[1160px] gap-g-base-lg p-g-page">
			{railVisible && (
				<FilterRail
					entries={entries}
					filter={filter}
					onChange={setFilter}
					onClear={() => setFilter(emptyFilter())}
				/>
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-g-base">
				<div className="flex flex-wrap items-center gap-g-base">
					{!railVisible && (
						<FilterSheet
							entries={entries}
							filter={filter}
							onChange={setFilter}
							onClear={() => setFilter(emptyFilter())}
						/>
					)}
					<div className="relative min-w-[160px] flex-1">
						<FaSearch
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-g-ink-mute"
							size={13}
						/>
						<Input
							className="pl-8"
							placeholder="Search…"
							value={filter.text}
							onChange={(e) => setFilter({ ...filter, text: e.target.value })}
						/>
					</div>
					{!railVisible && <SortControl filter={filter} onChange={setFilter} />}
					<span className="ml-auto whitespace-nowrap font-g-mono text-g-sm text-g-ink-dim">
						{list.length} sims
					</span>
				</div>
				<div
					className={
						railVisible
							? "grid grid-cols-1 gap-g-base-lg xl:grid-cols-2"
							: "grid grid-cols-1 gap-g-base-lg xs:grid-cols-2"
					}
				>
					{list.map((entry) => (
						<TeamCard key={entry._id} entry={entry} viewport={viewport} />
					))}
				</div>
				{list.length === 0 && (
					<div className="py-16 text-center text-g-ink-mute">
						No matching sims.
					</div>
				)}
			</div>
		</div>
	);
}
