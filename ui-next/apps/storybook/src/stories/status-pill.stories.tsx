import { StatusPill } from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primitives/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["ready", "running", "queued", "failed", "idle"],
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = { args: { status: "ready" } };
export const Running: Story = { args: { status: "running" } };
export const Queued: Story = { args: { status: "queued" } };
export const Failed: Story = { args: { status: "failed" } };
export const Idle: Story = { args: { status: "idle" } };

export const CustomLabel: Story = {
  args: { status: "ready", children: "WASM ready" },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusPill status="ready" />
      <StatusPill status="running" />
      <StatusPill status="queued" />
      <StatusPill status="failed" />
      <StatusPill status="idle" />
    </div>
  ),
};
