import type { Sim } from "@gcsim/types";
import { TargetInfoCard } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const singleTarget: Sim.Enemy[] = [
  {
    name: "target-1",
    level: 100,
    hp: 10000000,
    resist: {
      pyro: 0.1,
      hydro: 0.1,
      electro: 0.1,
      cryo: 0.1,
      anemo: 0.1,
      geo: 0.1,
      dendro: 0.1,
      physical: 0.1,
    },
    position: { x: 0, y: 0, r: 1 },
  },
];

const multipleTargets: Sim.Enemy[] = [
  {
    name: "boss",
    level: 100,
    hp: 20000000,
    resist: {
      pyro: 0.7,
      hydro: 0.1,
      electro: 0.1,
      cryo: 0.1,
      anemo: 0.1,
      geo: 0.1,
      dendro: 0.1,
      physical: 0.3,
    },
    position: { x: 0, y: 0, r: 2 },
  },
  {
    name: "add-1",
    level: 90,
    hp: 500000,
    resist: {
      pyro: 0.1,
      hydro: 0.1,
      electro: 0.1,
      cryo: 0.1,
      anemo: 0.1,
      geo: 0.1,
      dendro: 0.1,
      physical: 0.1,
    },
    position: { x: 3, y: 0, r: 1 },
  },
  {
    name: "add-2",
    level: 90,
    hp: 500000,
    resist: {
      pyro: 0.1,
      hydro: 0.1,
      electro: 0.1,
      cryo: 0.1,
      anemo: 0.1,
      geo: 0.1,
      dendro: 0.1,
      physical: 0.1,
    },
    position: { x: -3, y: 0, r: 1 },
  },
];

const meta = {
  title: "Viewer/TargetInfoCard",
  component: TargetInfoCard,
  tags: ["autodocs"],
} satisfies Meta<typeof TargetInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleTarget: Story = {
  args: { enemies: singleTarget },
};

export const MultipleTargets: Story = {
  args: { enemies: multipleTargets },
};

export const Empty: Story = {
  args: { enemies: [] },
};
