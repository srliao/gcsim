import type { Sim } from "@gcsim/types";
import { DPSCard } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/DPSCard",
  component: DPSCard,
  tags: ["autodocs"],
} satisfies Meta<typeof DPSCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const hutao: Sim.Character = {
  name: "hutao",
  level: 90,
  element: "pyro",
  max_level: 90,
  cons: 1,
  weapon: { name: "staffofhoma", refine: 1, level: 90, max_level: 90 },
  talents: { attack: 10, skill: 10, burst: 10 },
  stats: [],
  snapshot: [],
  sets: {},
};

const xingqiu: Sim.Character = {
  ...hutao,
  name: "xingqiu",
  element: "hydro",
  cons: 6,
  weapon: { name: "sacrificialsword", refine: 5, level: 90, max_level: 90 },
};

const zhongli: Sim.Character = {
  ...hutao,
  name: "zhongli",
  element: "geo",
  cons: 0,
  weapon: { name: "vortexvanquisher", refine: 1, level: 90, max_level: 90 },
};

const kazuha: Sim.Character = {
  ...hutao,
  name: "kazuha",
  element: "anemo",
  cons: 0,
  weapon: { name: "freedomsworn", refine: 1, level: 90, max_level: 90 },
};

export const Default: Story = {
  args: {
    char: hutao,
    dps: 35100,
    share: 0.65,
    mean: 35100,
    std: 3200,
  },
};

export const WithExplicitRole: Story = {
  args: {
    char: hutao,
    dps: 35100,
    share: 1,
    mean: 35100,
    std: 3200,
    role: "Main DPS",
  },
};

export const FromStringKey: Story = {
  args: {
    char: "hutao",
    dps: 35100,
    share: 1,
    mean: 35100,
    std: 3200,
  },
};

export const PartialBar: Story = {
  args: {
    char: xingqiu,
    dps: 15150,
    share: 0.28,
    mean: 15150,
    std: 2100,
  },
};

export const TeamGrid: Story = {
  args: { char: hutao, dps: 0, share: 0, mean: 0, std: 0 },
  render: () => {
    const total = 35100 + 15150 + 4500 + 1200;
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2" style={{ width: 560 }}>
        <DPSCard char={hutao} dps={35100} share={35100 / total} mean={35100} std={3200} />
        <DPSCard char={xingqiu} dps={15150} share={15150 / total} mean={15150} std={2100} />
        <DPSCard char={kazuha} dps={4500} share={4500 / total} mean={4500} std={1100} />
        <DPSCard char={zhongli} dps={1200} share={1200 / total} mean={1200} std={400} />
      </div>
    );
  },
};
