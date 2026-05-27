import type { Sim } from "@gcsim/types";

/**
 * Returns the parsed team (`Sim.Character[]`) derived from a gcsim config
 * string. Spec: `docs/design_handoff_ui_next/docs/component-inventory.md` § 3d.
 *
 * Phase 3d ships the API surface only — the actual parse is wired in Phase 5
 * by the simulator app, which owns the executor instance. The shape stays the
 * same so consumers can swap the implementation without churning callers.
 *
 * TODO(phase 5): wire to `@gcsim/executor`'s async `validate(config)` API
 * (which returns `Sim.ParsedResult`) via TanStack Query, then map
 * `ParsedCharacterProfile[] -> Sim.Character[]` (including grouped sets) so
 * the preview can render a team purely from a config string.
 */
export function useParsedTeam(_config: string): Sim.Character[] {
  return [];
}
