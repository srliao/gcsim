import type { Sim } from "@gcsim/types";
import { TeamHeader } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const makeChar = (
  name: string,
  element: string,
  cons: number,
  weaponName: string,
  refine: number,
): Sim.Character => ({
  name,
  level: 90,
  element,
  max_level: 90,
  cons,
  weapon: { name: weaponName, refine, level: 90, max_level: 90 },
  talents: { attack: 10, skill: 10, burst: 10 },
  stats: [],
  snapshot: [],
  sets: {},
});

const team = [
  makeChar("hutao", "pyro", 1, "staffofhoma", 1),
  makeChar("xingqiu", "hydro", 6, "sacrificialsword", 5),
  makeChar("zhongli", "geo", 0, "blacktassel", 5),
  makeChar("kazuha", "anemo", 0, "freedomsworn", 1),
];

const meta = {
  title: "Viewer/TeamHeader",
  component: TeamHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof TeamHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullTeam: Story = {
  args: { characters: team },
};

export const TwoCharacters: Story = {
  args: { characters: team.slice(0, 2) },
};

export const Empty: Story = {
  args: { characters: [] },
};
