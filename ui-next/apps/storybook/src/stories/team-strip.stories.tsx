import { TeamStrip } from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";
import type { Meta, StoryObj } from "@storybook/react";

const makeChar = (
  name: string,
  element: string,
  cons: number,
  weapon = "freedomsworn",
  refine = 1,
  sets: Record<string, number> = { crimsonwitchofflames: 4 },
): Sim.Character => ({
  name,
  level: 90,
  element,
  max_level: 90,
  cons,
  weapon: { name: weapon, refine, level: 90, max_level: 90 },
  talents: { attack: 10, skill: 10, burst: 10 },
  stats: [],
  snapshot: [],
  sets,
});

const fullTeam: Sim.Character[] = [
  makeChar("hutao", "pyro", 1, "staffofhoma", 1, { crimsonwitchofflames: 4 }),
  makeChar("xingqiu", "hydro", 6, "sacrificialsword", 5, { emblemofseveredfate: 4 }),
  makeChar("zhongli", "geo", 0, "blacktassel", 1, { tenacityofthemillelith: 4 }),
  makeChar("kazuha", "anemo", 0, "freedomsworn", 1, { viridescentvenerer: 4 }),
];

const meta = {
  title: "Avatar/TeamStrip",
  component: TeamStrip,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number", min: 48, max: 160, step: 4 } },
  },
} satisfies Meta<typeof TeamStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullTeam: Story = {
  args: { team: fullTeam },
};

export const TwoCharacters: Story = {
  args: { team: fullTeam.slice(0, 2) },
};

export const SingleCharacter: Story = {
  args: { team: fullTeam.slice(0, 1) },
};

export const EmptyTeam: Story = {
  args: { team: [] },
};

export const Larger: Story = {
  args: { team: fullTeam, size: 120 },
};
