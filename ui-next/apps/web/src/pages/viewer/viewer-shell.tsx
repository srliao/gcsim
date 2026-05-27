import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useSimulatorStore } from "../../stores/simulator-store";
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
  const setConfig = useSimulatorStore((s) => s.setConfig);
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const handleCopyConfig = useCallback(() => {
    if (!results?.config_file) return;
    navigator.clipboard
      .writeText(results.config_file)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy config:", err);
      });
  }, [results?.config_file]);

  const handleSendToSimulator = useCallback(() => {
    if (!results?.config_file) return;
    setConfig(results.config_file);
    navigate({ to: "/simulator" });
  }, [results?.config_file, setConfig, navigate]);

  const handleShare = useCallback(() => {
    // TODO(phase 9): wire Share button to real share endpoint
    console.log("Share clicked", results?.config_file?.slice(0, 80));
  }, [results?.config_file]);

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
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "results" | "config" | "sample")}
    >
      {/* Sticky header: tabs left, action buttons right */}
      <header
        data-testid="viewer-header"
        className="sticky top-14 z-[var(--z-sticky)] border-b border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div data-testid="viewer-header-tabs">
            <TabsList variant="underline">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="sample">Sample</TabsTrigger>
            </TabsList>
          </div>
          <div data-testid="viewer-header-actions" className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyConfig}
              data-testid="viewer-action-copy"
              aria-label="Copy config to clipboard"
            >
              {copied ? "Copied!" : "Copy Config"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendToSimulator}
              data-testid="viewer-action-send"
              aria-label="Send config to simulator"
            >
              Send To Simulator
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleShare}
              data-testid="viewer-action-share"
              aria-label="Share results"
            >
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4">
        <TabsContent value="results">
          <ResultsTab results={results} />
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab results={results} />
        </TabsContent>
        <TabsContent value="sample">
          <SampleTab results={results} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
