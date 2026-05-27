import type * as React from "react";

import { Badge, type BadgeTone } from "./badge.js";

export type StatusPillStatus = "ready" | "running" | "queued" | "failed" | "idle";

interface StatusConfig {
  tone: BadgeTone;
  label: string;
}

const STATUS_MAP: Record<StatusPillStatus, StatusConfig> = {
  ready: { tone: "ok", label: "Ready" },
  running: { tone: "info", label: "Running" },
  queued: { tone: "warn", label: "Queued" },
  failed: { tone: "error", label: "Failed" },
  idle: { tone: "neutral", label: "Idle" },
};

interface StatusPillProps extends Omit<React.ComponentProps<"span">, "children"> {
  status?: StatusPillStatus;
  /** Optional override of the default status label. */
  children?: React.ReactNode;
}

/**
 * Thin wrapper over `Badge`. Maps a `status` to a tone + dot and a
 * sensible default label that callers can override via `children`.
 */
function StatusPill({ status = "ready", children, ...props }: StatusPillProps) {
  const { tone, label } = STATUS_MAP[status];
  return (
    <Badge data-slot="status-pill" data-status={status} tone={tone} dot {...props}>
      {children ?? label}
    </Badge>
  );
}

export type { StatusPillProps };
export { StatusPill };
