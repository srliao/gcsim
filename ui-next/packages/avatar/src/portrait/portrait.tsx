import { cn } from "@gcsim/primitives";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

const elementColorClasses: Record<string, string> = {
  anemo: "text-anemo",
  geo: "text-geo",
  electro: "text-electro",
  hydro: "text-hydro",
  pyro: "text-pyro",
  cryo: "text-cryo",
  dendro: "text-dendro",
};

const elementBgClasses: Record<string, string> = {
  anemo: "border-anemo/40",
  geo: "border-geo/40",
  electro: "border-electro/40",
  hydro: "border-hydro/40",
  pyro: "border-pyro/40",
  cryo: "border-cryo/40",
  dendro: "border-dendro/40",
};

export interface PortraitProps {
  characterKey: string;
  element?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Portrait({ characterKey, element, size = "md", className }: PortraitProps) {
  const initial = characterKey ? characterKey[0]?.toUpperCase() : "?";
  const borderClass = element ? elementBgClasses[element] : "border-muted";
  const elementColor = element ? elementColorClasses[element] : undefined;

  return (
    <div
      data-testid="portrait"
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border-2 bg-muted font-semibold",
        sizeClasses[size],
        borderClass,
        className,
      )}
    >
      <span data-testid="portrait-initial">{initial}</span>
      {element ? (
        <span
          data-testid="portrait-element"
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full bg-background px-1 text-[0.6em] font-bold leading-tight",
            elementColor,
          )}
        >
          {element}
        </span>
      ) : null}
    </div>
  );
}
