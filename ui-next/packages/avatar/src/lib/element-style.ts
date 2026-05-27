/**
 * Element name (lowercase) → CSS var carrying the element's primary color.
 * Used to tint the starry texture background. Unknown / blank elements fall
 * back to a neutral graphite tone via `var(--bg-3)`.
 */
export const ELEMENT_TOKENS: Record<string, string> = {
  anemo: "var(--el-anemo)",
  geo: "var(--el-geo)",
  electro: "var(--el-electro)",
  hydro: "var(--el-hydro)",
  pyro: "var(--el-pyro)",
  cryo: "var(--el-cryo)",
  dendro: "var(--el-dendro)",
  physical: "var(--el-physical)",
};

/**
 * Resolve a character's element to the CSS color expression used to tint the
 * starry texture background. Falls back to `var(--bg-3)` (neutral graphite)
 * for unknown / blank elements.
 */
export function resolveElementColor(element: string | undefined | null): string {
  if (!element) return "var(--bg-3)";
  return ELEMENT_TOKENS[element.toLowerCase()] ?? "var(--bg-3)";
}
