/**
 * The 15 Gauge palettes from packages/theme.css. `cryo` is the default (bare
 * :root, no data-theme attribute); the rest are applied via data-theme. Grouped
 * only for the picker; the app ships on Cryo per the explorer handoff.
 */
export type ThemeGroup = "Core" | "Dark" | "Light";

export type Theme = {
	/** data-theme value, or null for the default Cryo (bare :root). */
	id: string | null;
	label: string;
	group: ThemeGroup;
	dark: boolean;
};

export const THEMES: Theme[] = [
	{ id: null, label: "Cryo (default)", group: "Core", dark: true },
	{ id: "abyss-d", label: "Abyss", group: "Dark", dark: true },
	{ id: "ember-d", label: "Ember", group: "Dark", dark: true },
	{ id: "pulse-d", label: "Pulse", group: "Dark", dark: true },
	{ id: "twilight", label: "Twilight", group: "Dark", dark: true },
	{ id: "qilin", label: "Qilin", group: "Dark", dark: true },
	{ id: "glacier", label: "Glacier", group: "Dark", dark: true },
	{ id: "azure", label: "Azure", group: "Dark", dark: true },
	{ id: "aqua", label: "Aqua", group: "Dark", dark: true },
	{ id: "abyss-l", label: "Abyss Light", group: "Light", dark: false },
	{ id: "ember-l", label: "Ember Light", group: "Light", dark: false },
	{ id: "pulse-l", label: "Pulse Light", group: "Light", dark: false },
	{ id: "frostfall", label: "Frostfall", group: "Light", dark: false },
	{ id: "blossom", label: "Blossom", group: "Light", dark: false },
	{ id: "lantern", label: "Lantern", group: "Light", dark: false },
];
