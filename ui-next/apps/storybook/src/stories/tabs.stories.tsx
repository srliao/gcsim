import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gcsim/primitives";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="results" className="w-[400px]">
      <TabsList variant="pill">
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="sample">Sample</TabsTrigger>
      </TabsList>
      <TabsContent value="results">
        <p className="p-4 text-sm text-muted-foreground">Results content goes here.</p>
      </TabsContent>
      <TabsContent value="config">
        <p className="p-4 text-sm text-muted-foreground">Config content goes here.</p>
      </TabsContent>
      <TabsContent value="sample">
        <p className="p-4 text-sm text-muted-foreground">Sample content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="results" className="w-[400px]">
      <TabsList variant="underline">
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="sample">Sample</TabsTrigger>
      </TabsList>
      <TabsContent value="results">
        <p className="p-4 text-sm text-muted-foreground">Results content goes here.</p>
      </TabsContent>
      <TabsContent value="config">
        <p className="p-4 text-sm text-muted-foreground">Config content goes here.</p>
      </TabsContent>
      <TabsContent value="sample">
        <p className="p-4 text-sm text-muted-foreground">Sample content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Tabs defaultValue="a" className="w-[300px]">
      <TabsList variant="pill" size="sm">
        <TabsTrigger value="a">One</TabsTrigger>
        <TabsTrigger value="b">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="a">
        <p className="p-4 text-sm text-muted-foreground">A</p>
      </TabsContent>
      <TabsContent value="b">
        <p className="p-4 text-sm text-muted-foreground">B</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="results" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="sample">Sample</TabsTrigger>
      </TabsList>
      <TabsContent value="results">
        <p className="p-4 text-sm text-muted-foreground">Default uses pill styling.</p>
      </TabsContent>
      <TabsContent value="config">
        <p className="p-4 text-sm text-muted-foreground">Config content.</p>
      </TabsContent>
      <TabsContent value="sample">
        <p className="p-4 text-sm text-muted-foreground">Sample content.</p>
      </TabsContent>
    </Tabs>
  ),
};
