import { Portrait } from "@gcsim/avatar";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Avatar/Portrait",
  component: Portrait,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    element: {
      control: "select",
      options: ["pyro", "hydro", "electro", "cryo", "anemo", "geo", "dendro"],
    },
  },
} satisfies Meta<typeof Portrait>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { characterKey: "hutao", element: "pyro", size: "md" },
};

export const Small: Story = {
  args: { characterKey: "xingqiu", element: "hydro", size: "sm" },
};

export const Large: Story = {
  args: { characterKey: "raiden", element: "electro", size: "lg" },
};

export const NoElement: Story = {
  args: { characterKey: "unknown" },
};

export const AllElements: Story = {
  args: { characterKey: "hutao" },
  render: () => (
    <div className="flex items-center gap-4">
      <Portrait characterKey="hutao" element="pyro" size="lg" />
      <Portrait characterKey="xingqiu" element="hydro" size="lg" />
      <Portrait characterKey="raiden" element="electro" size="lg" />
      <Portrait characterKey="ganyu" element="cryo" size="lg" />
      <Portrait characterKey="kazuha" element="anemo" size="lg" />
      <Portrait characterKey="zhongli" element="geo" size="lg" />
      <Portrait characterKey="nahida" element="dendro" size="lg" />
    </div>
  ),
};

export const AllSizes: Story = {
  args: { characterKey: "hutao" },
  render: () => (
    <div className="flex items-end gap-4">
      <Portrait characterKey="hutao" element="pyro" size="sm" />
      <Portrait characterKey="hutao" element="pyro" size="md" />
      <Portrait characterKey="hutao" element="pyro" size="lg" />
    </div>
  ),
};
