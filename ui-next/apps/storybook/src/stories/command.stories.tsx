import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primitives/Command",
  component: Command,
  tags: ["autodocs"],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <div className="w-[420px]">
      <Command>
        <CommandInput placeholder="Search characters, weapons, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Characters">
            <CommandItem value="hutao">
              Hu Tao
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem value="ayaka">Ayaka</CommandItem>
            <CommandItem value="raiden">Raiden Shogun</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="skill">
              skill
              <CommandShortcut>⌘X</CommandShortcut>
            </CommandItem>
            <CommandItem value="burst">burst</CommandItem>
            <CommandItem value="attack">attack</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const WithEmptyState: Story = {
  args: {},
  render: () => (
    <div className="w-[420px]">
      <Command defaultValue="">
        <CommandInput placeholder="Type 'xxx' to see empty state..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Items">
            <CommandItem value="placeholder">Sample item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};
