import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Toaster,
	toast,
} from "@gcsim/primitives";
import type { db } from "@gcsim/types";
import { useEffect, useMemo, useState } from "react";
import { FaDesktop, FaGithub, FaMobileAlt, FaSync } from "react-icons/fa";
import { ARCHIVED_ENTRIES, fetchLiveEntries } from "./fixtures/entries";
import { SURFACES, type Viewport } from "./shell/registry";
import { THEMES } from "./shell/themes";

const LS = "gcsim-proto-shell";

type Persisted = { surface: string; theme: string; viewport: Viewport };

function loadPersisted(): Partial<Persisted> {
	try {
		return JSON.parse(localStorage.getItem(LS) ?? "{}");
	} catch {
		return {};
	}
}

export function App() {
	const saved = loadPersisted();
	const [surfaceId, setSurfaceId] = useState(saved.surface ?? SURFACES[1].id);
	const [altId, setAltId] = useState<string>("");
	const [viewport, setViewport] = useState<Viewport>(
		saved.viewport ?? "desktop",
	);
	const [themeId, setThemeId] = useState<string>(saved.theme ?? "cryo");
	const [entries, setEntries] = useState<db.Entry[]>(ARCHIVED_ENTRIES);
	const [live, setLive] = useState(false);
	const [loading, setLoading] = useState(false);

	const surface = SURFACES.find((s) => s.id === surfaceId) ?? SURFACES[0];
	const alt =
		surface.alternatives.find((a) => a.id === altId) ?? surface.alternatives[0];
	const theme = THEMES.find((t) => (t.id ?? "cryo") === themeId) ?? THEMES[0];

	// Reset the alternative when the surface changes.
	useEffect(() => {
		setAltId(surface.alternatives[0].id);
	}, [surface]);

	useEffect(() => {
		try {
			localStorage.setItem(
				LS,
				JSON.stringify({ surface: surfaceId, theme: themeId, viewport }),
			);
		} catch {
			/* ignore */
		}
	}, [surfaceId, themeId, viewport]);

	const toggleLive = async () => {
		if (live) {
			setEntries(ARCHIVED_ENTRIES);
			setLive(false);
			return;
		}
		setLoading(true);
		const data = await fetchLiveEntries();
		setLoading(false);
		if (data) {
			setEntries(data);
			setLive(true);
			toast("Live data loaded", {
				description: `${data.length} entries from gcsim.app`,
			});
		} else {
			toast("Live fetch failed", {
				description: "Backend unreachable — staying on the archived fixture.",
			});
		}
	};

	const AltComponent = alt.Component;
	const preview = useMemo(
		() => (
			<AltComponent
				entries={entries}
				viewport={viewport}
				onBrowse={() => setSurfaceId("db-database")}
			/>
		),
		[AltComponent, entries, viewport],
	);

	return (
		<div className="flex min-h-screen flex-col bg-g-canvas text-g-ink">
			{/* Harness chrome — always Cryo, never themed by the preview. */}
			<header className="sticky top-0 z-30 flex flex-col gap-g-base border-b border-g-line bg-g-surface px-g-base-lg py-g-base">
				<div className="flex flex-wrap items-center gap-g-base">
					<div className="flex items-center gap-g-base-sm">
						<span className="font-g-display text-g-h3 font-bold text-g-ink">
							db + taghelper
						</span>
						<span className="rounded-g-pill bg-g-accent-weak px-2 py-0.5 font-g-mono text-g-xs text-g-accent">
							layout archive
						</span>
					</div>

					<Separator
						orientation="vertical"
						className="mx-1 hidden h-6 md:block"
					/>

					<Segmented
						options={SURFACES.map((s) => ({ id: s.id, label: s.label }))}
						value={surfaceId}
						onChange={setSurfaceId}
					/>

					<div className="ml-auto flex items-center gap-g-base">
						<div className="flex overflow-hidden rounded-g-btn border border-g-line">
							<IconToggle
								active={viewport === "desktop"}
								onClick={() => setViewport("desktop")}
								title="Desktop"
							>
								<FaDesktop size={13} />
							</IconToggle>
							<IconToggle
								active={viewport === "mobile"}
								onClick={() => setViewport("mobile")}
								title="Mobile"
							>
								<FaMobileAlt size={13} />
							</IconToggle>
						</div>

						<Select value={themeId} onValueChange={setThemeId}>
							<SelectTrigger className="w-[160px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{THEMES.map((t) => (
									<SelectItem key={t.id ?? "cryo"} value={t.id ?? "cryo"}>
										{t.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							size="sm"
							variant={live ? "default" : "outline"}
							onClick={toggleLive}
							disabled={loading}
						>
							<FaSync size={12} className={loading ? "animate-spin" : ""} />
							{live ? "Live" : "Archived"}
						</Button>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-g-base">
					<Segmented
						options={surface.alternatives.map((a) => ({
							id: a.id,
							label: a.label,
						}))}
						value={alt.id}
						onChange={setAltId}
						small
					/>
					<span className="text-g-sm text-g-ink-dim">{alt.blurb}</span>
					<span className="ml-auto hidden items-center gap-1.5 text-g-xs text-g-ink-mute lg:flex">
						<FaGithub size={12} /> {entries.length} entries · {theme.label}
					</span>
				</div>
			</header>

			{/* Preview surface — themed via data-theme. */}
			<main className="flex flex-1 justify-center bg-g-canvas p-g-base-lg">
				{viewport === "mobile" ? (
					<div
						data-theme={theme.id ?? undefined}
						className="no-scrollbar h-[780px] w-[390px] shrink-0 overflow-y-auto rounded-g-xl border border-g-line bg-g-canvas text-g-ink shadow-g-pop"
					>
						{preview}
					</div>
				) : (
					<div
						data-theme={theme.id ?? undefined}
						className="w-full rounded-g-xl border border-g-line-soft bg-g-canvas text-g-ink"
					>
						{preview}
					</div>
				)}
			</main>

			<Toaster position="top-right" theme={theme.dark ? "dark" : "light"} />
		</div>
	);
}

function Segmented({
	options,
	value,
	onChange,
	small,
}: {
	options: { id: string; label: string }[];
	value: string;
	onChange: (id: string) => void;
	small?: boolean;
}) {
	return (
		<div className="flex flex-wrap gap-g-base-sm">
			{options.map((o) => {
				const active = o.id === value;
				return (
					<button
						type="button"
						key={o.id}
						onClick={() => onChange(o.id)}
						className={`rounded-g-btn border px-3 font-medium transition-colors ${
							small ? "py-1 text-g-xs" : "py-1.5 text-g-sm"
						} ${
							active
								? "border-transparent bg-g-accent text-g-accent-fg"
								: "border-g-line bg-g-surface-2 text-g-ink-dim hover:border-g-accent hover:text-g-ink"
						}`}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
}

function IconToggle({
	active,
	onClick,
	title,
	children,
}: {
	active: boolean;
	onClick: () => void;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			className={`flex size-8 items-center justify-center transition-colors ${
				active
					? "bg-g-accent text-g-accent-fg"
					: "bg-g-surface-2 text-g-ink-dim hover:text-g-ink"
			}`}
		>
			{children}
		</button>
	);
}
