import "@testing-library/jest-dom/vitest";

// cmdk (and some Radix components) call ResizeObserver in effects; jsdom
// doesn't ship one. Provide a no-op stub so tests run.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom doesn't implement Element.prototype.scrollIntoView; cmdk calls it when
// the selected item changes. Stub it to a no-op so tests pass.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
