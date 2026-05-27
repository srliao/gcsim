import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Button variants.
 *
 * Migration note (Phase 2): callers should prefer `variant="primary"` over
 * the legacy `variant="default"`. Both are wired to the brand `--accent`
 * tokens so they render identically; `default` is kept as a backwards-compat
 * alias and may be removed in a future major. Likewise, `size="md"` is the
 * canonical name; `size="default"` is kept as an alias for the same 32px height.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // `primary` is the canonical brand button. `default` is kept as a
        // backwards-compat alias and shares the same styles.
        primary:
          "bg-[var(--accent)] font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent-line)]",
        default:
          "bg-[var(--accent)] font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent-line)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 32px — canonical default. `default` is an alias for `md`.
        md: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        // 22px
        xs: "h-[22px] gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        // 26px
        sm: "h-[26px] gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        // 38px
        lg: "h-[38px] gap-1.5 px-3 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        // 32×32
        icon: "size-8",
        "icon-xs":
          "size-[22px] rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-[26px] rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-[38px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Render the button as its single child via Radix Slot, forwarding
     * variant classes and props onto that child.
     *
     * NOTE: When `asChild` is `true`, `leading` and `trailing` are ignored —
     * Radix Slot expects exactly one child element, so we can't inject
     * wrapper spans around the consumer's child.
     */
    asChild?: boolean;
    /** Icon or node rendered before children. Ignored when `asChild` is true. */
    leading?: React.ReactNode;
    /** Icon or node rendered after children. Ignored when `asChild` is true. */
    trailing?: React.ReactNode;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  leading,
  trailing,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  // When `asChild` is true, Radix Slot expects exactly one child element, so
  // we only inject the leading/trailing wrappers in the non-Slot case.
  const content =
    asChild || (!leading && !trailing) ? (
      children
    ) : (
      <>
        {leading ? (
          <span data-slot="button-leading" className="inline-flex shrink-0 items-center">
            {leading}
          </span>
        ) : null}
        {children}
        {trailing ? (
          <span data-slot="button-trailing" className="inline-flex shrink-0 items-center">
            {trailing}
          </span>
        ) : null}
      </>
    );

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {content}
    </Comp>
  );
}

export type { ButtonProps };
export { Button, buttonVariants };
