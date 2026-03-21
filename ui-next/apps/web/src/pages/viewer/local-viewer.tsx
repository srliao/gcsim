import { fetchLocalResult } from "@gcsim/api";
import { useQuery } from "@tanstack/react-query";
import { ViewerShell } from "./viewer-shell";

export function LocalViewer() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-result"],
    queryFn: () => fetchLocalResult(),
    retry: false,
  });

  return (
    <ViewerShell
      results={data ?? null}
      isLoading={isLoading}
      error={error ? String(error) : null}
    />
  );
}
