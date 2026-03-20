import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { gcsimCompletionSource } from "./autocomplete";
import { parser } from "./parser";

const gcsimLanguage = LRLanguage.define({
  name: "gcsim",
  parser: parser.configure({
    props: [
      styleTags({
        LineComment: t.lineComment,
        HashComment: t.lineComment,
        BlockComment: t.blockComment,
        Number: t.number,
        StringLiteral: t.string,
        CharacterName: t.className,
        ActionName: t.function(t.variableName),
        StatName: t.attributeName,
        ElementName: t.atom,
        Identifier: t.variableName,
        Operator: t.operator,
        Punctuation: t.punctuation,
      }),
    ],
  }),
  languageData: {
    commentTokens: {
      line: "//",
      block: { open: "/*", close: "*/" },
    },
    closeBrackets: {
      brackets: ["(", "[", "{", "'", '"', "`"],
    },
  },
});

export function gcsim(): LanguageSupport {
  return new LanguageSupport(gcsimLanguage, [
    gcsimLanguage.data.of({
      autocomplete: gcsimCompletionSource,
    }),
  ]);
}
