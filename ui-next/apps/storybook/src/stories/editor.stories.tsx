import { Editor, type EditorParseStatus } from "@gcsim/editor";
import { Badge } from "@gcsim/primitives";
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

const DEFAULT_TABS = [
  { value: "config", label: "Config" },
  { value: "action", label: "Action list" },
  { value: "preview", label: "Preview" },
];

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
        style={{
          height: 480,
          border: "1px solid var(--line-2, #45475a)",
          borderRadius: 8,
          overflow: "hidden",
        }}
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
        <div style={{ color: "var(--fg-3)", fontSize: 12 }}>{value.length} characters</div>
      </div>
    );
  },
};

/**
 * Editor with the full chrome shell — header (tabs + font-size stepper +
 * theme select + Format button) and footer (parse status + line count +
 * cursor pos + optional badges slot). All chrome props are optional;
 * existing call sites that omit `showChrome` are unaffected.
 */
export const WithChrome: Story = {
  args: { value: sampleConfig, className: "h-full" },
  render: () => {
    const [value, setValue] = useState(sampleConfig);
    const [tab, setTab] = useState("action");
    const [fontSize, setFontSize] = useState(14);
    return (
      <Editor
        value={value}
        onChange={setValue}
        showChrome
        tabs={DEFAULT_TABS}
        activeTab={tab}
        onTabChange={setTab}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onFormat={() => {
          // No-op for the story; apps wire a real formatter.
        }}
        parseStatus="ok"
        optionsBadges={
          <>
            <Badge tone="neutral">iter=100</Badge>
            <Badge tone="neutral">workers=4</Badge>
          </>
        }
        className="h-full"
      />
    );
  },
};

export const ChromeParseStatusOK: Story = {
  args: {
    value: sampleConfig,
    showChrome: true,
    tabs: DEFAULT_TABS,
    activeTab: "action",
    parseStatus: "ok",
    className: "h-full",
  },
};

export const ChromeParseStatusParsing: Story = {
  args: {
    value: sampleConfig,
    showChrome: true,
    tabs: DEFAULT_TABS,
    activeTab: "action",
    parseStatus: "parsing",
    className: "h-full",
  },
};

export const ChromeParseStatusError: Story = {
  args: {
    value: "bennett char lvl=90/90;\nunknown_command foo bar;",
    showChrome: true,
    tabs: DEFAULT_TABS,
    activeTab: "action",
    parseStatus: "error" as EditorParseStatus,
    errors: [{ line: 2, message: "unknown command: unknown_command" }],
    className: "h-full",
  },
};

export const ChromeParseStatusIdle: Story = {
  args: {
    value: "",
    showChrome: true,
    tabs: DEFAULT_TABS,
    activeTab: "config",
    parseStatus: "idle",
    className: "h-full",
  },
};
