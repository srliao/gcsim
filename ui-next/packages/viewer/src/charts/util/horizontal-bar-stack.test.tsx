import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HorizontalBarStack } from "./horizontal-bar-stack.js";

const mockData = [
  { name: "Hu Tao", pyro: 35000, hydro: 0 },
  { name: "Xingqiu", pyro: 0, hydro: 15000 },
];

describe("HorizontalBarStack", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <HorizontalBarStack
        data={mockData}
        keys={["pyro", "hydro"]}
        nameKey="name"
        colorFn={(key) => (key === "pyro" ? "var(--el-pyro)" : "var(--el-hydro)")}
      />,
    );
    // Recharts renders a ResponsiveContainer div even in jsdom
    expect(container.firstChild).not.toBeNull();
  });

  it("accepts custom height", () => {
    const { container } = render(
      <HorizontalBarStack
        data={mockData}
        keys={["pyro", "hydro"]}
        nameKey="name"
        colorFn={() => "var(--accent)"}
        height={200}
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("accepts xTickFormatter", () => {
    const { container } = render(
      <HorizontalBarStack
        data={mockData}
        keys={["pyro"]}
        nameKey="name"
        colorFn={() => "var(--accent)"}
        xTickFormatter={(v) => `${v}K`}
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });
});
