import { fetchShareResult } from "@gcsim/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ViewerShell } from "./viewer-shell";

export function ShareViewer() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data, isLoading, error } = useQuery({
    queryKey: ["share-result", id],
    queryFn: () => fetchShareResult(id),
    enabled: !!id,
  });

  return (
    <ViewerShell
      results={data ?? null}
      isLoading={isLoading}
      error={error ? String(error) : null}
    />
  );
}
