import { createRootRoute, createRoute, Outlet, redirect } from "@tanstack/react-router";
import { ErrorBoundary } from "./components/error-boundary";
import { Footer } from "./components/footer";
import { Nav } from "./components/nav";

// Root layout route
const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  ),
});

// / - Dashboard (home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
}).lazy(() => import("./pages/dash/dash.lazy").then((d) => d.Route));

// /simulator
const simulatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "simulator",
}).lazy(() => import("./pages/simulator/simulator.lazy").then((d) => d.Route));

// /web - Web Viewer
const webRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "web",
}).lazy(() => import("./pages/viewer/web-viewer.lazy").then((d) => d.Route));

// /local - Local Viewer
const localRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "local",
}).lazy(() => import("./pages/viewer/local-viewer.lazy").then((d) => d.Route));

// /sh/$id - Share Viewer
const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sh/$id",
}).lazy(() => import("./pages/viewer/share-viewer.lazy").then((d) => d.Route));

// /sample/upload
const sampleUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sample/upload",
}).lazy(() => import("./pages/sample/upload.lazy").then((d) => d.Route));

// /sample/local
const sampleLocalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sample/local",
}).lazy(() => import("./pages/sample/local.lazy").then((d) => d.Route));

// Legacy redirects — keep old URLs working
const legacyShareV3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "v3/viewer/share/$id",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/sh/$id", params: { id: params.id } });
  },
});

const legacyShareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "viewer/share/$id",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/sh/$id", params: { id: params.id } });
  },
});

const legacyShortShareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "s/$id",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/sh/$id", params: { id: params.id } });
  },
});

const legacyViewerWebRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "viewer/web",
  beforeLoad: () => {
    throw redirect({ to: "/web" });
  },
});

const legacyViewerLocalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "viewer/local",
  beforeLoad: () => {
    throw redirect({ to: "/local" });
  },
});

const legacySimpleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "simple",
  beforeLoad: () => {
    throw redirect({ to: "/simulator" });
  },
});

const legacyAdvancedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "advanced",
  beforeLoad: () => {
    throw redirect({ to: "/simulator" });
  },
});

const legacyViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "viewer",
  beforeLoad: () => {
    throw redirect({ to: "/web" });
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  simulatorRoute,
  webRoute,
  localRoute,
  shareRoute,
  sampleUploadRoute,
  sampleLocalRoute,
  legacyShareV3Route,
  legacyShareRoute,
  legacyShortShareRoute,
  legacyViewerWebRoute,
  legacyViewerLocalRoute,
  legacySimpleRoute,
  legacyAdvancedRoute,
  legacyViewerRoute,
]);
