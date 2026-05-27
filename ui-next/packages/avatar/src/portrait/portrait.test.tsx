import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockHutao } from "../../../../tooling/test-fixtures/index.js";
import { Portrait } from "./portrait.js";

describe("Portrait", () => {
  it("renders an image with alt text from a string key", () => {
    render(<Portrait char="hutao" />);
    const img = screen.getByTestId("portrait-img") as HTMLImageElement;
    expect(img.alt).toBe("hutao");
    expect(img.src).toContain("/assets/avatar/hutao.png");
  });

  it("falls back to default.png for unknown character keys", () => {
    render(<Portrait char="someoneunknown" />);
    const img = screen.getByTestId("portrait-img") as HTMLImageElement;
    expect(img.src).toContain("/assets/avatar/default.png");
  });

  it("accepts a Sim.Character and uses its name as the asset key", () => {
    render(<Portrait char={mockHutao} />);
    const img = screen.getByTestId("portrait-img") as HTMLImageElement;
    expect(img.alt).toBe("hutao");
    expect(img.src).toContain("/assets/avatar/hutao.png");
  });

  it("sets data-element from a Sim.Character", () => {
    render(<Portrait char={mockHutao} />);
    expect(screen.getByTestId("portrait")).toHaveAttribute("data-element", "pyro");
  });

  it("does not set data-element when char is a string", () => {
    render(<Portrait char="hutao" />);
    expect(screen.getByTestId("portrait")).not.toHaveAttribute("data-element");
  });

  it("renders default size of 48px", () => {
    render(<Portrait char="hutao" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("renders custom size in px", () => {
    render(<Portrait char="hutao" size={96} />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait).toHaveStyle({ width: "96px", height: "96px" });
  });

  it("shows a cons chip when cons is provided", () => {
    render(<Portrait char="hutao" cons={6} />);
    expect(screen.getByTestId("portrait-cons")).toHaveTextContent("C6");
  });

  it("does not show a cons chip when cons is null", () => {
    render(<Portrait char="hutao" cons={null} />);
    expect(screen.queryByTestId("portrait-cons")).toBeNull();
  });

  it("does not show a cons chip when cons is omitted", () => {
    render(<Portrait char="hutao" />);
    expect(screen.queryByTestId("portrait-cons")).toBeNull();
  });

  it("renders a cons chip with value 0 (not treated as nullish)", () => {
    render(<Portrait char="hutao" cons={0} />);
    expect(screen.getByTestId("portrait-cons")).toHaveTextContent("C0");
  });

  it("draws a hairline border by default (frame=true)", () => {
    render(<Portrait char="hutao" />);
    expect(screen.getByTestId("portrait").className).toContain("border");
  });

  it("omits the border when frame=false", () => {
    render(<Portrait char="hutao" frame={false} />);
    expect(screen.getByTestId("portrait").className).not.toContain("border-[var(--line-2)]");
  });

  it("forwards className", () => {
    render(<Portrait char="hutao" className="my-custom-class" />);
    expect(screen.getByTestId("portrait").className).toContain("my-custom-class");
  });
});
