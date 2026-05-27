# @gcsim/avatar

## Purpose

Character display components for the gcsim web UI. Renders character
portraits, full character cards, and team strips. All components are
**read-only** — derived from parsed config.

## How to Add a New Component

Follow the `/new-component` pattern:

1. Create `src/<component-name>/` directory
2. Add `<component-name>.tsx` with the component
3. Add `<component-name>.test.tsx` with tests
4. Add `index.ts` with named exports
5. Re-export from `src/index.ts`
6. Add a Storybook story under `apps/storybook/src/stories/`
7. Run `npx biome check --write packages/avatar/`

Canonical example: `src/character-card/`

## Public API

All exports go through `src/index.ts`:

- **`Portrait`** — Atomic square avatar marker over an element-tinted
  starry texture. Optional `cons` chip, optional hairline frame.
- **`CharacterCard`** — Full read-only banner card with a 4:3 portrait,
  Cn/name/Lvl/Tal overlay, set row(s), and a weapon row.
- **`CharacterCardEmpty`** — Placeholder for empty team slots
  ("slot N · not defined in code").
- **`CharacterCardCompact`** — Square compact variant with a top-right
  `lvl / Cn Rn` pill and bottom-left weapon + artifact icons.
- **`TeamStrip`** — Horizontal row of up to 4 `CharacterCardCompact`s,
  with dashed-border placeholders for missing slots.
- **`groupSets(sets)`** — Helper that converts a `Sim.Set` map into a
  sorted `Array<{ name, count }>` (count ≥ 2, count desc + name asc).
- **`avatarSrc(name)`**, **`weaponSrc(name)`**, **`artifactSrc(setName)`**
  — Asset URL helpers; allowlisted, lowercase + non-alphanumeric stripped.
  `avatarSrc` falls back to `/assets/avatar/default.png`; the other two
  return `null` for unknown keys.
- **`normalizeKey(input)`** — Shared slug helper (lowercase + non-alphanum
  stripped). Re-exported for callers that need it.

Usage:

```tsx
import {
  Portrait,
  CharacterCard,
  CharacterCardCompact,
  CharacterCardEmpty,
  TeamStrip,
  avatarSrc,
} from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";

// Atomic marker
<Portrait char="hutao" size={48} cons={1} />
<Portrait char={parsedCharacter} size={64} />

// Full read-only banner card
<CharacterCard char={parsedCharacter} />

// Empty team slot
<CharacterCardEmpty slot={4} />

// Square compact variant
<CharacterCardCompact char={parsedCharacter} size={84} />

// 4-slot team strip with empties for missing slots
<TeamStrip team={parsedTeam} />
```

## Design Notes

- **Element = background, not badge** — per `docs/design-system.md`
  principle 08. Element is communicated by a tinted starry texture
  set on each character host element (`Portrait`, `CharacterCard`,
  `CharacterCardCompact`); there is no element glyph.
- **Empty state convention** — `CharacterCard` itself never renders an
  empty state. For unfilled team slots, render `CharacterCardEmpty`
  alongside it (it picks up its own dashed-border placeholder layout).
- **`Sim.Set` shape** — `Sim.Character` exposes sets as
  `{ [setKey: string]: pieceCount }`. The `groupSets()` helper is the
  one place we convert this to an array; do not redefine the character
  shape elsewhere (architecture rule #1).
- **Asset allowlist** — `src/lib/avatars.ts` maintains typed allowlists.
  Add a new asset by dropping the PNG into
  `apps/web/public/assets/<kind>/` and appending the normalized slug to
  the matching `Set` in `avatars.ts`.

## Dependencies

- `@gcsim/primitives` — `cn()` helper.
- `@gcsim/types` — `Sim.Character`, `Sim.Set`, `Sim.Weapon`, `Sim.Talent`.

## Testing

Tests use shared fixtures from `tooling/test-fixtures/`. Test files are
excluded from `tsconfig.json` (via `exclude`) to avoid rootDir issues
with cross-package fixture imports. Vitest handles type resolution
independently.

Run tests: `pnpm test` or `turbo run test --filter=@gcsim/avatar`.

## Don'ts

- Don't import from other packages' `src/` — only from their package index.
- Don't hardcode colors — use the `--el-<element>` / `--fg-*` / `--bg-*`
  / `--line-*` design tokens directly.
- Don't render an element badge — element is signaled by background tint.
- Don't add app-specific logic here — this package is for reusable,
  read-only character display components.
- Don't redefine `Sim.Character` — group sets internally via `groupSets()`.
