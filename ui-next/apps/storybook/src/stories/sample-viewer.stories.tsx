import type { Sim } from "@gcsim/types";
import { SampleViewer } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const emptyWeapon = { name: "", level: 0, max_level: 0, refine: 0 };
const emptyTalents = { attack: 0, skill: 0, burst: 0 };

const mockResult: Sim.SimResults = {
  sample_seed: "12345",
  config_file: "hutao char lvl=90/90 cons=1;\nactive hutao;",
  character_details: [
    {
      name: "hutao",
      element: "pyro",
      level: 90,
      max_level: 90,
      cons: 1,
      weapon: emptyWeapon,
      talents: emptyTalents,
      stats: [],
      snapshot: [],
      sets: {},
    },
    {
      name: "xingqiu",
      element: "hydro",
      level: 90,
      max_level: 90,
      cons: 6,
      weapon: emptyWeapon,
      talents: emptyTalents,
      stats: [],
      snapshot: [],
      sets: {},
    },
  ],
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

const mockSample: Sim.Sample = {
  seed: "12345",
  config: "test",
  initial_character: "hutao",
  character_details: mockResult.character_details,
  logs: [
    {
      char_index: 0,
      ended: 0,
      event: "action",
      frame: 1,
      msg: "hutao uses normal attack",
      logs: { target: "target-1" },
    },
    {
      char_index: 0,
      ended: 0,
      event: "damage",
      frame: 1,
      msg: "hutao deals 12450 pyro damage",
      logs: { damage: 12450, crit: true, target: "target-1" },
    },
    {
      char_index: 1,
      ended: 0,
      event: "energy",
      frame: 3,
      msg: "xingqiu receives 3 particles",
      logs: { source: "skill", "rec'd": 3 },
    },
    {
      char_index: 0,
      ended: 0,
      event: "action",
      frame: 5,
      msg: "hutao uses elemental skill",
      logs: { target: "target-1" },
    },
  ],
};

const meta = {
  title: "Viewer/SampleViewer",
  component: SampleViewer,
  tags: ["autodocs"],
} satisfies Meta<typeof SampleViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    result: mockResult,
    onRequestSample: async () => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500));
      return mockSample;
    },
  },
};

export const WithError: Story = {
  args: {
    result: mockResult,
    onRequestSample: async () => {
      await new Promise((r) => setTimeout(r, 300));
      throw new Error("Failed to generate sample: server unavailable");
    },
  },
};

export const NoConfig: Story = {
  args: {
    result: { ...mockResult, config_file: undefined },
    onRequestSample: async () => mockSample,
  },
};
