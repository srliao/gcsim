import { createLazyRoute } from "@tanstack/react-router";
import { LocalViewer } from "./local-viewer";

export const Route = createLazyRoute("/local")({
  component: LocalViewer,
});
