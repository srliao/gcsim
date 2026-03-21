import { createLazyRoute } from "@tanstack/react-router";
import { WebViewer } from "./web-viewer";

export const Route = createLazyRoute("/web")({
  component: WebViewer,
});
