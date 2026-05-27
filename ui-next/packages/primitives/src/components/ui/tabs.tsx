import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../../lib/utils.js";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

/**
 * Tabs list variants.
 *
 * Phase 2 migration: `pill` and `underline` are the new canonical names.
 * Legacy `default` / `line` are kept as backwards-compat aliases:
 * - `default` → `pill`
 * - `line` → `underline`
 *
 * Sizes: `md` (32px) is the default; `sm` is 28px.
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none data-[variant=underline]:rounded-none",
  {
    variants: {
      variant: {
        pill: "bg-muted",
        default: "bg-muted",
        underline: "gap-1 bg-transparent",
        line: "gap-1 bg-transparent",
      },
      size: {
        md: "group-data-horizontal/tabs:h-8",
        sm: "group-data-horizontal/tabs:h-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

function TabsList({ className, variant = "default", size = "md", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=pill]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none group-data-[variant=underline]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // underline / line: transparent backgrounds even when active
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=underline]/tabs-list:bg-transparent group-data-[variant=underline]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=underline]/tabs-list:data-active:border-transparent dark:group-data-[variant=underline]/tabs-list:data-active:bg-transparent",
        // active pill: bg/foreground inset
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        // underline indicator: a 2px line under the active tab
        "after:absolute after:bg-[var(--accent)] after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-[variant=underline]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export type { TabsListProps };
export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
