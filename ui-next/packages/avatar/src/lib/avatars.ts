/**
 * Asset URL helpers for character portraits, weapons, and artifacts.
 *
 * Each helper normalizes its input (lowercase + strip non-alphanumeric) and
 * looks it up in a typed allowlist of assets we've mirrored into
 * `apps/web/public/assets/`. Unknown keys fall back to:
 *   - `avatarSrc` → `/assets/avatar/default.png`
 *   - `weaponSrc` / `artifactSrc` → `null`
 *
 * To add a new asset:
 *   1. Drop the PNG into the corresponding `apps/web/public/assets/<kind>/` dir
 *   2. Add the normalized key to the matching set below
 */

const AVATAR_KEYS = new Set<string>([
  "ayaka",
  "bennett",
  "default",
  "hutao",
  "kazuha",
  "nahida",
  "raiden",
  "venti",
  "xiangling",
  "xingqiu",
  "zhongli",
]);

const WEAPON_KEYS = new Set<string>([
  "blacktassel",
  "freedomsworn",
  "sacrificialsword",
  "staffofhoma",
]);

const ARTIFACT_KEYS = new Set<string>([
  "crimsonwitchofflames",
  "emblemofseveredfate",
  "gildeddreams",
  "noblesseoblige",
  "shimenawasreminiscence",
  "tenacityofthemillelith",
  "viridescentvenerer",
]);

/**
 * Lowercase + strip every character that isn't `a-z` or `0-9`.
 * Returns `""` for nullish input.
 */
export function normalizeKey(input: string): string {
  if (!input) return "";
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve a character key to a portrait URL. Always returns a string;
 * unknown keys yield `/assets/avatar/default.png`.
 */
export function avatarSrc(name: string): string {
  const key = normalizeKey(name);
  if (AVATAR_KEYS.has(key)) return `/assets/avatar/${key}.png`;
  return "/assets/avatar/default.png";
}

/**
 * Resolve a weapon name to its icon URL, or `null` if not in the allowlist.
 */
export function weaponSrc(name: string): string | null {
  const key = normalizeKey(name);
  if (!key) return null;
  if (WEAPON_KEYS.has(key)) return `/assets/weapons/${key}.png`;
  return null;
}

/**
 * Resolve an artifact set name to its (flower) icon URL,
 * or `null` if not in the allowlist.
 */
export function artifactSrc(setName: string): string | null {
  const key = normalizeKey(setName);
  if (!key) return null;
  if (ARTIFACT_KEYS.has(key)) return `/assets/artifacts/${key}_flower.png`;
  return null;
}
