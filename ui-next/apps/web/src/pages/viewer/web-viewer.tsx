import { useViewerStore } from "../../stores/viewer-store";
import { ViewerShell } from "./viewer-shell";

export function WebViewer() {
  const results = useViewerStore((s) => s.results);
  const error = useViewerStore((s) => s.error);

  return <ViewerShell results={results} isLoading={false} error={error} />;
}
