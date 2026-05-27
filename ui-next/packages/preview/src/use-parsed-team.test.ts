import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useParsedTeam } from "./use-parsed-team.js";

describe("useParsedTeam", () => {
  it("returns an array (stubbed for Phase 3d; wired in Phase 5)", () => {
    const { result } = renderHook(() => useParsedTeam("character=hutao"));
    expect(Array.isArray(result.current)).toBe(true);
  });

  it("returns an empty array when given an empty config", () => {
    const { result } = renderHook(() => useParsedTeam(""));
    expect(result.current).toEqual([]);
  });

  it("returns an empty array regardless of input until executor wiring lands", () => {
    // TODO(phase 5): replace with real parse assertions once @gcsim/executor
    // is wired up in the simulator app.
    const { result } = renderHook(() =>
      useParsedTeam("options iteration=1000;\ncharacter=hutao lvl=90/90;"),
    );
    expect(result.current).toEqual([]);
  });
});
