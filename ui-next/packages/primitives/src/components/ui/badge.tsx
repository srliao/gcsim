import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Tone palette covering status semantics + Genshin element colors.
 * When `tone` is set on a `<Badge>`, it overrides the legacy `variant`.
 */
export type BadgeTone =
  | "neutral"
  | "accent"
  | "ok"
  | "warn"
  | "error"
  | "info"
  | "anemo"
  | "geo"
  | "electro"
  | "hydro"
  | "pyro"
  | "cryo"
  | "dendro"
  | "physical";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Tone → soft fill className map. Each value sets both background and text
 * using the appropriate `--<tone>` / `--<tone>-soft` CSS tokens.
 */
const toneSoftStyles: Record<BadgeTone, string> = {
  neutral: "bg-[var(--bg-2)] text-[var(--fg-1)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
  error: "bg-[var(--error-soft)] text-[var(--error)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  anemo: "bg-[var(--el-anemo-soft)] text-[var(--el-anemo)]",
  geo: "bg-[var(--el-geo-soft)] text-[var(--el-geo)]",
  electro: "bg-[var(--el-electro-soft)] text-[var(--el-electro)]",
  hydro: "bg-[var(--el-hydro-soft)] text-[var(--el-hydro)]",
  pyro: "bg-[var(--el-pyro-soft)] text-[var(--el-pyro)]",
  cryo: "bg-[var(--el-cryo-soft)] text-[var(--el-cryo)]",
  dendro: "bg-[var(--el-dendro-soft)] text-[var(--el-dendro)]",
  physical: "bg-[var(--el-physical-soft)] text-[var(--el-physical)]",
};

/** Tone → outlined (non-soft) styles. */
const toneOutlinedStyles: Record<BadgeTone, string> = {
  neutral: "border-[var(--line-2)] text-[var(--fg-1)]",
  accent: "border-[var(--accent-line)] text-[var(--accent)]",
  ok: "border-[var(--ok)]/40 text-[var(--ok)]",
  warn: "border-[var(--warn)]/40 text-[var(--warn)]",
  error: "border-[var(--error)]/40 text-[var(--error)]",
  info: "border-[var(--info)]/40 text-[var(--info)]",
  anemo: "border-[var(--el-anemo)]/40 text-[var(--el-anemo)]",
  geo: "border-[var(--el-geo)]/40 text-[var(--el-geo)]",
  electro: "border-[var(--el-electro)]/40 text-[var(--el-electro)]",
  hydro: "border-[var(--el-hydro)]/40 text-[var(--el-hydro)]",
  pyro: "border-[var(--el-pyro)]/40 text-[var(--el-pyro)]",
  cryo: "border-[var(--el-cryo)]/40 text-[var(--el-cryo)]",
  dendro: "border-[var(--el-dendro)]/40 text-[var(--el-dendro)]",
  physical: "border-[var(--el-physical)]/40 text-[var(--el-physical)]",
};

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    /**
     * Semantic tone. When set, overrides `variant` styling. Defaults to
     * undefined so legacy `variant`-only callers keep their current look.
     */
    tone?: BadgeTone;
    /** When tone is set: soft fill (default true) vs outlined. */
    soft?: boolean;
    /** Render a 6px circle of the current tone color before content. */
    dot?: boolean;
    /** Custom node rendered before children (after the dot). */
    leading?: React.ReactNode;
  };

function Badge({
  className,
  variant = "default",
  asChild = false,
  tone,
  soft = true,
  dot = false,
  leading,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";

  // When tone is provided, it overrides variant styles entirely.
  const toneClass = tone ? (soft ? toneSoftStyles[tone] : toneOutlinedStyles[tone]) : undefined;

  // Compose the content. asChild expects a single child, so we only inject
  // dot/leading wrappers in the non-Slot case.
  const content =
    asChild || (!dot && !leading) ? (
      children
    ) : (
      <>
        {dot ? (
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-current"
          />
        ) : null}
        {leading ? (
          <span data-slot="badge-leading" className="inline-flex shrink-0 items-center">
            {leading}
          </span>
        ) : null}
        {children}
      </>
    );

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      className={cn(tone ? badgeVariants({}) : badgeVariants({ variant }), toneClass, className)}
      {...props}
    >
      {content}
    </Comp>
  );
}

export type { BadgeProps };
export { Badge, badgeVariants };
