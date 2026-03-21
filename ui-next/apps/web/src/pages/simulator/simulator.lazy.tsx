import { createLazyRoute } from "@tanstack/react-router";
import { Simulator } from "./simulator";

export const Route = createLazyRoute("/simulator")({
  component: Simulator,
});
