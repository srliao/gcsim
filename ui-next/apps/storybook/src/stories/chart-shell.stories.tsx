import { Badge, Button } from "@gcsim/primitives";
import { ChartShell } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/ChartShell",
  component: ChartShell,
  tags: ["autodocs"],
} satisfies Meta<typeof ChartShell>;

export default meta;
type Story = StoryObj<typeof meta>;

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-[var(--bg-2)] font-mono text-xs text-[var(--fg-2)]">
      {label}
    </div>
  );
}

export const Default: Story = {
  args: {
    title: "Damage Timeline",
    children: <Placeholder label="chart goes here" />,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Damage Timeline",
    subtitle: "per 30 frames · 1,000 iterations",
    children: <Placeholder label="chart goes here" />,
  },
};

export const WithBadgeAndAction: Story = {
  args: {
    title: "Damage Timeline",
    subtitle: "per 30 frames",
    badge: (
      <Badge tone="info" soft>
        beta
      </Badge>
    ),
    action: (
      <Button size="sm" variant="outline">
        Export
      </Button>
    ),
    children: <Placeholder label="chart" />,
  },
};

export const WithFooter: Story = {
  args: {
    title: "Element DPS",
    children: <Placeholder label="chart" />,
    footer: (
      <div className="flex flex-wrap items-center gap-3">
        <span>Pyro 32%</span>
        <span>Hydro 21%</span>
        <span>Cryo 18%</span>
        <span>Electro 14%</span>
      </div>
    ),
  },
};

export const Empty: Story = {
  args: {
    title: "Damage Timeline",
    children: null,
  },
};

export const CustomHeight: Story = {
  args: {
    title: "Tall chart",
    height: 480,
    children: <Placeholder label="taller chart" />,
  },
};
