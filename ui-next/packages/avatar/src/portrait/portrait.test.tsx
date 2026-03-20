import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Portrait } from "./portrait.js";

describe("Portrait", () => {
  it("renders with character key initial", () => {
    render(<Portrait characterKey="hutao" />);
    expect(screen.getByTestId("portrait-initial")).toHaveTextContent("H");
  });

  it("shows ? for empty character key", () => {
    render(<Portrait characterKey="" />);
    expect(screen.getByTestId("portrait-initial")).toHaveTextContent("?");
  });

  it("shows element indicator when element is provided", () => {
    render(<Portrait characterKey="hutao" element="pyro" />);
    const el = screen.getByTestId("portrait-element");
    expect(el).toHaveTextContent("pyro");
    expect(el.className).toContain("text-pyro");
  });

  it("does not show element indicator when element is not provided", () => {
    render(<Portrait characterKey="hutao" />);
    expect(screen.queryByTestId("portrait-element")).toBeNull();
  });

  it("applies sm size classes", () => {
    render(<Portrait characterKey="hutao" size="sm" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait.className).toContain("h-8");
    expect(portrait.className).toContain("w-8");
  });

  it("applies md size classes by default", () => {
    render(<Portrait characterKey="hutao" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait.className).toContain("h-12");
    expect(portrait.className).toContain("w-12");
  });

  it("applies lg size classes", () => {
    render(<Portrait characterKey="hutao" size="lg" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait.className).toContain("h-16");
    expect(portrait.className).toContain("w-16");
  });

  it("applies element border color", () => {
    render(<Portrait characterKey="hutao" element="pyro" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait.className).toContain("border-pyro/40");
  });

  it("applies custom className", () => {
    render(<Portrait characterKey="hutao" className="my-custom-class" />);
    const portrait = screen.getByTestId("portrait");
    expect(portrait.className).toContain("my-custom-class");
  });
});
