import { useRef, useEffect, type FC } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintGutter } from "@codemirror/lint";
import { gcsim } from "../language/gcsim-language";
import { gcsimDarkTheme, gcsimHighlightStyle } from "../theme/dark-theme";
import { gcsimFoldService } from "../language/fold";
import type { GcsimError } from "../diagnostics/diagnostics";
import { applyDiagnostics, clearDiagnostics } from "../diagnostics/diagnostics";

export interface EditorProps {
  /** Current config text (controlled) */
  value: string;
  /** Called when the user edits the document */
  onChange?: (value: string) => void;
  /** When true, the editor is not editable */
  readOnly?: boolean;
  /** Validation errors to display as gutter markers */
  errors?: GcsimError[];
  /** CSS class for the container div */
  className?: string;
}

export const Editor: FC<EditorProps> = ({
  value,
  onChange,
  readOnly = false,
  errors,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const readOnlyCompartment = useRef(new Compartment());

  // Keep onChange ref current without recreating extensions
  onChangeRef.current = onChange;

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current?.(update.state.doc.toString());
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

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly),
      ),
    });
  }, [readOnly]);

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

  return <div ref={containerRef} className={className} />;
};
