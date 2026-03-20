import { TeamDisplay } from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";
import type { Meta, StoryObj } from "@storybook/react";

const makeChar = (name: string, element: string, cons: number): Sim.Character => ({
  name,
  level: 90,
  element,
  max_level: 90,
  cons,
  weapon: { name: "weapon", refine: 1, level: 90, max_level: 90 },
  talents: { attack: 10, skill: 10, burst: 10 },
  stats: [],
  snapshot: [],
  sets: {},
});

const fullTeam = [
  makeChar("hutao", "pyro", 1),
  makeChar("xingqiu", "hydro", 6),
  makeChar("zhongli", "geo", 0),
  makeChar("kazuha", "anemo", 0),
];

const meta = {
  title: "Avatar/TeamDisplay",
  component: TeamDisplay,
  tags: ["autodocs"],
} satisfies Meta<typeof TeamDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullTeam: Story = {
  args: { characters: fullTeam },
};

export const TwoCharacters: Story = {
  args: { characters: fullTeam.slice(0, 2) },
};

export const SingleCharacter: Story = {
  args: { characters: fullTeam.slice(0, 1) },
};

export const EmptyTeam: Story = {
  args: { characters: [] },
};
