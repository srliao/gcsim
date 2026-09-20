import tagData from "@gcsim/data/src/tags.json";
import type { db } from "@gcsim/types";

const TAGS = tagData as Record<string, { display_name: string }>;

export type SortKey = "dps" | "date" | "duration";
export type SortDir = "asc" | "desc";
export type Tri = "include" | "exclude";

export type FilterState = {
	text: string;
	/** char name -> include/exclude; absent = neutral */
	chars: Map<string, Tri>;
	/** tag id -> include/exclude; absent = neutral */
	tags: Map<number, Tri>;
	sortKey: SortKey;
	sortDir: SortDir;
};

export const emptyFilter = (): FilterState => ({
	text: "",
	chars: new Map(),
	tags: new Map(),
	sortKey: "date",
	sortDir: "desc",
});

/** Cycle neutral -> include -> exclude -> neutral for a key in a tri-state map. */
export function cycleTri<K>(map: Map<K, Tri>, key: K): Map<K, Tri> {
	const next = new Map(map);
	const cur = next.get(key);
	if (cur === undefined) next.set(key, "include");
	else if (cur === "include") next.set(key, "exclude");
	else next.delete(key);
	return next;
}

export function activeCount(f: FilterState): number {
	return f.chars.size + f.tags.size + (f.text.trim() ? 1 : 0);
}

export const SORTS: { key: SortKey; label: string }[] = [
	{ key: "date", label: "Date" },
	{ key: "dps", label: "DPS" },
	{ key: "duration", label: "Sim time" },
];

/** Character options that actually appear in the current entry set. */
export function charOptions(entries: db.Entry[]): string[] {
	const s = new Set<string>();
	for (const e of entries)
		for (const c of e.summary?.char_names ?? []) s.add(c);
	return [...s].sort();
}

/** Tag options (ids) present in the set, excluding the implicit gcsim tag. */
export function tagOptions(
	entries: db.Entry[],
): { id: number; label: string }[] {
	const s = new Set<number>();
	for (const e of entries)
		for (const t of e.accepted_tags ?? []) if (t !== 1) s.add(t);
	return [...s]
		.map((id) => ({ id, label: TAGS[String(id)]?.display_name ?? `tag ${id}` }))
		.sort((a, b) => a.label.localeCompare(b.label));
}

export function applyFilter(entries: db.Entry[], f: FilterState): db.Entry[] {
	const incChars = [...f.chars]
		.filter(([, v]) => v === "include")
		.map(([k]) => k);
	const excChars = [...f.chars]
		.filter(([, v]) => v === "exclude")
		.map(([k]) => k);
	const incTags = [...f.tags]
		.filter(([, v]) => v === "include")
		.map(([k]) => k);
	const excTags = [...f.tags]
		.filter(([, v]) => v === "exclude")
		.map(([k]) => k);

	let out = entries.filter((e) => {
		const names = e.summary?.char_names ?? [];
		const etags = e.accepted_tags ?? [];
		if (incChars.length && !incChars.every((c) => names.includes(c)))
			return false;
		if (excChars.some((c) => names.includes(c))) return false;
		if (incTags.length && !incTags.some((t) => etags.includes(t))) return false;
		if (excTags.some((t) => etags.includes(t))) return false;
		if (f.text.trim()) {
			const q = f.text.toLowerCase();
			const hay =
				`${e.description ?? ""} ${names.join(" ")} ${e.submitter ?? ""}`.toLowerCase();
			if (!hay.includes(q)) return false;
		}
		return true;
	});

	const val = (e: db.Entry): number => {
		if (f.sortKey === "dps") return e.summary?.mean_dps_per_target ?? 0;
		if (f.sortKey === "duration") return e.summary?.sim_duration?.mean ?? 0;
		return Number(e.create_date ?? 0);
	};
	out = [...out].sort((a, b) =>
		f.sortDir === "asc" ? val(a) - val(b) : val(b) - val(a),
	);
	return out;
}
