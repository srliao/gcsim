# @gcsim/avatar

## Purpose

Character display components for the gcsim web UI. Renders character portraits, detailed character cards, and team compositions.

## How to Add a New Component

Follow the `/new-component` pattern:

1. Create `src/<component-name>/` directory
2. Add `<component-name>.tsx` with the component
3. Add `<component-name>.test.tsx` with tests
4. Add `index.ts` with named exports
5. Re-export from `src/index.ts`
6. Run `npx biome check --write packages/avatar/`

Canonical example: `src/portrait/`

## Public API

All exports go through `src/index.ts`:

- **`Portrait`** — Circular avatar placeholder with character initial and element badge
- **`AvatarCard`** — Full character card showing name, level, constellation, weapon, and talents
- **`TeamDisplay`** — Horizontal row of Portrait components for 1-4 characters

Usage:

```typescript
import { Portrait, AvatarCard, TeamDisplay } from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";

// Simple portrait
<Portrait characterKey="hutao" element="pyro" size="lg" />

// Full character card
<AvatarCard character={character} />

// Team row
<TeamDisplay characters={team} />
```

## Dependencies

- `@gcsim/primitives` — Card components, `cn()` utility, theme tokens
- `@gcsim/types` — `Sim.Character`, `Sim.Weapon`, `Sim.Talent` interfaces
- `@gcsim/data` — Static game data (not yet used, available for future components)

## Testing

Tests use shared fixtures from `tooling/test-fixtures/`. Test files are excluded from `tsconfig.json` (via `exclude`) to avoid rootDir issues with cross-package fixture imports. Vitest handles type resolution independently.

Run tests: `pnpm test` or `turbo run test --filter=@gcsim/avatar`

## Don'ts

- Don't import from other packages' `src/` — only from their package index
- Don't hardcode colors — use element theme tokens (`text-pyro`, `border-anemo/40`, etc.)
- Don't add app-specific logic here — this package is for reusable character display components
- Don't add actual game images — those come from the API/CDN at runtime
