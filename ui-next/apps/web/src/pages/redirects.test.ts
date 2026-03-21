import { describe, expect, it } from "vitest";
import { routeTree } from "../routes";

// Helper: find a route in the tree by matching its path option
// biome-ignore lint/suspicious/noExplicitAny: route tree internals are not publicly typed
function findRoute(pathSegment: string): any {
  // biome-ignore lint/suspicious/noExplicitAny: route tree internals are not publicly typed
  const children = (routeTree as any).children ?? [];
  // biome-ignore lint/suspicious/noExplicitAny: route tree internals are not publicly typed
  return children.find((r: any) => r.options?.path === pathSegment || r.path === pathSegment);
}

describe("legacy redirects", () => {
  const paramRedirects = [
    { path: "v3/viewer/share/$id", target: "/sh/$id" },
    { path: "viewer/share/$id", target: "/sh/$id" },
    { path: "s/$id", target: "/sh/$id" },
  ];

  const staticRedirects = [
    { path: "viewer/web", target: "/web" },
    { path: "viewer/local", target: "/local" },
    { path: "simple", target: "/simulator" },
    { path: "advanced", target: "/simulator" },
    { path: "viewer", target: "/web" },
  ];

  for (const { path, target } of paramRedirects) {
    it(`redirects /${path} to ${target}`, () => {
      const route = findRoute(path);
      expect(route).toBeDefined();
      expect(route.options.beforeLoad).toBeDefined();
      expect(() => route.options.beforeLoad({ params: { id: "test-123" } })).toThrow();
    });
  }

  for (const { path, target } of staticRedirects) {
    it(`redirects /${path} to ${target}`, () => {
      const route = findRoute(path);
      expect(route).toBeDefined();
      expect(route.options.beforeLoad).toBeDefined();
      expect(() => route.options.beforeLoad({})).toThrow();
    });
  }

  it("route tree contains all 8 legacy redirect routes", () => {
    // biome-ignore lint/suspicious/noExplicitAny: route tree internals are not publicly typed
    const children = (routeTree as any).children ?? [];
    const allPaths = [...paramRedirects, ...staticRedirects].map((r) => r.path);
    for (const path of allPaths) {
      // biome-ignore lint/suspicious/noExplicitAny: route tree internals are not publicly typed
      const found = children.some((r: any) => r.options?.path === path || r.path === path);
      expect(found, `expected route "${path}" to exist in route tree`).toBe(true);
    }
  });
});
