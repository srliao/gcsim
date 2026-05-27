import { Kbd } from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { children: "⌘K" },
};

export const Sequence: Story = {
  render: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  ),
};

export const InText: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>⌘</Kbd>
      <Kbd>K</Kbd> to open the command palette, or <Kbd>Esc</Kbd> to close.
    </p>
  ),
};
