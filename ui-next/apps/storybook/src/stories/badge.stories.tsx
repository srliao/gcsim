import { Badge } from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    tone: {
      control: "select",
      options: [
        undefined,
        "neutral",
        "accent",
        "ok",
        "warn",
        "error",
        "info",
        "anemo",
        "geo",
        "electro",
        "hydro",
        "pyro",
        "cryo",
        "dendro",
        "physical",
      ],
    },
    soft: { control: "boolean" },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Destructive: Story = {
  args: { children: "Destructive", variant: "destructive" },
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

export const Accent: Story = {
  args: { children: "Accent", tone: "accent" },
};

export const WithDot: Story = {
  args: { children: "Ready", tone: "ok", dot: true },
};

export const Outlined: Story = {
  args: { children: "Beta", tone: "accent", soft: false },
};

export const StatusTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral" dot>
        Neutral
      </Badge>
      <Badge tone="accent" dot>
        Accent
      </Badge>
      <Badge tone="ok" dot>
        OK
      </Badge>
      <Badge tone="warn" dot>
        Warn
      </Badge>
      <Badge tone="error" dot>
        Error
      </Badge>
      <Badge tone="info" dot>
        Info
      </Badge>
    </div>
  ),
};

export const ElementTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="anemo">Anemo</Badge>
      <Badge tone="geo">Geo</Badge>
      <Badge tone="electro">Electro</Badge>
      <Badge tone="hydro">Hydro</Badge>
      <Badge tone="pyro">Pyro</Badge>
      <Badge tone="cryo">Cryo</Badge>
      <Badge tone="dendro">Dendro</Badge>
      <Badge tone="physical">Physical</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
