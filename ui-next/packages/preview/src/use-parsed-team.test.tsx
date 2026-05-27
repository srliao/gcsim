import type { Sim } from "@gcsim/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useParsedTeam } from "./use-parsed-team.js";

function makeWrapper(client?: QueryClient) {
  const queryClient =
    client ??
    new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const SAMPLE_PARSED: Sim.ParsedResult = {
  characters: [
    {
      base: {
        key: "hutao",
        name: "hutao",
        element: "pyro",
        level: 90,
        max_level: 90,
        base_hp: 0,
        base_atk: 0,
        base_def: 0,
        cons: 1,
        start_hp: 0,
      },
      weapon: { name: "staffofhoma", level: 90, max_level: 90, refine: 1 },
      talents: { attack: 9, skill: 9, burst: 9 },
      stats: [1, 2, 3],
      sets: { shimenawasreminiscence: 4 },
    },
  ],
  errors: [],
  player_initial_pos: { x: 0, y: 0, r: 0 },
};

describe("useParsedTeam", () => {
  it("starts empty before the parse resolves", () => {
    const validateFn = vi.fn().mockReturnValue(new Promise<Sim.ParsedResult>(() => {}));
    const { result } = renderHook(() => useParsedTeam(validateFn, "active hutao;"), {
      wrapper: makeWrapper(),
    });
    expect(result.current.team).toEqual([]);
    expect(result.current.errors).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("does not call validate when config is empty", () => {
    const validateFn = vi.fn();
    const { result } = renderHook(() => useParsedTeam(validateFn, ""), {
      wrapper: makeWrapper(),
    });
    expect(validateFn).not.toHaveBeenCalled();
    expect(result.current.team).toEqual([]);
    expect(result.current.errors).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("maps ParsedCharacterProfile[] to Sim.Character[] on success", async () => {
    const validateFn = vi.fn().mockResolvedValue(SAMPLE_PARSED);
    const { result } = renderHook(() => useParsedTeam(validateFn, "active hutao;"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.team).toHaveLength(1);
    });

    const [char] = result.current.team;
    expect(char.name).toBe("hutao");
    expect(char.element).toBe("pyro");
    expect(char.level).toBe(90);
    expect(char.max_level).toBe(90);
    expect(char.cons).toBe(1);
    expect(char.weapon.name).toBe("staffofhoma");
    expect(char.weapon.refine).toBe(1);
    expect(char.talents).toEqual({ attack: 9, skill: 9, burst: 9 });
    expect(char.sets).toEqual({ shimenawasreminiscence: 4 });
    expect(char.stats).toEqual([1, 2, 3]);
    expect(char.snapshot).toEqual([]);
    expect(result.current.errors).toEqual([]);
  });

  it("surfaces parser errors and returns an empty team on validate rejection", async () => {
    const validateFn = vi.fn().mockRejectedValue(new Error("syntax error on line 3"));
    const { result } = renderHook(() => useParsedTeam(validateFn, "bad config"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.team).toEqual([]);
    expect(result.current.errors).toEqual(["syntax error on line 3"]);
  });

  it("returns parser errors from a successful parse that contains errors", async () => {
    const validateFn = vi.fn().mockResolvedValue({
      ...SAMPLE_PARSED,
      characters: [],
      errors: ["missing options block"],
    });
    const { result } = renderHook(() => useParsedTeam(validateFn, "active hutao;"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.team).toEqual([]);
    expect(result.current.errors).toEqual(["missing options block"]);
  });
});
