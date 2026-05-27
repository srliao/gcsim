import { Portrait } from "@gcsim/avatar";
import type { Sim } from "@gcsim/types";
import type { Meta, StoryObj } from "@storybook/react";

const makeChar = (name: string, element: string, cons = 0): Sim.Character => ({
  name,
  level: 90,
  element,
  max_level: 90,
  cons,
  weapon: { name: "", refine: 1, level: 90, max_level: 90 },
  talents: { attack: 9, skill: 9, burst: 9 },
  stats: [],
  snapshot: [],
  sets: {},
});

const meta = {
  title: "Avatar/Portrait",
  component: Portrait,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number", min: 16, max: 256, step: 4 } },
    cons: { control: { type: "number", min: 0, max: 6, step: 1 } },
    frame: { control: "boolean" },
  },
} satisfies Meta<typeof Portrait>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromStringKey: Story = {
  args: { char: "hutao", size: 64 },
};

export const FromCharacter: Story = {
  args: { char: makeChar("hutao", "pyro", 1), size: 64, cons: 1 },
};

export const WithConsChip: Story = {
  args: { char: makeChar("xingqiu", "hydro"), size: 96, cons: 6 },
};

export const Frameless: Story = {
  args: { char: makeChar("kazuha", "anemo"), size: 96, frame: false },
};

export const UnknownFallback: Story = {
  args: { char: "ganyu", size: 96 },
};

export const AllElements: Story = {
  args: { char: "hutao", size: 64 },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Portrait char={makeChar("hutao", "pyro")} size={72} />
      <Portrait char={makeChar("xingqiu", "hydro")} size={72} />
      <Portrait char={makeChar("raiden", "electro")} size={72} />
      <Portrait char={makeChar("ayaka", "cryo")} size={72} />
      <Portrait char={makeChar("kazuha", "anemo")} size={72} />
      <Portrait char={makeChar("zhongli", "geo")} size={72} />
      <Portrait char={makeChar("nahida", "dendro")} size={72} />
    </div>
  ),
};

export const SizeRange: Story = {
  args: { char: "hutao" },
  render: () => (
    <div className="flex items-end gap-3">
      <Portrait char={makeChar("hutao", "pyro")} size={24} />
      <Portrait char={makeChar("hutao", "pyro")} size={32} />
      <Portrait char={makeChar("hutao", "pyro")} size={48} />
      <Portrait char={makeChar("hutao", "pyro")} size={64} />
      <Portrait char={makeChar("hutao", "pyro")} size={96} />
      <Portrait char={makeChar("hutao", "pyro")} size={128} />
    </div>
  ),
};
