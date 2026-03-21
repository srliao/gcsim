import { Editor } from "@gcsim/editor";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const sampleConfig = `# Sample gcsim config
bennett char lvl=90/90 cons=6;
bennett add weapon="favoniussword" refine=5 lvl=90/90;
bennett add set="noblesseoblige" count=4;
bennett add stats hp=4780 atk=311 atk%=0.466 er=0.518 cr=0.311;
bennett add stats hp%=0.058 atk%=0.152 er=0.11 cr=0.07 cd=0.272;

xiangling char lvl=90/90 cons=6;
xiangling add weapon="thecatch" refine=5 lvl=90/90;
xiangling add set="emblemofseveredfate" count=4;

active xiangling;
xiangling skill, burst;
bennett skill, burst;
while 1 {
  xiangling attack:4, skill;
  bennett attack:4, skill;
}
`;

const meta: Meta<typeof Editor> = {
  title: "Editor/Editor",
  component: Editor,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div
        style={{ height: 400, border: "1px solid #45475a", borderRadius: 8, overflow: "hidden" }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: sampleConfig,
    className: "h-full",
  },
};

export const Empty: Story = {
  args: {
    value: "",
    className: "h-full",
  },
};

export const ReadOnly: Story = {
  args: {
    value: sampleConfig,
    readOnly: true,
    className: "h-full",
  },
};

export const WithErrors: Story = {
  args: {
    value: "bennett char lvl=90/90;\nunknown_command foo bar;",
    errors: [{ line: 2, message: "unknown command: unknown_command" }],
    className: "h-full",
  },
};

export const Controlled: Story = {
  args: { value: sampleConfig, className: "h-full" },
  render: () => {
    const [value, setValue] = useState(sampleConfig);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Editor value={value} onChange={setValue} className="h-full" />
        </div>
        <div style={{ color: "#6c7086", fontSize: 12 }}>{value.length} characters</div>
      </div>
    );
  },
};
