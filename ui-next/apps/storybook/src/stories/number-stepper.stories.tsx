import { NumberStepper } from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Primitives/NumberStepper",
  component: NumberStepper,
  tags: ["autodocs"],
} satisfies Meta<typeof NumberStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({
  initial = 0,
  ...rest
}: { initial?: number } & Omit<React.ComponentProps<typeof NumberStepper>, "value" | "onChange">) {
  const [v, setV] = useState(initial);
  return <NumberStepper {...rest} value={v} onChange={setV} />;
}

export const Default: Story = {
  render: () => <Controlled initial={1} aria-label="Iterations" />,
};

export const WithSuffix: Story = {
  render: () => (
    <Controlled initial={60} step={5} min={0} max={120} suffix="s" aria-label="Duration" />
  ),
};

export const Percent: Story = {
  render: () => (
    <Controlled initial={50} step={5} min={0} max={100} suffix="%" aria-label="Volume" />
  ),
};

export const ClampedAtMax: Story = {
  render: () => <Controlled initial={10} min={0} max={10} aria-label="Workers" />,
};

export const Disabled: Story = {
  render: () => <Controlled initial={5} disabled aria-label="Disabled" />,
};
