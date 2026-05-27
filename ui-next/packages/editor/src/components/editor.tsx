import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import {
  Button,
  Card,
  NumberStepper,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusPill,
  type StatusPillStatus,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@gcsim/primitives";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import type { GcsimError } from "../diagnostics/diagnostics";
import { applyDiagnostics, clearDiagnostics } from "../diagnostics/diagnostics";
import { gcsimFoldService } from "../language/fold";
import { gcsim } from "../language/gcsim-language";
import { gcsimDarkTheme, gcsimHighlightStyle } from "../theme/dark-theme";

/** Editor parse status — mapped to a StatusPill in the footer chrome. */
export type EditorParseStatus = "ok" | "parsing" | "error" | "idle";

const PARSE_STATUS_MAP: Record<EditorParseStatus, StatusPillStatus> = {
  ok: "ready",
  parsing: "running",
  error: "failed",
  idle: "idle",
};

const PARSE_STATUS_LABEL: Record<EditorParseStatus, string> = {
  ok: "OK",
  parsing: "Parsing…",
  error: "Errors",
  idle: "Idle",
};

export interface EditorTab {
  value: string;
  label: string;
}

export interface EditorProps {
  /** Current config text (controlled) */
  value: string;
  /** Called when the user edits the document */
  onChange?: (value: string) => void;
  /** When true, the editor is not editable */
  readOnly?: boolean;
  /** Validation errors to display as gutter markers */
  errors?: GcsimError[];
  /** Font size in px. Default 14. Reconfigured via CodeMirror Compartment. */
  fontSize?: number;
  /** Called when the user adjusts font size via the chrome stepper. */
  onFontSizeChange?: (value: number) => void;
  /** Theme name. Only `gcsim-dark` ships today. */
  theme?: "gcsim-dark";
  /** CSS class for the outer container */
  className?: string;

  // ---- optional chrome (header + footer) ----

  /** When true, renders the header + footer shell around the CodeMirror surface. */
  showChrome?: boolean;
  /** Tab definitions for the header. */
  tabs?: EditorTab[];
  /** Currently active tab value (controlled). */
  activeTab?: string;
  /** Called when the user switches tabs. */
  onTabChange?: (value: string) => void;
  /** Called when the user clicks the Format button in the header. */
  onFormat?: () => void;
  /** Parse status — drives the footer StatusPill. */
  parseStatus?: EditorParseStatus;
  /** Right-aligned slot in the footer (e.g. inline option badges). */
  optionsBadges?: ReactNode;
}

interface CursorPos {
  line: number;
  col: number;
  totalLines: number;
}

/**
 * Builds a CodeMirror theme that only sets the editor font-size. Used
 * inside a Compartment so the size can be reconfigured at runtime.
 */
const fontSizeTheme = (px: number) => EditorView.theme({ "&": { fontSize: `${px}px` } });

export const Editor: FC<EditorProps> = ({
  value,
  onChange,
  readOnly = false,
  errors,
  fontSize = 14,
  onFontSizeChange,
  theme = "gcsim-dark",
  className,
  showChrome = false,
  tabs,
  activeTab,
  onTabChange,
  onFormat,
  parseStatus = "idle",
  optionsBadges,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const readOnlyCompartment = useRef(new Compartment());
  const fontSizeCompartment = useRef(new Compartment());

  const [cursor, setCursor] = useState<CursorPos>({ line: 1, col: 1, totalLines: 1 });

  // Keep onChange ref current without recreating extensions
  onChangeRef.current = onChange;

  // Create editor on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally mount-only — value/readOnly/fontSize synced via dedicated effects below
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current?.(update.state.doc.toString());
      }
      if (update.docChanged || update.selectionSet) {
        const head = update.state.selection.main.head;
        const lineObj = update.state.doc.lineAt(head);
        setCursor({
          line: lineObj.number,
          col: head - lineObj.from + 1,
          totalLines: update.state.doc.lines,
        });
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        // Language + autocomplete
        gcsim(),
        syntaxHighlighting(gcsimHighlightStyle),

        // Theme
        gcsimDarkTheme,
        fontSizeCompartment.current.of(fontSizeTheme(fontSize)),

        // Folding (independent of parser — uses brace matching)
        gcsimFoldService,
        foldGutter(),
        keymap.of(foldKeymap),

        // Standard features
        lineNumbers(),
        bracketMatching(),
        indentOnInput(),
        history(),
        lintGutter(),
        highlightSelectionMatches(),
        closeBrackets(),

        // Autocomplete
        autocompletion({ activateOnTyping: true }),

        // Keybindings
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
        ]),

        // Tab size
        EditorState.tabSize.of(2),

        // Read-only (via Compartment for dynamic toggling)
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),

        // Change listener
        updateListener,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    // Initialise the cursor state from the initial doc so the footer
    // shows a meaningful line count before any user interaction.
    setCursor({ line: 1, col: 1, totalLines: view.state.doc.lines });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Sync external value changes (controlled component pattern)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  // Sync readOnly changes via Compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Sync fontSize via Compartment
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fontSizeCompartment.current.reconfigure(fontSizeTheme(fontSize)),
    });
  }, [fontSize]);

  // Sync errors -> diagnostics
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (errors && errors.length > 0) {
      applyDiagnostics(view, errors);
    } else {
      clearDiagnostics(view);
    }
  }, [errors]);

  const editorSurface = <div ref={containerRef} className={showChrome ? undefined : className} />;

  if (!showChrome) {
    return editorSurface;
  }

  return (
    <Card data-slot="editor-shell" data-theme={theme} className={className}>
      <div
        data-slot="editor-header"
        className="flex items-center justify-between gap-2 border-b border-[var(--line-1)] px-3 py-2"
      >
        <div data-slot="editor-header-left" className="flex items-center gap-2">
          {tabs && tabs.length > 0 ? (
            <Tabs value={activeTab} onValueChange={onTabChange} data-slot="editor-tabs">
              <TabsList variant="pill" size="sm">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}
        </div>
        <div data-slot="editor-header-right" className="flex items-center gap-2">
          <div data-slot="editor-font-size">
            <NumberStepper
              value={fontSize}
              min={12}
              max={20}
              step={1}
              suffix="px"
              aria-label="Editor font size"
              onChange={onFontSizeChange}
              disabled={!onFontSizeChange}
            />
          </div>
          {/* Visual placeholder; enable when a second theme ships. */}
          <Select value={theme} disabled data-slot="editor-theme-select">
            <SelectTrigger size="sm" aria-label="Editor theme" title="Only one theme available">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gcsim-dark">gcsim-dark</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFormat}
            disabled={!onFormat}
            data-slot="editor-format"
          >
            Format
          </Button>
        </div>
      </div>

      <div data-slot="editor-body" className="relative">
        {editorSurface}
      </div>

      <div
        data-slot="editor-footer"
        className="flex items-center justify-between gap-2 border-t border-[var(--line-1)] bg-[var(--bg-2)] px-3 py-1.5 text-xs text-[var(--fg-2)]"
      >
        <div className="flex items-center gap-3">
          <StatusPill status={PARSE_STATUS_MAP[parseStatus]} data-slot="editor-parse-status">
            {PARSE_STATUS_LABEL[parseStatus]}
          </StatusPill>
          <span className="font-mono tabular-nums" data-slot="editor-line-count">
            {cursor.totalLines} {cursor.totalLines === 1 ? "line" : "lines"}
          </span>
          <span className="font-mono tabular-nums" data-slot="editor-cursor-pos">
            Ln {cursor.line}, Col {cursor.col}
          </span>
        </div>
        <div data-slot="editor-options-badges" className="flex items-center gap-1">
          {optionsBadges}
        </div>
      </div>
    </Card>
  );
};
