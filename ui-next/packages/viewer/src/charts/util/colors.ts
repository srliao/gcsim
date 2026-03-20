// Fixed qualitative palette for character slots (10 colors)
const CHARACTER_PALETTE = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

const ELEMENT_COLORS: Record<string, string> = {
  pyro: "#EF4444",
  hydro: "#3B82F6",
  electro: "#A855F7",
  cryo: "#22D3EE",
  anemo: "#6EE7B7",
  geo: "#F59E0B",
  dendro: "#84CC16",
  physical: "#9CA3AF",
};

const ACTION_COLORS: Record<string, string> = {
  normal: "#3B82F6",
  charged: "#8B5CF6",
  skill: "#10B981",
  burst: "#EF4444",
  dash: "#F59E0B",
  jump: "#06B6D4",
  swap: "#EC4899",
  walk: "#9CA3AF",
};

const REACTION_COLORS: Record<string, string> = {
  vaporize: "#F97316",
  melt: "#EF4444",
  overload: "#DC2626",
  overloaded: "#DC2626",
  electrocharged: "#7C3AED",
  "electro-charged": "#7C3AED",
  superconduct: "#22D3EE",
  swirl: "#6EE7B7",
  freeze: "#60A5FA",
  crystallize: "#F59E0B",
  bloom: "#84CC16",
  hyperbloom: "#16A34A",
  burgeon: "#DC2626",
  quicken: "#A3E635",
  aggravate: "#7C3AED",
  spread: "#22C55E",
  burning: "#B91C1C",
};

export function characterColor(index: number): string {
  return CHARACTER_PALETTE[index % CHARACTER_PALETTE.length];
}

export function elementColor(element: string): string {
  return ELEMENT_COLORS[element.toLowerCase()] ?? "#9CA3AF";
}

export function actionColor(action: string): string {
  return ACTION_COLORS[action.toLowerCase()] ?? "#9CA3AF";
}

export function reactionColor(reaction: string): string {
  return REACTION_COLORS[reaction.toLowerCase()] ?? "#9CA3AF";
}
