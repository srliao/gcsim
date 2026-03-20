import { DPSCard } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Viewer/DPSCard",
  component: DPSCard,
  tags: ["autodocs"],
} satisfies Meta<typeof DPSCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    characterName: "hutao",
    stat: { min: 20000, max: 45000, mean: 35100, sd: 3200 },
    maxDPS: 35100,
  },
};

export const PartialBar: Story = {
  args: {
    characterName: "xingqiu",
    stat: { min: 10000, max: 25000, mean: 15150, sd: 2100 },
    maxDPS: 35100,
  },
};

export const NoData: Story = {
  args: {
    characterName: "unknown",
    stat: undefined,
  },
};

export const MultipleCharacters: Story = {
  args: { characterName: "hutao" },
  render: () => {
    const maxDPS = 35100;
    return (
      <div className="flex flex-col gap-2 w-[400px]">
        <DPSCard
          characterName="hutao"
          stat={{ min: 20000, max: 45000, mean: 35100, sd: 3200 }}
          maxDPS={maxDPS}
        />
        <DPSCard
          characterName="xingqiu"
          stat={{ min: 10000, max: 25000, mean: 15150, sd: 2100 }}
          maxDPS={maxDPS}
        />
        <DPSCard
          characterName="zhongli"
          stat={{ min: 500, max: 3000, mean: 1200, sd: 400 }}
          maxDPS={maxDPS}
        />
        <DPSCard
          characterName="kazuha"
          stat={{ min: 2000, max: 8000, mean: 4500, sd: 1100 }}
          maxDPS={maxDPS}
        />
      </div>
    );
  },
};
