import { createLazyRoute } from "@tanstack/react-router";
import { LocalSample } from "./local";

export const Route = createLazyRoute("/sample/local")({
  component: LocalSample,
});
