import { CharacterCard, CharacterCardEmpty } from "@gcsim/avatar";
import { Editor, type EditorParseStatus } from "@gcsim/editor";
import { useParsedTeam } from "@gcsim/preview";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  StatusPill,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@gcsim/primitives";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useExecutor } from "../../components/executor-provider";
import { ExecutorSettings } from "../../components/executor-settings";
import { useSimulatorStore } from "../../stores/simulator-store";
import { useViewerStore } from "../../stores/viewer-store";

type EditorTabValue = "actions" | "config" | "preview";

export function Simulator() {
  const executor = useExecutor();
  const navigate = useNavigate();
  const config = useSimulatorStore((s) => s.config);
  const setConfig = useSimulatorStore((s) => s.setConfig);
  const setResults = useViewerStore((s) => s.setResults);

  // Local UI state — kept page-level for now (no store changes required).
  const [activeTab, setActiveTab] = useState<EditorTabValue>("actions");
  const [fontSize, setFontSize] = useState(14);
  const [seed, setSeed] = useState("0x4a3f");
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Bound validate fn so the preview hook stays runtime-agnostic.
  const validateFn = useMemo(() => executor.validate.bind(executor), [executor]);
  const { team, errors, isLoading } = useParsedTeam(validateFn, config);

  useEffect(() => {
    let cancelled = false;
    executor.ready().then((ready) => {
      if (!cancelled) setIsReady(ready);
    });
    return () => {
      cancelled = true;
    };
  }, [executor]);

  const parseStatus: EditorParseStatus = isLoading
    ? "parsing"
    : errors.length > 0
      ? "error"
      : config.trim().length === 0
        ? "idle"
        : "ok";

  const parsedCount = team.length;
  const parsedTone = parsedCount === 4 ? "ok" : parsedCount > 0 ? "warn" : "neutral";

  const handleRun = useCallback(async () => {
    setRunError(null);
    setIsRunning(true);
    try {
      await executor.run(config, (result) => {
        setResults(result);
      });
      navigate({ to: "/web" });
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
    }
  }, [executor, config, setResults, navigate]);

  const handleCancel = useCallback(() => {
    executor.cancel();
    setIsRunning(false);
  }, [executor]);

  const editorTabs = [
    { value: "actions", label: "Action list" },
    { value: "config", label: "Config" },
    { value: "preview", label: "Preview" },
  ];

  // TODO(phase 5 follow-up): real "options" badges (iter/duration/workers) from parsed config.
  const optionsBadges = (
    <>
      <Badge tone="info">iter=1000</Badge>
      <Badge tone="info">duration=90</Badge>
      <Badge tone="info">workers=24</Badge>
    </>
  );

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 pb-24" data-testid="simulator-page">
        {/* TEAM PREVIEW SECTION */}
        <section data-testid="team-preview-section" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Team preview</h2>
              <p className="mt-1 text-xs text-[var(--fg-2)]">
                Auto-derived from the action list below — edit the code to change the team
              </p>
            </div>
            <Badge tone={parsedTone} dot data-testid="parser-status-badge">
              parsed · {parsedCount}/4
            </Badge>
          </div>

          <div
            data-testid="team-preview-grid"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {team.slice(0, 4).map((char) => (
              <CharacterCard key={char.name} char={char} />
            ))}
            {Array.from({ length: Math.max(0, 4 - team.length) }).map((_, i) => {
              const slotNumber = team.length + i + 1;
              return <CharacterCardEmpty key={`empty-${slotNumber}`} slot={slotNumber} />;
            })}
          </div>
        </section>

        {/* EDITOR SECTION */}
        <section data-testid="editor-section" className="space-y-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as EditorTabValue)}
            data-testid="editor-tabs"
          >
            <TabsList variant="underline" size="md" className="mb-2">
              {editorTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="actions">
              <Editor
                value={config}
                onChange={setConfig}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                showChrome
                tabs={editorTabs}
                activeTab={activeTab}
                onTabChange={(v) => setActiveTab(v as EditorTabValue)}
                parseStatus={parseStatus}
                optionsBadges={optionsBadges}
                className="min-h-[520px]"
              />
            </TabsContent>

            <TabsContent value="config">
              <Editor
                value={config}
                onChange={setConfig}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                showChrome
                tabs={editorTabs}
                activeTab={activeTab}
                onTabChange={(v) => setActiveTab(v as EditorTabValue)}
                parseStatus={parseStatus}
                optionsBadges={optionsBadges}
                className="min-h-[520px]"
              />
            </TabsContent>

            <TabsContent value="preview">
              <div
                data-testid="preview-tab-placeholder"
                className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line-2)] bg-[var(--bg-1)] p-8 text-center text-sm text-[var(--fg-2)]"
              >
                <div className="font-medium text-foreground">Preview coming soon</div>
                <p className="mt-2 max-w-md text-xs">
                  {/* TODO(phase 5 follow-up): wire Preview tab to @gcsim/preview */}
                  Live preview of the parsed run summary will land in a follow-up — the team banner
                  above already reflects the parsed config.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {errors.length > 0 ? (
            <ul
              data-testid="parser-error-list"
              className="rounded-md border border-[var(--error-soft)] bg-[var(--error-soft)]/30 p-3 text-xs text-[var(--error)]"
            >
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <footer
        data-testid="action-bar"
        className="sticky bottom-0 z-[var(--z-sticky)] border-t border-[var(--line-1)] bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setSettingsOpen(true)}
              data-testid="settings-button"
            >
              <span aria-hidden>⚙</span> Settings
            </Button>
            <StatusPill status={isReady ? "ready" : "idle"} data-testid="wasm-status-pill">
              {isReady ? "WASM ready" : "WASM loading"}
            </StatusPill>
            <span className="font-mono text-xs text-[var(--fg-2)]">untitled.gcsl</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setToolsOpen(true)}
              data-testid="tools-button"
            >
              <span aria-hidden>🔧</span> Tools
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--fg-2)]" htmlFor="seed-input">
              SEED
            </label>
            <Input
              id="seed-input"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-32 font-mono text-xs"
              data-testid="seed-input"
            />
            {isRunning ? (
              <Button
                type="button"
                variant="destructive"
                size="md"
                onClick={handleCancel}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleRun}
                disabled={!isReady || isRunning}
                data-testid="run-button"
              >
                <span aria-hidden>▶</span> Run
              </Button>
            )}
          </div>
        </div>
        {runError ? (
          <div
            className="border-t border-[var(--error-soft)] bg-[var(--error-soft)]/30 px-4 py-2 text-center text-xs text-[var(--error)]"
            data-testid="run-error"
          >
            {runError}
          </div>
        ) : null}
      </footer>

      {/* SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent data-testid="settings-dialog">
          <DialogHeader>
            <DialogTitle>Executor settings</DialogTitle>
            <DialogDescription>
              Configure how the simulator runs. Changes persist across sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <ExecutorSettings />
          </div>
        </DialogContent>
      </Dialog>

      {/* TOOLS DIALOG */}
      <Dialog open={toolsOpen} onOpenChange={setToolsOpen}>
        <DialogContent data-testid="tools-dialog">
          <DialogHeader>
            <DialogTitle>Tools</DialogTitle>
            <DialogDescription>Import character data from external sources.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="enka">
            <TabsList variant="pill" size="sm" className="mb-3">
              <TabsTrigger value="enka">Enka</TabsTrigger>
              <TabsTrigger value="good">GOOD</TabsTrigger>
            </TabsList>
            <TabsContent value="enka">
              <div
                data-testid="tools-enka-placeholder"
                className="rounded-md border border-dashed border-[var(--line-2)] p-6 text-center text-sm text-[var(--fg-2)]"
              >
                {/* TODO(phase 5 follow-up): wire Enka/GOOD import flows */}
                Enka import coming soon.
              </div>
            </TabsContent>
            <TabsContent value="good">
              <div
                data-testid="tools-good-placeholder"
                className="rounded-md border border-dashed border-[var(--line-2)] p-6 text-center text-sm text-[var(--fg-2)]"
              >
                {/* TODO(phase 5 follow-up): wire Enka/GOOD import flows */}
                GOOD import coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
