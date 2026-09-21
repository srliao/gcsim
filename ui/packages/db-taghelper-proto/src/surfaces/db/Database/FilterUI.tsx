import { dynamicKey } from "@gcsim/localization";
import {
	Badge,
	Button,
	Input,
	Separator,
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	FaArrowDown,
	FaArrowUp,
	FaBan,
	FaCheck,
	FaFilter,
	FaSearch,
} from "react-icons/fa";
import {
	activeCount,
	charOptions,
	cycleTri,
	type FilterState,
	SORTS,
	type SortKey,
	tagOptions,
} from "./filter";

export function useCharName() {
	const { t } = useTranslation();
	return (name: string) =>
		t(dynamicKey(`game:character_names.${name}`)) as string;
}

const AVATAR = (name: string) => `/api/assets/avatar/${name}.png`;

function TriRing({ state }: { state?: "include" | "exclude" }) {
	if (!state) return null;
	const cls =
		state === "include"
			? "bg-g-success text-g-accent-fg"
			: "bg-g-danger text-white";
	return (
		<span
			className={`absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full ${cls}`}
		>
			{state === "include" ? <FaCheck size={8} /> : <FaBan size={8} />}
		</span>
	);
}

/** Search + tri-state avatar grid. */
export function CharacterPicker({
	entries,
	filter,
	onChange,
}: {
	entries: db.Entry[];
	filter: FilterState;
	onChange: (f: FilterState) => void;
}) {
	const charName = useCharName();
	const [q, setQ] = useState("");
	const opts = charOptions(entries).filter((c) =>
		charName(c).toLowerCase().includes(q.toLowerCase()),
	);
	return (
		<div className="flex flex-col gap-g-base">
			<div className="relative">
				<FaSearch
					className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-g-ink-mute"
					size={13}
				/>
				<Input
					className="pl-8"
					placeholder="Search characters…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
			</div>
			<div className="grid grid-cols-4 gap-g-base-sm">
				{opts.map((name) => {
					const state = filter.chars.get(name);
					return (
						<button
							type="button"
							key={name}
							title={charName(name)}
							onClick={() =>
								onChange({ ...filter, chars: cycleTri(filter.chars, name) })
							}
							className={`relative flex flex-col items-center rounded-g-md border p-1 transition-colors ${
								state
									? "border-g-accent bg-g-accent-weak"
									: "border-g-line-soft bg-g-surface-2 hover:border-g-line"
							}`}
						>
							<img
								src={AVATAR(name)}
								alt=""
								className="h-12 w-12 object-contain"
							/>
							<span className="w-full truncate text-center text-g-xs text-g-ink-dim">
								{charName(name)}
							</span>
							<TriRing state={state} />
						</button>
					);
				})}
			</div>
		</div>
	);
}

/** Tri-state tag pills. */
export function TagPicker({
	entries,
	filter,
	onChange,
}: {
	entries: db.Entry[];
	filter: FilterState;
	onChange: (f: FilterState) => void;
}) {
	const opts = tagOptions(entries);
	return (
		<div className="flex flex-wrap gap-g-base-sm">
			{opts.map(({ id, label }) => {
				const state = filter.tags.get(id);
				const cls = !state
					? "border-g-line-soft bg-g-surface-2 text-g-ink-dim hover:border-g-line"
					: state === "include"
						? "border-transparent bg-g-success/20 text-g-success"
						: "border-transparent bg-g-danger/20 text-g-danger";
				return (
					<button
						type="button"
						key={id}
						onClick={() =>
							onChange({ ...filter, tags: cycleTri(filter.tags, id) })
						}
						className={`inline-flex items-center gap-1 rounded-g-pill border px-2.5 py-1 text-g-xs font-medium transition-colors ${cls}`}
					>
						{state === "include" && <FaCheck size={9} />}
						{state === "exclude" && <FaBan size={9} />}
						{label}
					</button>
				);
			})}
		</div>
	);
}

export function SortControl({
	filter,
	onChange,
}: {
	filter: FilterState;
	onChange: (f: FilterState) => void;
}) {
	const set = (key: SortKey) =>
		onChange(
			filter.sortKey === key
				? { ...filter, sortDir: filter.sortDir === "asc" ? "desc" : "asc" }
				: { ...filter, sortKey: key, sortDir: "desc" },
		);
	return (
		<div className="flex gap-g-base-sm">
			{SORTS.map(({ key, label }) => {
				const active = filter.sortKey === key;
				return (
					<Button
						key={key}
						size="sm"
						variant={active ? "default" : "secondary"}
						onClick={() => set(key)}
					>
						{label}
						{active &&
							(filter.sortDir === "asc" ? (
								<FaArrowUp size={10} />
							) : (
								<FaArrowDown size={10} />
							))}
					</Button>
				);
			})}
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-g-base-sm">
			<div className="g-label text-g-xs text-g-ink-mute">{title}</div>
			{children}
		</div>
	);
}

/** Full filter body, shared by the desktop rail and the mobile sheet. */
export function FilterBody(props: {
	entries: db.Entry[];
	filter: FilterState;
	onChange: (f: FilterState) => void;
	onClear: () => void;
}) {
	return (
		<div className="flex flex-col gap-g-section">
			<Section title="Sort by">
				<SortControl filter={props.filter} onChange={props.onChange} />
			</Section>
			<Section title="Tags">
				<TagPicker
					entries={props.entries}
					filter={props.filter}
					onChange={props.onChange}
				/>
			</Section>
			<Section title="Characters">
				<CharacterPicker
					entries={props.entries}
					filter={props.filter}
					onChange={props.onChange}
				/>
			</Section>
		</div>
	);
}

/** Persistent left rail (desktop, alt B). */
export function FilterRail(props: {
	entries: db.Entry[];
	filter: FilterState;
	onChange: (f: FilterState) => void;
	onClear: () => void;
}) {
	return (
		<aside className="flex w-72 shrink-0 flex-col gap-g-base-lg rounded-g-lg border border-g-line-soft bg-g-surface p-g-card">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-g-base-sm text-g-ink">
					<FaFilter size={13} className="text-g-accent" />
					<span className="font-g-display font-semibold">Filters</span>
					{activeCount(props.filter) > 0 && (
						<Badge className="bg-g-accent-weak text-g-accent">
							{activeCount(props.filter)}
						</Badge>
					)}
				</div>
				<Button variant="ghost" size="sm" onClick={props.onClear}>
					Clear
				</Button>
			</div>
			<Separator />
			<FilterBody {...props} />
		</aside>
	);
}

/** Filter as a sheet, triggered by a button (mobile, alt A/C). */
export function FilterSheet(props: {
	entries: db.Entry[];
	filter: FilterState;
	onChange: (f: FilterState) => void;
	onClear: () => void;
}) {
	const [open, setOpen] = useState(false);
	const n = activeCount(props.filter);
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" className="gap-g-base-sm">
					<FaFilter size={13} />
					Filters
					{n > 0 && (
						<Badge className="bg-g-accent-weak text-g-accent">{n}</Badge>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[min(92vw,360px)] overflow-y-auto">
				<SheetHeader>
					<div className="flex items-center justify-between pr-6">
						<SheetTitle>Filters</SheetTitle>
						<Button variant="ghost" size="sm" onClick={props.onClear}>
							Clear
						</Button>
					</div>
				</SheetHeader>
				<div className="p-4 pt-0">
					<FilterBody {...props} />
				</div>
			</SheetContent>
		</Sheet>
	);
}
