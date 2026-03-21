import { createLazyRoute } from "@tanstack/react-router";
import { Dash } from "./dash";

export const Route = createLazyRoute("/")({
  component: Dash,
});
