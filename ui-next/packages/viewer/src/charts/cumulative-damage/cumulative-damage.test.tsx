import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CumulativeDamage, transformCumulativeDamage } from "./cumulative-damage.js";

const mockData: Sim.TargetBucketStats = {
  bucket_size: 60,
  targets: {
    "target-1": {
      overall: {
        min: [0, 2500, 10000],
        max: [5000, 17000, 37000],
        q1: [1000, 6000, 16000],
        q2: [2500, 10000, 24000],
        q3: [4000, 14000, 32000],
      },
    },
  },
};

describe("transformCumulativeDamage", () => {
  it("produces correct array length", () => {
    const result = transformCumulativeDamage(mockData);
    expect(result).toHaveLength(3);
  });

  it("time values are correct (index * bucket_size / 60)", () => {
    const result = transformCumulativeDamage(mockData);
    expect(result[0].time).toBe(0); // 0 * 60 / 60 = 0
    expect(result[1].time).toBe(1); // 1 * 60 / 60 = 1
    expect(result[2].time).toBe(2); // 2 * 60 / 60 = 2
  });

  it("maps min, q1, q2, q3, max from each index", () => {
    const result = transformCumulativeDamage(mockData);
    expect(result[0].min).toBe(0);
    expect(result[0].q1).toBe(1000);
    expect(result[0].q2).toBe(2500);
    expect(result[0].q3).toBe(4000);
    expect(result[0].max).toBe(5000);

    expect(result[1].min).toBe(2500);
    expect(result[1].q1).toBe(6000);
    expect(result[1].q2).toBe(10000);
    expect(result[1].q3).toBe(14000);
    expect(result[1].max).toBe(17000);
  });

  it("returns empty array when data is undefined", () => {
    const result = transformCumulativeDamage(undefined);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when targets is missing", () => {
    const result = transformCumulativeDamage({ bucket_size: 60 });
    expect(result).toHaveLength(0);
  });

  it("selects a specific target when targetId is provided", () => {
    const dataWithMultipleTargets: Sim.TargetBucketStats = {
      bucket_size: 60,
      targets: {
        "target-1": {
          overall: {
            min: [0],
            max: [5000],
            q1: [1000],
            q2: [2500],
            q3: [4000],
          },
        },
        "target-2": {
          overall: {
            min: [99],
            max: [9999],
            q1: [3333],
            q2: [6666],
            q3: [8888],
          },
        },
      },
    };
    const result = transformCumulativeDamage(dataWithMultipleTargets, "target-2");
    expect(result[0].min).toBe(99);
    expect(result[0].max).toBe(9999);
  });

  it("defaults to first target when targetId is not provided", () => {
    const result = transformCumulativeDamage(mockData);
    // First target is "target-1"
    expect(result[0].min).toBe(0);
    expect(result[0].max).toBe(5000);
  });

  it("uses bucket_size to compute time with non-60 bucket size", () => {
    const data: Sim.TargetBucketStats = {
      bucket_size: 120,
      targets: {
        "target-1": {
          overall: {
            min: [0, 0],
            max: [1000, 2000],
            q1: [100, 200],
            q2: [500, 1000],
            q3: [800, 1600],
          },
        },
      },
    };
    const result = transformCumulativeDamage(data);
    expect(result[0].time).toBe(0); // 0 * 120 / 60 = 0
    expect(result[1].time).toBe(2); // 1 * 120 / 60 = 2
  });
});

describe("CumulativeDamage", () => {
  it("renders without crashing", () => {
    const { container } = render(<CumulativeDamage data={mockData} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<CumulativeDamage data={mockData} />);
    expect(screen.getByTestId("cumulative-damage")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<CumulativeDamage data={mockData} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("Cumulative Damage");
  });

  it("renders chart container when data is provided", () => {
    render(<CumulativeDamage data={mockData} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when data is undefined", () => {
    render(<CumulativeDamage data={undefined} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("defaults to first target when targetId not provided", () => {
    render(<CumulativeDamage data={mockData} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when targets is missing", () => {
    render(<CumulativeDamage data={{ bucket_size: 60 }} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
