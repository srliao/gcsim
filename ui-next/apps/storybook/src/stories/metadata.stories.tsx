import { Commit, Iterations, Mode, Warnings } from "@gcsim/viewer";
import type { Meta, StoryObj } from "@storybook/react";

export default {
  title: "Viewer/Metadata",
  tags: ["autodocs"],
} satisfies Meta;

export const IterationsStory: StoryObj = {
  name: "Iterations",
  render: () => <Iterations iterations={1000} />,
};

export const IterationsLarge: StoryObj = {
  name: "Iterations (large number)",
  render: () => <Iterations iterations={100000} />,
};

export const ModeSL: StoryObj = {
  name: "Mode: SL",
  render: () => <Mode mode={0} />,
};

export const ModeTTK: StoryObj = {
  name: "Mode: TTK",
  render: () => <Mode mode={1} />,
};

export const CommitInfo: StoryObj = {
  name: "Commit",
  render: () => <Commit simVersion="2.5.0" buildDate="2026-03-19" />,
};

export const CommitVersionOnly: StoryObj = {
  name: "Commit (version only)",
  render: () => <Commit simVersion="2.5.0" />,
};

export const NoWarnings: StoryObj = {
  name: "Warnings (none active)",
  render: () => (
    <Warnings
      warnings={{
        target_overlap: false,
        insufficient_energy: false,
        insufficient_stamina: false,
        swap_cd: false,
        skill_cd: false,
        dash_cd: false,
        burst_cd: false,
      }}
    />
  ),
};

export const ActiveWarnings: StoryObj = {
  name: "Warnings (active)",
  render: () => (
    <Warnings
      warnings={{
        target_overlap: false,
        insufficient_energy: true,
        insufficient_stamina: false,
        swap_cd: true,
        skill_cd: false,
        dash_cd: false,
        burst_cd: true,
      }}
    />
  ),
};

export const AllTogether: StoryObj = {
  name: "All metadata together",
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-sm">
        <Iterations iterations={1000} />
        <Mode mode={0} />
        <Commit simVersion="2.5.0" buildDate="2026-03-19" />
      </div>
      <Warnings
        warnings={{
          target_overlap: false,
          insufficient_energy: true,
          insufficient_stamina: false,
          swap_cd: false,
          skill_cd: false,
          dash_cd: false,
          burst_cd: false,
        }}
      />
    </div>
  ),
};
