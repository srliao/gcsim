import { createLazyRoute } from "@tanstack/react-router";
import { UploadSample } from "./upload";

export const Route = createLazyRoute("/sample/upload")({
  component: UploadSample,
});
