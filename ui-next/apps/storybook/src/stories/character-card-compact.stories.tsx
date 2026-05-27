import { CharacterCardCompact } from "@gcsim/avatar";
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
  ...hutao,
  name: "xingqiu",
  element: "hydro",
  cons: 6,
  weapon: { name: "sacrificialsword", refine: 5, level: 90, max_level: 90 },
  sets: { emblemofseveredfate: 4 },
};

const bennett: Sim.Character = {
  ...hutao,
  name: "bennett",
  cons: 0,
  weapon: { name: "freedomsworn", refine: 1, level: 90, max_level: 90 },
  sets: { noblesseoblige: 2, crimsonwitchofflames: 2 },
};

const kazuha: Sim.Character = {
  ...hutao,
  name: "kazuha",
  element: "anemo",
  cons: 0,
  weapon: { name: "freedomsworn", refine: 1, level: 90, max_level: 90 },
  sets: { viridescentvenerer: 4 },
};

const meta = {
  title: "Avatar/CharacterCardCompact",
  component: CharacterCardCompact,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number", min: 48, max: 240, step: 4 } },
  },
} satisfies Meta<typeof CharacterCardCompact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { char: hutao, size: 84 },
};

export const SplitSets: Story = {
  args: { char: bennett, size: 84 },
};

export const Larger: Story = {
  args: { char: xingqiu, size: 120 },
};

export const Row: Story = {
  args: { char: hutao },
  render: () => (
    <div className="flex gap-2">
      <CharacterCardCompact char={hutao} />
      <CharacterCardCompact char={xingqiu} />
      <CharacterCardCompact char={bennett} />
      <CharacterCardCompact char={kazuha} />
    </div>
  ),
};

export const SizeRange: Story = {
  args: { char: hutao },
  render: () => (
    <div className="flex items-end gap-2">
      <CharacterCardCompact char={hutao} size={48} />
      <CharacterCardCompact char={hutao} size={64} />
      <CharacterCardCompact char={hutao} size={84} />
      <CharacterCardCompact char={hutao} size={120} />
    </div>
  ),
};
