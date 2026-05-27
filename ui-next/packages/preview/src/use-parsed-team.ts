import type { Sim } from "@gcsim/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Return type of `useParsedTeam`. The Phase 5 wiring upgrades the stub
 * from `Sim.Character[]` to a richer object so consumers can render
 * loading states, parser errors, and the team itself.
 */
export interface UseParsedTeamResult {
  /** Parsed characters mapped to `Sim.Character[]` (empty until parse succeeds). */
  team: Sim.Character[];
  /** Parser errors returned by `Executor.validate`. */
  errors: string[];
  /** True while the parse is in flight. */
  isLoading: boolean;
}

/**
 * Async parse function compatible with `@gcsim/executor`'s
 * `Executor.validate(config)`. Passed in by the consumer so this package
 * remains independent of `@gcsim/executor` (and the WASM/server runtimes
 * that come with it).
 */
export type ValidateFn = (config: string) => Promise<Sim.ParsedResult>;

/**
 * Maps a single `Sim.ParsedCharacterProfile` to a `Sim.Character` so the
 * preview / simulator render layer (CharacterCard, TeamStrip, etc.) can
 * consume the same shape the simulator emits.
 *
 * The parser does not surface a "snapshot" (computed buff stats), so we
 * emit an empty array. Everything else is read directly off the profile.
 */
function profileToCharacter(profile: Sim.ParsedCharacterProfile): Sim.Character {
  return {
    name: profile.base.name,
    level: profile.base.level,
    element: profile.base.element,
    max_level: profile.base.max_level,
    cons: profile.base.cons,
    weapon: profile.weapon,
    talents: profile.talents,
    stats: profile.stats,
    snapshot: [],
    sets: profile.sets,
  };
}

/**
 * Derive a `Sim.Character[]` from a gcsim config string by running it
 * through the executor's `validate()` API. Wrapped in TanStack Query so
 * results are cached per-config and re-runs are de-duped.
 *
 * Pass `validateFn` directly — typically `executor.validate.bind(executor)`
 * from `useExecutor()` in the consuming app. This keeps `@gcsim/preview`
 * free of any executor runtime dependency.
 */
export function useParsedTeam(validateFn: ValidateFn, config: string): UseParsedTeamResult {
  const query = useQuery<Sim.ParsedResult>({
    queryKey: ["parsed-team", config],
    queryFn: () => validateFn(config),
    enabled: config.trim().length > 0,
    // The parse is cheap and pure for a given config — keep results fresh
    // long enough that quick tab switches don't re-fire.
    staleTime: 60 * 1000,
    retry: false,
  });

  if (!query.data) {
    return {
      team: [],
      errors: query.error instanceof Error ? [query.error.message] : [],
      isLoading: query.isPending && config.trim().length > 0,
    };
  }

  return {
    team: query.data.characters.map(profileToCharacter),
    errors: query.data.errors ?? [],
    isLoading: query.isPending,
  };
}
