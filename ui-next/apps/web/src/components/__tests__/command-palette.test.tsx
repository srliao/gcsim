import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette, type CommandPaletteInsertDetail } from "../command-palette";

// jsdom polyfills required by cmdk + radix-dialog.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function scrollIntoView() {};
  }
  if (typeof Element !== "undefined" && !Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function hasPointerCapture() {
      return false;
    };
  }
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  // Each test renders fresh; vitest auto-cleans the DOM via testing-library.
});

function openPaletteViaKeyboard() {
  fireEvent.keyDown(document, { key: "k", metaKey: true });
}

describe("CommandPalette", () => {
  it("renders closed by default (no dialog content visible)", () => {
    render(<CommandPalette />);
    expect(screen.queryByTestId("command-palette-dialog")).toBeNull();
  });

  it("opens on ⌘K", () => {
    render(<CommandPalette />);
    openPaletteViaKeyboard();
    expect(screen.getByTestId("command-palette-dialog")).toBeInTheDocument();
  });

  it("opens when the open event is dispatched", () => {
    render(<CommandPalette />);
    act(() => {
      window.dispatchEvent(new CustomEvent("gcsim:open-palette"));
    });
    expect(screen.getByTestId("command-palette-dialog")).toBeInTheDocument();
  });

  it("renders all six groups when opened", () => {
    render(<CommandPalette />);
    openPaletteViaKeyboard();
    expect(screen.getByTestId("command-group-characters")).toBeInTheDocument();
    expect(screen.getByTestId("command-group-weapons")).toBeInTheDocument();
    expect(screen.getByTestId("command-group-artifacts")).toBeInTheDocument();
    expect(screen.getByTestId("command-group-enemies")).toBeInTheDocument();
    expect(screen.getByTestId("command-group-actions")).toBeInTheDocument();
    expect(screen.getByTestId("command-group-stats")).toBeInTheDocument();
  });

  it("filters items when typing into the input", () => {
    render(<CommandPalette />);
    openPaletteViaKeyboard();
    const input = screen.getByTestId("command-palette-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hutao" } });
    // cmdk leaves matching items visible
    expect(screen.getByText("hutao")).toBeInTheDocument();
  });

  it("dispatches insert-at-cursor with the right detail on select", () => {
    const listener = vi.fn();
    window.addEventListener("gcsim:insert-at-cursor", listener as EventListener);
    render(<CommandPalette />);
    openPaletteViaKeyboard();

    // Click an action item (it's the smallest stable group)
    fireEvent.click(screen.getByText("skill"));

    expect(listener).toHaveBeenCalledOnce();
    const evt = listener.mock.calls[0][0] as CustomEvent<CommandPaletteInsertDetail>;
    expect(evt.detail).toEqual({ token: "skill", group: "actions" });
    window.removeEventListener("gcsim:insert-at-cursor", listener as EventListener);
  });

  it("persists Recent group after a selection and shows it on next open", () => {
    const { unmount } = render(<CommandPalette />);
    openPaletteViaKeyboard();
    fireEvent.click(screen.getByText("burst"));
    // unmount + remount to verify localStorage hydration
    unmount();
    render(<CommandPalette />);
    openPaletteViaKeyboard();
    expect(screen.getByTestId("command-group-recent")).toBeInTheDocument();
    expect(screen.getAllByText("burst").length).toBeGreaterThanOrEqual(1);
  });

  it("closes via Escape when open", () => {
    render(<CommandPalette />);
    openPaletteViaKeyboard();
    expect(screen.getByTestId("command-palette-dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("command-palette-dialog")).toBeNull();
  });

  it("does NOT open on ⌘K while focus is inside an <input>", () => {
    render(<CommandPalette />);
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);
    openPaletteViaKeyboard();
    expect(screen.queryByTestId("command-palette-dialog")).toBeNull();
    document.body.removeChild(input);
  });

  it("does NOT open on ⌘K while focus is inside a contenteditable element", () => {
    render(<CommandPalette />);
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    editable.tabIndex = 0;
    document.body.appendChild(editable);
    editable.focus();
    // jsdom focuses contenteditable via tabindex; verify before asserting.
    expect(document.activeElement).toBe(editable);
    expect(editable.getAttribute("contenteditable")).toBe("true");
    openPaletteViaKeyboard();
    expect(screen.queryByTestId("command-palette-dialog")).toBeNull();
    document.body.removeChild(editable);
  });

  it("opens on ⌘K when no editable element has focus (regression)", () => {
    render(<CommandPalette />);
    // Ensure focus is on document body (no editable focus).
    (document.activeElement as HTMLElement | null)?.blur?.();
    openPaletteViaKeyboard();
    expect(screen.getByTestId("command-palette-dialog")).toBeInTheDocument();
  });
});
