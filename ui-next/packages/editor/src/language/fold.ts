import { foldService } from "@codemirror/language";

export const gcsimFoldService = foldService.of((state, lineStart) => {
  const line = state.doc.lineAt(lineStart);
  const text = line.text.trimEnd();

  if (text.endsWith("{")) {
    let depth = 1;
    let pos = line.to + 1;
    while (pos < state.doc.length && depth > 0) {
      const ch = state.doc.sliceString(pos, pos + 1);
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if (depth === 0) return { from: line.to, to: pos };
      pos++;
    }
  }
  return null;
});
