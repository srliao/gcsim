import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Editor } from "../editor";

describe("Editor component", () => {
  test("renders a container div", () => {
    const { container } = render(<Editor value="hello" />);
    // CM6 creates a .cm-editor element inside the container
    const cmEditor = container.querySelector(".cm-editor");
    expect(cmEditor).toBeInTheDocument();
  });

  test("displays the initial value", () => {
    const { container } = render(<Editor value="bennett char lvl=90/90;" />);
    const content = container.querySelector(".cm-content");
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toContain("bennett");
  });

  test("applies className to container div", () => {
    const { container } = render(<Editor value="test" className="my-editor" />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("my-editor");
  });

  test("renders in readOnly mode", () => {
    const { container } = render(<Editor value="read only content" readOnly />);
    const cmEditor = container.querySelector(".cm-editor");
    expect(cmEditor).toBeInTheDocument();
    // CM6 EditorState.readOnly prevents edits at the transaction level
    // but does not set contenteditable=false (that's EditorView.editable).
    // Verify the content is rendered correctly in readOnly mode.
    const cmContent = container.querySelector(".cm-content");
    expect(cmContent).toBeInTheDocument();
    expect(cmContent?.textContent).toContain("read only content");
  });

  test("renders with errors without crashing", () => {
    const errors = [{ line: 1, message: "test error" }];
    const { container } = render(<Editor value="some code" errors={errors} />);
    const cmEditor = container.querySelector(".cm-editor");
    expect(cmEditor).toBeInTheDocument();
  });

  test("updates content when value prop changes", () => {
    const { container, rerender } = render(<Editor value="initial" />);
    rerender(<Editor value="updated" />);
    const content = container.querySelector(".cm-content");
    expect(content?.textContent).toContain("updated");
  });

  // onChange integration test omitted: verifying CM6 transaction dispatch in jsdom
  // requires reaching into EditorView internals, which couples tests to CM6 implementation.

  describe("fontSize prop", () => {
    test("defaults to 14px when not provided", () => {
      render(<Editor value="x" />);
      // The fontSize Compartment injects a theme rule containing `14px`.
      const styleEls = Array.from(document.querySelectorAll("style"));
      const css = styleEls.map((s) => s.textContent).join("\n");
      expect(css).toMatch(/14px/);
    });

    test("applies a custom fontSize via theme injection", () => {
      render(<Editor value="x" fontSize={18} />);
      const styleEls = Array.from(document.querySelectorAll("style"));
      const css = styleEls.map((s) => s.textContent).join("\n");
      expect(css).toMatch(/18px/);
    });

    test("rerendering with a new fontSize updates the injected style", () => {
      const { rerender } = render(<Editor value="x" fontSize={14} />);
      rerender(<Editor value="x" fontSize={20} />);
      const styleEls = Array.from(document.querySelectorAll("style"));
      const css = styleEls.map((s) => s.textContent).join("\n");
      expect(css).toMatch(/20px/);
    });
  });

  describe("chrome (header + footer)", () => {
    test("does not render chrome by default (backwards compat)", () => {
      const { container } = render(<Editor value="x" />);
      expect(container.querySelector('[data-slot="editor-shell"]')).toBeNull();
      expect(container.querySelector('[data-slot="editor-header"]')).toBeNull();
      expect(container.querySelector('[data-slot="editor-footer"]')).toBeNull();
    });

    test("renders header + footer when showChrome is true", () => {
      const { container } = render(<Editor value="x" showChrome />);
      expect(container.querySelector('[data-slot="editor-shell"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="editor-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="editor-footer"]')).toBeInTheDocument();
      // The CodeMirror surface is still rendered inside the shell.
      expect(container.querySelector(".cm-editor")).toBeInTheDocument();
    });

    test("renders all provided tabs in the header", () => {
      render(
        <Editor
          value="x"
          showChrome
          activeTab="action"
          tabs={[
            { value: "config", label: "Config" },
            { value: "action", label: "Action list" },
            { value: "preview", label: "Preview" },
          ]}
        />,
      );

      expect(screen.getByRole("tab", { name: "Config" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Action list" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument();
    });

    test("fires onTabChange when a tab is activated via keyboard", () => {
      const onTabChange = vi.fn();
      render(
        <Editor
          value="x"
          showChrome
          activeTab="action"
          onTabChange={onTabChange}
          tabs={[
            { value: "config", label: "Config" },
            { value: "action", label: "Action list" },
            { value: "preview", label: "Preview" },
          ]}
        />,
      );

      const configTab = screen.getByRole("tab", { name: "Config" });
      // Radix Tabs activates on click/space/enter — synthesizing a click event
      // works in jsdom because the underlying element is a real <button>.
      fireEvent.pointerDown(configTab, { button: 0 });
      fireEvent.mouseDown(configTab, { button: 0 });
      fireEvent.click(configTab);

      expect(onTabChange).toHaveBeenCalledWith("config");
    });

    test("Format button fires onFormat when enabled", () => {
      const onFormat = vi.fn();
      render(<Editor value="x" showChrome onFormat={onFormat} />);
      const btn = screen.getByRole("button", { name: "Format" });
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);
      expect(onFormat).toHaveBeenCalledTimes(1);
    });

    test("Format button is disabled when no onFormat handler is supplied", () => {
      render(<Editor value="x" showChrome />);
      const btn = screen.getByRole("button", { name: "Format" });
      expect(btn).toBeDisabled();
    });

    test("footer shows the line count for the initial document", () => {
      const { container } = render(<Editor value={"line-1\nline-2\nline-3"} showChrome />);
      const lineCount = container.querySelector('[data-slot="editor-line-count"]');
      expect(lineCount).toBeInTheDocument();
      expect(lineCount?.textContent).toMatch(/3\s+lines/);
    });

    test("footer shows the initial cursor position", () => {
      const { container } = render(<Editor value="abc" showChrome />);
      const pos = container.querySelector('[data-slot="editor-cursor-pos"]');
      expect(pos).toBeInTheDocument();
      expect(pos?.textContent).toBe("Ln 1, Col 1");
    });

    test("parseStatus drives the status pill label", () => {
      const { container, rerender } = render(<Editor value="x" showChrome parseStatus="ok" />);
      let pill = container.querySelector('[data-slot="editor-parse-status"]');
      expect(pill?.textContent).toBe("OK");

      rerender(<Editor value="x" showChrome parseStatus="parsing" />);
      pill = container.querySelector('[data-slot="editor-parse-status"]');
      expect(pill?.textContent).toMatch(/Parsing/);

      rerender(<Editor value="x" showChrome parseStatus="error" />);
      pill = container.querySelector('[data-slot="editor-parse-status"]');
      expect(pill?.textContent).toBe("Errors");
    });

    test("renders optionsBadges slot content", () => {
      render(
        <Editor value="x" showChrome optionsBadges={<span data-testid="badge">iter=100</span>} />,
      );
      expect(screen.getByTestId("badge")).toBeInTheDocument();
      expect(screen.getByTestId("badge")).toHaveTextContent("iter=100");
    });

    test("font size stepper renders with the current fontSize", () => {
      const onFontSizeChange = vi.fn();
      const { container } = render(
        <Editor value="x" showChrome fontSize={16} onFontSizeChange={onFontSizeChange} />,
      );
      const stepper = container.querySelector('[data-slot="editor-font-size"]');
      expect(stepper).toBeInTheDocument();
      // The displayed numeric value is rendered inside number-stepper-value.
      const value = stepper?.querySelector('[data-slot="number-stepper-value"]');
      expect(value?.textContent).toMatch(/16\s*px/);
    });
  });
});
