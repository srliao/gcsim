import { AvatarCard } from "@gcsim/avatar";
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

const meta = {
  title: "Avatar/AvatarCard",
  component: AvatarCard,
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hutao: Story = {
  args: { character: hutao },
};

export const Xingqiu: Story = {
  args: { character: xingqiu },
};

export const SideBySide: Story = {
  args: { character: hutao },
  render: () => (
    <div className="flex gap-4">
      <AvatarCard character={hutao} />
      <AvatarCard character={xingqiu} />
    </div>
  ),
};
