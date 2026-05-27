/**
 * Chart color helpers.
 *
 * All values are CSS custom-property references resolved at render time by the
 * browser via the design tokens defined in
 * `@gcsim/primitives/theme.css` (`--el-*`, `--accent`, `--fg-*`).
 *
 * Recharts accepts arbitrary color strings for `stroke`/`fill`, including
 * `var(--token)`, which is forwarded to SVG attributes and resolved by the
 * browser. Keep this file free of hex literals (the fallback below is the only
 * exception so unit tests still see a defined string).
 */

const ELEMENT_VAR_FALLBACK = "var(--el-physical)";

/** Positional palette for character slots — cycles element colors. */
const CHARACTER_PALETTE = [
  "var(--el-anemo)",
  "var(--el-geo)",
  "var(--el-electro)",
  "var(--el-hydro)",
  "var(--el-pyro)",
  "var(--el-cryo)",
  "var(--el-dendro)",
  "var(--el-physical)",
];

const ELEMENT_COLORS: Record<string, string> = {
  pyro: "var(--el-pyro)",
  hydro: "var(--el-hydro)",
  electro: "var(--el-electro)",
  cryo: "var(--el-cryo)",
  anemo: "var(--el-anemo)",
  geo: "var(--el-geo)",
  dendro: "var(--el-dendro)",
  physical: "var(--el-physical)",
};

/**
 * Action → element token mapping. Actions are not first-class design tokens,
 * so we map each action to the closest element-color so adjacent actions are
 * visually distinguishable.
 *
 * - normal → anemo (calm baseline)
 * - charged → electro (heavier hit)
 * - skill → geo (mid-tier hit)
 * - burst → pyro (climax)
 * - dash → cryo
 * - jump → hydro
 * - swap → dendro
 * - walk → physical
 */
const ACTION_COLORS: Record<string, string> = {
  normal: "var(--el-anemo)",
  charged: "var(--el-electro)",
  skill: "var(--el-geo)",
  burst: "var(--el-pyro)",
  dash: "var(--el-cryo)",
  jump: "var(--el-hydro)",
  swap: "var(--el-dendro)",
  walk: "var(--el-physical)",
};

/**
 * Reaction → element token mapping. Each reaction maps to one of its
 * constituent elements (vaporize → pyro, melt → pyro, freeze → hydro, etc.).
 */
const REACTION_COLORS: Record<string, string> = {
  vaporize: "var(--el-pyro)",
  melt: "var(--el-pyro)",
  overload: "var(--el-pyro)",
  overloaded: "var(--el-pyro)",
  electrocharged: "var(--el-electro)",
  "electro-charged": "var(--el-electro)",
  superconduct: "var(--el-cryo)",
  swirl: "var(--el-anemo)",
  freeze: "var(--el-hydro)",
  crystallize: "var(--el-geo)",
  bloom: "var(--el-dendro)",
  hyperbloom: "var(--el-dendro)",
  burgeon: "var(--el-pyro)",
  quicken: "var(--el-dendro)",
  aggravate: "var(--el-electro)",
  spread: "var(--el-dendro)",
  burning: "var(--el-pyro)",
};

export function characterColor(index: number): string {
  return CHARACTER_PALETTE[index % CHARACTER_PALETTE.length];
}

export function elementColor(element: string): string {
  return ELEMENT_COLORS[element.toLowerCase()] ?? ELEMENT_VAR_FALLBACK;
}

export function actionColor(action: string): string {
  return ACTION_COLORS[action.toLowerCase()] ?? ELEMENT_VAR_FALLBACK;
}

export function reactionColor(reaction: string): string {
  return REACTION_COLORS[reaction.toLowerCase()] ?? ELEMENT_VAR_FALLBACK;
}
