import { AvatarCard } from "@gcsim/components";
import { Badge, Button, toast } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import {
	FaCheck,
	FaExchangeAlt,
	FaExternalLinkAlt,
	FaTimes,
} from "react-icons/fa";
import {
	author,
	created,
	dpsFull,
	mode,
	simTime,
	tagNames,
	team,
	viewerLink,
} from "../../lib/entry";

/** Pick a submission-under-review and the existing sims sharing its whole team. */
export function deriveReview(entries: db.Entry[]): {
	main: db.Entry;
	duplicates: db.Entry[];
} {
	const main =
		entries.find((e) => (e.summary?.char_names?.length ?? 0) === 4) ??
		entries[0];
	const key = [...(main.summary?.char_names ?? [])].sort().join("|");
	const duplicates = entries.filter(
		(e) =>
			e._id !== main._id &&
			[...(e.summary?.char_names ?? [])].sort().join("|") === key,
	);
	// Fall back to "shares 2+ characters" so the demo always has comparisons.
	if (duplicates.length === 0) {
		const set = new Set(main.summary?.char_names ?? []);
		return {
			main,
			duplicates: entries
				.filter(
					(e) =>
						e._id !== main._id &&
						(e.summary?.char_names ?? []).filter((c) => set.has(c)).length >= 2,
				)
				.slice(0, 6),
		};
	}
	return { main, duplicates };
}

function copy(cmd: string, label: string) {
	navigator.clipboard
		.writeText(cmd)
		.then(() => toast(label, { description: cmd }));
}

export const commands = {
	approve: (id: string) => copy(`/approve id:${id}`, "Copied approve command"),
	reject: (id: string) => copy(`/reject id:${id}`, "Copied reject command"),
	replace: (dupId: string, shareKey: string) =>
		copy(
			`/replace id:${dupId} link:https://gcsim.app/sh/${shareKey}`,
			"Copied replace command",
		),
};

export function ViewerLink({ entry }: { entry: db.Entry }) {
	return (
		<Button size="sm" variant="secondary" asChild>
			<a href={viewerLink(entry)} target="_blank" rel="noreferrer">
				<FaExternalLinkAlt size={11} /> Result viewer
			</a>
		</Button>
	);
}

/** The three moderator decisions for the submission under review. */
export function DecisionButtons({
	entry,
	size = "default",
}: {
	entry: db.Entry;
	size?: "default" | "sm" | "lg";
}) {
	const id = entry._id ?? "";
	return (
		<>
			<Button
				size={size}
				variant="destructive"
				onClick={() => commands.reject(id)}
			>
				<FaTimes size={12} /> Copy reject
			</Button>
			<Button
				size={size}
				className="bg-g-success text-g-accent-fg hover:bg-g-success/90"
				onClick={() => commands.approve(id)}
			>
				<FaCheck size={12} /> Copy approve
			</Button>
			<ViewerLink entry={entry} />
		</>
	);
}

export function MetaChips({ entry }: { entry: db.Entry }) {
	return (
		<div className="flex flex-wrap gap-g-base-sm font-g-mono text-g-xs text-g-ink-dim">
			<Badge className="bg-g-surface-2">mode {mode(entry)}</Badge>
			<Badge className="bg-g-surface-2">{simTime(entry)}</Badge>
			<Badge className="bg-g-surface-2">{created(entry)}</Badge>
			{tagNames(entry).map((t) => (
				<Badge key={t} className="bg-g-success/15 text-g-success">
					{t}
				</Badge>
			))}
		</div>
	);
}

/** Small non-interactive portrait strip for compact duplicate rows/tables. */
export function MiniTeam({ entry }: { entry: db.Entry }) {
	return (
		<div className="flex -space-x-1">
			{team(entry).map((c, i) => (
				<img
					key={c?.name ?? i}
					src={
						c
							? `/api/assets/avatar/${c.name}.png`
							: "/api/assets/misc/default.png"
					}
					alt=""
					className="size-8 rounded-g-sm border border-g-line-soft bg-g-surface-2 object-cover"
				/>
			))}
		</div>
	);
}

/** A duplicate/existing sim with a Replace action. */
export function DuplicateRow({
	entry,
	main,
}: {
	entry: db.Entry;
	main: db.Entry;
}) {
	return (
		<div className="flex flex-col gap-g-base rounded-g-md border border-g-line-soft bg-g-surface-2 p-g-card sm:flex-row sm:items-center">
			<MiniTeam entry={entry} />
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-g-base">
					<span className="font-g-mono text-g-sm font-semibold text-g-ink">
						{dpsFull(entry)}
					</span>
					<span className="text-g-xs text-g-ink-mute">
						DPS · {simTime(entry)}
					</span>
				</div>
				<p className="line-clamp-1 text-g-xs text-g-ink-dim">
					by {author(entry)} · {entry.description}
				</p>
			</div>
			<div className="flex shrink-0 gap-g-base-sm">
				<Button
					size="sm"
					variant="outline"
					onClick={() =>
						commands.replace(entry._id ?? "", main.share_key ?? "")
					}
				>
					<FaExchangeAlt size={11} /> Replace
				</Button>
				<ViewerLink entry={entry} />
			</div>
		</div>
	);
}

export function ReviewHeadline({
	entry,
	viewport = "desktop",
}: {
	entry: db.Entry;
	viewport?: "desktop" | "mobile";
}) {
	return (
		<div className="flex flex-col gap-g-base-sm">
			{viewport === "mobile" ? (
				<div className="grid grid-cols-2 gap-1">
					{team(entry).map((c, i) => (
						<img
							key={c?.name ?? i}
							src={
								c
									? `/api/assets/avatar/${c.name}.png`
									: "/api/assets/misc/default.png"
							}
							alt=""
							className="aspect-square w-full rounded-g-sm border border-g-line-soft bg-g-surface-2 object-cover"
						/>
					))}
				</div>
			) : (
				<div className="w-full max-w-[420px]">
					<AvatarCard chars={team(entry)} className="w-full" />
				</div>
			)}
			<MetaChips entry={entry} />
			<p className="text-g-sm text-g-ink-dim">
				<span className="font-semibold text-g-accent">{author(entry)}: </span>
				{entry.description}
			</p>
		</div>
	);
}
