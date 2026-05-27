import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useViewerStore } from "../../stores/viewer-store";
import { ConfigTab } from "./config-tab";
import { ResultsTab } from "./results-tab";
import { SampleTab } from "./sample-tab";

interface ViewerShellProps {
  results: Sim.SimResults | null;
  isLoading: boolean;
  error: string | null;
}

export function ViewerShell({ results, isLoading, error }: ViewerShellProps) {
  const activeTab = useViewerStore((s) => s.activeTab);
  const setActiveTab = useViewerStore((s) => s.setActiveTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-4 text-muted-foreground">
        <p>No results loaded.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "results" | "config" | "sample")}
      >
        <TabsList variant="underline">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="sample">Sample</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <ResultsTab results={results} />
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab results={results} />
        </TabsContent>
        <TabsContent value="sample">
          <SampleTab results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
