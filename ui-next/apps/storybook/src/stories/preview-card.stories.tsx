import { PreviewCard } from "@gcsim/preview";
import type { Sim } from "@gcsim/types";
import type { Meta, StoryObj } from "@storybook/react";

const mockData: Sim.SimResults = {
  mode: 0,
  modified: false,
  character_details: [
    { name: "hutao", element: "pyro", level: 90, max_level: 90, cons: 1 },
    { name: "xingqiu", element: "hydro", level: 90, max_level: 90, cons: 6 },
    { name: "zhongli", element: "geo", level: 90, max_level: 90, cons: 0 },
    { name: "kazuha", element: "anemo", level: 90, max_level: 90, cons: 0 },
  ],
  simulator_settings: { iterations: 1000, delays: { swap: 1 } },
  statistics: {
    iterations: 1000,
    runtime: 2.5,
    dps: { min: 35000, max: 65000, mean: 50250, sd: 4200 },
    character_dps: [
      { min: 20000, max: 45000, mean: 35100, sd: 3200 },
      { min: 10000, max: 25000, mean: 15150, sd: 2100 },
      { min: 500, max: 3000, mean: 1200, sd: 400 },
      { min: 2000, max: 8000, mean: 4500, sd: 1100 },
    ],
    warnings: {
      target_overlap: false,
      insufficient_energy: false,
      insufficient_stamina: false,
      swap_cd: false,
      skill_cd: false,
      dash_cd: false,
      burst_cd: false,
    },
  },
};

const meta = {
  title: "Preview/PreviewCard",
  component: PreviewCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockData,
    onImageLoaded: () => console.log("Images loaded"),
  },
};

export const Modified: Story = {
  args: {
    data: { ...mockData, modified: true },
  },
};

export const WithWarnings: Story = {
  args: {
    data: {
      ...mockData,
      statistics: {
        ...mockData.statistics!,
        warnings: { ...mockData.statistics!.warnings!, swap_cd: true, insufficient_energy: true },
      },
    },
  },
};

export const TwoCharacters: Story = {
  args: {
    data: {
      ...mockData,
      character_details: mockData.character_details!.slice(0, 2),
      statistics: {
        ...mockData.statistics!,
        character_dps: mockData.statistics!.character_dps!.slice(0, 2),
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    data: {
      mode: 0,
    } as Sim.SimResults,
  },
};
