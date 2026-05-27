import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DistributionChart, transformHistogram } from "./distribution-chart.js";

const mockStat: Sim.SummaryStat = {
  min: 35000,
  max: 65000,
  mean: 50250,
  sd: 4200,
  histogram: [5, 15, 50, 150, 300, 250, 130, 60, 30, 10],
};

describe("transformHistogram", () => {
  it("produces correct bucket count", () => {
    const result = transformHistogram(mockStat);
    expect(result.buckets).toHaveLength(10);
  });

  it("produces correct bucket counts matching histogram values", () => {
    const result = transformHistogram(mockStat);
    expect(result.buckets[0].count).toBe(5);
    expect(result.buckets[4].count).toBe(300);
    expect(result.buckets[9].count).toBe(10);
  });

  it("bucket ranges are correct", () => {
    // Range = 30000, 10 buckets => 3000 each
    // First bucket: 35000 to 38000
    const result = transformHistogram(mockStat);
    expect(result.buckets[0].bucket).toBe("35.0K-38.0K");
    expect(result.buckets[1].bucket).toBe("38.0K-41.0K");
  });

  it("returns empty buckets when histogram is missing", () => {
    const result = transformHistogram({ min: 0, max: 100 });
    expect(result.buckets).toHaveLength(0);
  });

  it("returns empty buckets when histogram is empty array", () => {
    const result = transformHistogram({ ...mockStat, histogram: [] });
    expect(result.buckets).toHaveLength(0);
  });

  it("calculates mean reference index correctly", () => {
    // mean=50250, min=35000, max=65000, range=30000, bucketSize=3000
    // index = (50250 - 35000) / 3000 = 5.083... => bucket index 5
    // bucket 5: lo = 35000 + 5*3000 = 50000, hi = 53000 => "50.0K-53.0K"
    const result = transformHistogram(mockStat);
    expect(result.meanBucket).toBe("50.0K-53.0K");
  });
});

describe("DistributionChart", () => {
  it("renders with sample SummaryStat data", () => {
    render(<DistributionChart stat={mockStat} label="DPS Distribution" />);
    expect(screen.getByTestId("chart-shell")).toBeInTheDocument();
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("DPS Distribution");
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when histogram is missing", () => {
    render(<DistributionChart stat={{ min: 0, max: 100, mean: 50 }} label="DPS Distribution" />);
    expect(screen.getByTestId("chart-shell-empty")).toBeInTheDocument();
  });

  it("renders empty state when histogram is empty", () => {
    render(<DistributionChart stat={{ ...mockStat, histogram: [] }} label="DPS Distribution" />);
    expect(screen.getByTestId("chart-shell-empty")).toBeInTheDocument();
  });
});
