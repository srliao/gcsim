import type * as React from "react";

import { cn } from "../../lib/utils.js";

interface KbdProps extends React.ComponentProps<"kbd"> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Small mono keyboard cap. Used for ⌘K hints and shortcut tooltips.
 * 10px font, raised bg, double-thickness bottom border to suggest a key.
 */
function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border border-b-2 border-[var(--line-2)] bg-[var(--bg-2)] px-1 py-px font-mono text-[10px] text-[var(--fg-1)]",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export type { KbdProps };
export { Kbd };
