import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulatorStore } from "../stores/simulator-store";
import { ExecutorProvider, useExecutor } from "./executor-provider";

vi.mock("@gcsim/executor", () => {
  const ServerExecutor = vi.fn();
  const WasmExecutor = vi.fn().mockImplementation(function mockWasm() {
    return { setWorkerCount: vi.fn() };
  });
  return { ServerExecutor, WasmExecutor };
});

describe("executor-provider", () => {
  beforeEach(() => {
    useSimulatorStore.getState().reset();
    vi.clearAllMocks();
  });

  it("throws when useExecutor is called outside provider", () => {
    expect(() => {
      renderHook(() => useExecutor());
    }).toThrow("useExecutor must be used within an ExecutorProvider");
  });

  it("creates WasmExecutor when mode is wasm", async () => {
    const { WasmExecutor } = await import("@gcsim/executor");
    useSimulatorStore.getState().setExecutionMode("wasm");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ExecutorProvider>{children}</ExecutorProvider>
    );
    renderHook(() => useExecutor(), { wrapper });

    expect(WasmExecutor).toHaveBeenCalledWith(expect.any(String));
  });

  it("creates ServerExecutor when mode is server", async () => {
    const { ServerExecutor } = await import("@gcsim/executor");
    useSimulatorStore.getState().setExecutionMode("server");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ExecutorProvider>{children}</ExecutorProvider>
    );
    renderHook(() => useExecutor(), { wrapper });

    expect(ServerExecutor).toHaveBeenCalledWith("http://127.0.0.1:8381");
  });
});
