import { AvatarCard } from "@gcsim/components";
import { Badge, Button, Card, toast } from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import {
	author,
	created,
	dps,
	dpsFull,
	mode,
	simTime,
	tagNames,
	targetCount,
	team,
	viewerLink,
} from "../../../lib/entry";

export function copyConfig(entry: db.Entry) {
	const cfg = entry.config ?? "";
	navigator.clipboard.writeText(cfg).then(() =>
		toast("Copied config", {
			description: `${cfg.length} characters copied to clipboard`,
		}),
	);
}

/** mono title/value chip, mirrors components/CardBadge but self-contained. */
export function StatChip({ label, value }: { label: string; value: string }) {
	return (
		<Badge className="gap-1.5 bg-g-surface-2 font-g-mono">
			<span className="text-g-xs lowercase text-g-ink-mute">{label}</span>
			<span className="text-g-xs text-g-ink">{value}</span>
		</Badge>
	);
}

export function TagBadges({ entry }: { entry: db.Entry }) {
	const tags = tagNames(entry);
	if (!tags.length) return null;
	return (
		<div className="flex flex-wrap gap-g-base-sm">
			{tags.map((t) => (
				<Badge key={t} className="bg-g-success/15 text-g-success">
					{t}
				</Badge>
			))}
		</div>
	);
}

export function CardActions({ entry }: { entry: db.Entry }) {
	return (
		<div className="flex flex-wrap gap-g-base-sm">
			<Button size="sm" variant="secondary" onClick={() => copyConfig(entry)}>
				<FaCopy size={12} /> Copy config
			</Button>
			<Button size="sm" asChild>
				<a href={viewerLink(entry)} target="_blank" rel="noreferrer">
					<FaExternalLinkAlt size={11} /> Open in viewer
				</a>
			</Button>
		</div>
	);
}

/** Fixed grid avatar strip that never wraps (grid tracks shrink to fit). */
export function TeamStrip({
	entry,
	cols = 4,
}: {
	entry: db.Entry;
	cols?: 2 | 4;
}) {
	return (
		<div className={`grid gap-1 ${cols === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
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
	);
}

/**
 * Team portraits. Desktop uses the shared AvatarCard (cons/refine/set badges),
 * pinned to 420px so its 4-across grid never wraps; mobile uses a clean 2x2
 * strip. Because the preview's "mobile" is a fixed-width frame (viewport media
 * queries can't fire), layout is chosen by the explicit viewport prop.
 */
export function Team({
	entry,
	viewport,
}: {
	entry: db.Entry;
	viewport: "desktop" | "mobile";
}) {
	if (viewport === "mobile") return <TeamStrip entry={entry} cols={2} />;
	return (
		<div className="w-full max-w-[420px]">
			<AvatarCard chars={team(entry)} className="w-full" />
		</div>
	);
}

/** DPS hero number with unit, reused in grid + row. */
export function DpsStat({
	entry,
	size = "num",
}: {
	entry: db.Entry;
	size?: "num" | "num-sm";
}) {
	return (
		<div className="leading-none">
			<div className={`font-g-mono text-g-${size} font-semibold text-g-ink`}>
				{dps(entry)}
			</div>
			<div className="mt-1 text-g-xs text-g-ink-mute">DPS / target</div>
		</div>
	);
}

/* --------------------------------------------------------------- grid card -- */
/** Compact card for the responsive grid (alt B). */
export function TeamCard({
	entry,
	viewport,
}: {
	entry: db.Entry;
	viewport: "desktop" | "mobile";
}) {
	return (
		<Card className="flex flex-col gap-g-base p-g-card">
			<Team entry={entry} viewport={viewport} />
			<TagBadges entry={entry} />
			<div className="flex items-end justify-between">
				<DpsStat entry={entry} size="num-sm" />
				<div className="flex flex-col items-end gap-g-base-sm">
					<StatChip label="mode" value={mode(entry)} />
					<span className="font-g-mono text-g-xs text-g-ink-mute">
						{simTime(entry)}
					</span>
				</div>
			</div>
			<p className="line-clamp-3 text-g-sm text-g-ink-dim">
				{entry.description}
			</p>
			<div className="mt-auto flex items-center justify-between gap-g-base pt-g-base-sm">
				<span className="truncate text-g-xs text-g-ink-mute">
					by {author(entry)}
				</span>
			</div>
			<CardActions entry={entry} />
		</Card>
	);
}

/* ---------------------------------------------------------------- dense row -- */
/** Horizontal row for the dense list (alt C). */
export function TeamRow({ entry }: { entry: db.Entry }) {
	return (
		<Card className="flex flex-col gap-g-base p-g-card hd:flex-row hd:items-stretch">
			<div className="w-full shrink-0 hd:w-[220px]">
				<TeamStrip entry={entry} />
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-g-base-sm">
				<div className="flex flex-wrap items-center gap-g-base-sm">
					<StatChip label="mode" value={mode(entry)} />
					<StatChip label="targets" value={String(targetCount(entry))} />
					<StatChip label="sim" value={simTime(entry)} />
					<StatChip label="date" value={created(entry)} />
					<TagBadges entry={entry} />
				</div>
				<p className="line-clamp-2 text-g-sm text-g-ink-dim">
					<span className="font-semibold text-g-accent">{author(entry)}: </span>
					{entry.description}
				</p>
			</div>
			<div className="flex shrink-0 flex-row items-center justify-between gap-g-base hd:flex-col hd:items-end hd:justify-center hd:border-l hd:border-g-line-soft hd:pl-g-card">
				<div className="hd:text-right">
					<span className="font-g-mono text-g-num-sm font-semibold text-g-ink">
						{dpsFull(entry)}
					</span>
					<div className="text-g-xs text-g-ink-mute">DPS / target</div>
				</div>
				<CardActions entry={entry} />
			</div>
		</Card>
	);
}
