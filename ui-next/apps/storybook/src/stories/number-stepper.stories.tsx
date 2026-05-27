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

// `args` is required by the Storybook type because `value` is a required
// prop on NumberStepper, but each story uses `render` with a Controlled
// wrapper that manages its own state. `args.value` here is a type stub.
const stubArgs = { value: 0 } as const;

export const Default: Story = {
  args: stubArgs,
  render: () => <Controlled initial={1} aria-label="Iterations" />,
};

export const WithSuffix: Story = {
  args: stubArgs,
  render: () => (
    <Controlled initial={60} step={5} min={0} max={120} suffix="s" aria-label="Duration" />
  ),
};

export const Percent: Story = {
  args: stubArgs,
  render: () => (
    <Controlled initial={50} step={5} min={0} max={100} suffix="%" aria-label="Volume" />
  ),
};

export const ClampedAtMax: Story = {
  args: stubArgs,
  render: () => <Controlled initial={10} min={0} max={10} aria-label="Workers" />,
};

export const Disabled: Story = {
  args: stubArgs,
  render: () => <Controlled initial={5} disabled aria-label="Disabled" />,
};
