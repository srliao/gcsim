import { CharacterCard, CharacterCardEmpty } from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";
import type { Meta, StoryObj } from "@storybook/react";

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
  sets: { crimsonwitchofflames: 4 },
};

const xingqiu: Sim.Character = {
  name: "xingqiu",
  level: 90,
  element: "hydro",
  max_level: 90,
  cons: 6,
  weapon: { name: "sacrificialsword", refine: 5, level: 90, max_level: 90 },
  talents: { attack: 1, skill: 10, burst: 13 },
  stats: [],
  snapshot: [],
  sets: { emblemofseveredfate: 4 },
};

const splitSets: Sim.Character = {
  ...hutao,
  name: "bennett",
  element: "pyro",
  cons: 0,
  weapon: { name: "freedomsworn", refine: 1, level: 90, max_level: 90 },
  sets: { noblesseoblige: 2, crimsonwitchofflames: 2 },
};

const meta = {
  title: "Avatar/CharacterCard",
  component: CharacterCard,
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hutao: Story = {
  args: { char: hutao },
  render: (args: { char: Sim.Character }) => (
    <div className="w-[320px]">
      <CharacterCard {...args} />
    </div>
  ),
};

export const Xingqiu: Story = {
  args: { char: xingqiu },
  render: (args: { char: Sim.Character }) => (
    <div className="w-[320px]">
      <CharacterCard {...args} />
    </div>
  ),
};

export const SplitSets: Story = {
  args: { char: splitSets },
  render: (args: { char: Sim.Character }) => (
    <div className="w-[320px]">
      <CharacterCard {...args} />
    </div>
  ),
};

export const NoSets: Story = {
  args: { char: { ...hutao, sets: {} } },
  render: (args: { char: Sim.Character }) => (
    <div className="w-[320px]">
      <CharacterCard {...args} />
    </div>
  ),
};

export const SideBySide: Story = {
  args: { char: hutao },
  render: () => (
    <div className="grid grid-cols-2 gap-4" style={{ width: 680 }}>
      <CharacterCard char={hutao} />
      <CharacterCard char={xingqiu} />
      <CharacterCard char={splitSets} />
      <CharacterCardEmpty slot={4} />
    </div>
  ),
};

export const Empty: Story = {
  args: { char: hutao },
  render: () => (
    <div className="w-[320px]">
      <CharacterCardEmpty slot={2} />
    </div>
  ),
};
