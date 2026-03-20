import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";

// --- Static completion lists ---
// TODO: Auto-generate from Go source alongside tokens.ts

const actionCompletions: Completion[] = [
  { label: "skill", type: "function", detail: "Elemental Skill" },
  { label: "burst", type: "function", detail: "Elemental Burst" },
  { label: "attack", type: "function", detail: "Normal Attack" },
  { label: "charge", type: "function", detail: "Charged Attack" },
  { label: "high_plunge", type: "function", detail: "High Plunge" },
  { label: "low_plunge", type: "function", detail: "Low Plunge" },
  { label: "aim", type: "function", detail: "Aimed Shot" },
  { label: "dash", type: "function", detail: "Dash" },
  { label: "jump", type: "function", detail: "Jump" },
  { label: "walk", type: "function", detail: "Walk" },
  { label: "swap", type: "function", detail: "Swap Character" },
];

const statCompletions: Completion[] = [
  { label: "hp%", type: "property" },
  { label: "hp", type: "property" },
  { label: "atk%", type: "property" },
  { label: "atk", type: "property" },
  { label: "def%", type: "property" },
  { label: "def", type: "property" },
  { label: "er", type: "property", detail: "Energy Recharge" },
  { label: "em", type: "property", detail: "Elemental Mastery" },
  { label: "cr", type: "property", detail: "Crit Rate" },
  { label: "cd", type: "property", detail: "Crit DMG" },
  { label: "heal", type: "property", detail: "Healing Bonus" },
  { label: "phys%", type: "property", detail: "Physical DMG Bonus" },
  { label: "pyro%", type: "property" },
  { label: "hydro%", type: "property" },
  { label: "cryo%", type: "property" },
  { label: "electro%", type: "property" },
  { label: "anemo%", type: "property" },
  { label: "geo%", type: "property" },
  { label: "dendro%", type: "property" },
  { label: "atkspd%", type: "property" },
  { label: "dmg%", type: "property" },
];

const keywordCompletions: Completion[] = [
  "let",
  "while",
  "if",
  "else",
  "fn",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "fallthrough",
  "return",
  "for",
  "options",
  "add",
  "char",
  "stats",
  "weapon",
  "set",
  "lvl",
  "refine",
  "cons",
  "talent",
  "count",
  "active",
  "target",
  "params",
  "label",
  "until",
  "resist",
  "energy",
  "hurt",
].map((kw) => ({ label: kw, type: "keyword" }));

// Character completions — canonical names only (not aliases)
const characterCompletions: Completion[] = [
  "albedo",
  "aloy",
  "amber",
  "arlecchino",
  "ayaka",
  "ayato",
  "barbara",
  "beidou",
  "bennett",
  "candace",
  "charlotte",
  "chevreuse",
  "chiori",
  "chongyun",
  "citlali",
  "clorinde",
  "collei",
  "cyno",
  "dahlia",
  "dehya",
  "diluc",
  "diona",
  "dori",
  "emilie",
  "escoffier",
  "eula",
  "faruzan",
  "fischl",
  "flins",
  "freminet",
  "furina",
  "gaming",
  "ganyu",
  "gorou",
  "heizou",
  "hutao",
  "ineffa",
  "itto",
  "jean",
  "kaeya",
  "kaveh",
  "kazuha",
  "keqing",
  "kinich",
  "kirara",
  "klee",
  "kokomi",
  "kuki",
  "lanyan",
  "lauma",
  "layla",
  "lynette",
  "lyney",
  "mavuika",
  "mika",
  "mizuki",
  "mona",
  "mualani",
  "nahida",
  "navia",
  "neuvillette",
  "nilou",
  "ningguang",
  "noelle",
  "ororon",
  "qiqi",
  "raiden",
  "razor",
  "rosaria",
  "sara",
  "sayu",
  "sethos",
  "shenhe",
  "sigewinne",
  "skirk",
  "sucrose",
  "tartaglia",
  "thoma",
  "tighnari",
  "varesa",
  "venti",
  "wanderer",
  "wriothesley",
  "xiangling",
  "xiao",
  "xilonen",
  "xingqiu",
  "xinyan",
  "xianyun",
  "yae",
  "yanfei",
  "yaoyao",
  "yelan",
  "yoimiya",
  "yunjin",
  "zhongli",
].map((name) => ({ label: name, type: "class", detail: "Character" }));

// --- Context-aware completion source ---

export function gcsimCompletionSource(context: CompletionContext): CompletionResult | null {
  // Match identifier-like text before cursor (including hyphens and % for stat names)
  const word = context.matchBefore(/[a-zA-Z_][\w\-%]*/);
  if (!word && !context.explicit) return null;

  const from = word?.from ?? context.pos;
  const line = context.state.doc.lineAt(context.pos);
  const textBefore = line.text.slice(0, context.pos - line.from);

  // After "add char" or "active" -> suggest character names
  if (/\b(add\s+char|active)\s+$/.test(textBefore)) {
    return { from, options: characterCompletions, validFor: /^[\w-]*$/ };
  }

  // After a character name + dot -> suggest actions
  if (/\w\.\s*$/.test(textBefore)) {
    return { from, options: actionCompletions, validFor: /^\w*$/ };
  }

  // After "stats" keyword -> suggest stat names
  if (/\bstats\b/.test(textBefore)) {
    return { from, options: statCompletions, validFor: /^[\w%]*$/ };
  }

  // Default: offer all completions
  return {
    from,
    options: [
      ...keywordCompletions,
      ...characterCompletions,
      ...actionCompletions,
      ...statCompletions,
    ],
    validFor: /^[\w\-%]*$/,
  };
}
