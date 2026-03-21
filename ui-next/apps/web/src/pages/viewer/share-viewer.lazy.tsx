import { createLazyRoute } from "@tanstack/react-router";
import { ShareViewer } from "./share-viewer";

export const Route = createLazyRoute("/sh/$id")({
  component: ShareViewer,
});
