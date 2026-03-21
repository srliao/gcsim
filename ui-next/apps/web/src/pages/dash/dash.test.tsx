import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

import { Dash } from "./dash.js";

afterEach(cleanup);

describe("Dash", () => {
  it("renders the heading", () => {
    render(<Dash />);
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
    expect(screen.getByText("gcsim")).toBeDefined();
  });

  it("renders the description", () => {
    render(<Dash />);
    expect(
      screen.getByText("Genshin Impact team damage simulation and optimization tool"),
    ).toBeDefined();
  });

  it("renders quick action cards", () => {
    render(<Dash />);
    expect(screen.getByText("Simulator")).toBeDefined();
    expect(screen.getByText("Teams DB")).toBeDefined();
    expect(screen.getByText("Documentation")).toBeDefined();
  });

  it("simulator link points to /simulator", () => {
    render(<Dash />);
    const link = screen.getByText("Simulator").closest("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/simulator");
  });

  it("teams db link points to external URL", () => {
    render(<Dash />);
    const link = screen.getByText("Teams DB").closest("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("https://db.gcsim.app");
  });

  it("documentation link points to external URL", () => {
    render(<Dash />);
    const link = screen.getByText("Documentation").closest("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("https://docs.gcsim.app");
  });
});
