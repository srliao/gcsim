import type { FrameGroup, SimEvent } from "@gcsim/viewer";
import { EventLog } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

function makeEvent(
  overrides: Partial<SimEvent> & { type: SimEvent["type"]; message: string },
): SimEvent {
  return {
    frame: 0,
    characterIndex: 0,
    raw: { char_index: 0, ended: 0, event: "action", frame: 0, msg: "", logs: {} },
    ...overrides,
  } as SimEvent;
}

const sampleFrameGroups: FrameGroup[] = [
  {
    frame: 1,
    activeCharacter: 0,
    slots: [
      [],
      [
        makeEvent({
          type: "action",
          message: "hutao uses normal attack",
          action: "normal",
          target: "target-1",
        }),
        makeEvent({
          type: "damage",
          message: "hutao deals 12,450 pyro damage (crit)",
          damage: 12450,
          crit: true,
          amp: "",
          cata: "",
          target: "target-1",
        }),
      ],
      [],
      [],
    ],
  },
  {
    frame: 3,
    activeCharacter: 0,
    slots: [
      [],
      [
        makeEvent({
          type: "action",
          message: "hutao uses normal attack",
          action: "normal",
          target: "target-1",
        }),
        makeEvent({
          type: "damage",
          message: "hutao deals 8,200 pyro damage",
          damage: 8200,
          crit: false,
          amp: "",
          cata: "",
          target: "target-1",
        }),
      ],
      [
        makeEvent({
          type: "energy",
          message: "xingqiu receives 3 hydro particles",
          energyType: "particle" as const,
          source: "skill",
          amount: 3,
          postRecovery: 55,
          maxEnergy: 80,
        }),
      ],
      [],
    ],
  },
  {
    frame: 10,
    activeCharacter: 1,
    slots: [
      [makeEvent({ type: "status", message: "vaporize reaction triggered", key: "vaporize" })],
      [],
      [
        makeEvent({
          type: "action",
          message: "xingqiu uses elemental skill",
          action: "skill",
          target: "target-1",
        }),
        makeEvent({
          type: "damage",
          message: "xingqiu deals 5,300 hydro damage (crit)",
          damage: 5300,
          crit: true,
          amp: "",
          cata: "",
          target: "target-1",
        }),
      ],
      [],
    ],
  },
  {
    frame: 25,
    activeCharacter: 0,
    slots: [
      [],
      [
        makeEvent({
          type: "action",
          message: "hutao uses elemental skill",
          action: "skill",
          target: "target-1",
        }),
        makeEvent({
          type: "status",
          message: "blood blossom applied for 8s",
          key: "blood-blossom",
          addedFrame: 25,
          endedFrame: 505,
        }),
      ],
      [],
      [
        makeEvent({
          type: "energy",
          message: "zhongli receives 2 geo particles",
          energyType: "particle" as const,
          source: "skill",
          amount: 2,
          postRecovery: 30,
          maxEnergy: 40,
        }),
      ],
    ],
  },
];

const meta = {
  title: "Viewer/EventLog",
  component: EventLog,
  tags: ["autodocs"],
} satisfies Meta<typeof EventLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    frameGroups: sampleFrameGroups,
    characterNames: ["hutao", "xingqiu", "zhongli"],
  },
};

export const Empty: Story = {
  args: {
    frameGroups: [],
    characterNames: ["hutao", "xingqiu"],
  },
};

export const TwoCharacters: Story = {
  args: {
    frameGroups: sampleFrameGroups.map((g) => ({
      ...g,
      slots: g.slots.slice(0, 3),
    })),
    characterNames: ["hutao", "xingqiu"],
  },
};
