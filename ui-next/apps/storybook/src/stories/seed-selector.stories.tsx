import type { Sim } from "@gcsim/types";
import { SeedSelector } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const mockResult: Sim.SimResults = {
  sample_seed: "12345",
  statistics: {
    min_seed: "111",
    max_seed: "999",
    p25_seed: "250",
    p50_seed: "500",
    p75_seed: "750",
    iterations: 1000,
    runtime: 2.5,
  },
};

const meta = {
  title: "Viewer/SeedSelector",
  component: SeedSelector,
  tags: ["autodocs"],
  args: {
    onGenerate: (seed: string) => console.log("Generate seed:", seed),
  },
} satisfies Meta<typeof SeedSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    result: mockResult,
  },
};

export const Disabled: Story = {
  args: {
    result: mockResult,
    disabled: true,
  },
};

export const NoSeeds: Story = {
  args: {
    result: {} as Sim.SimResults,
  },
};
