import { Minus, Plus } from "lucide-react";
import type * as React from "react";

import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";

interface NumberStepperProps {
  value: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  /** Increment / decrement step. Default 1. */
  step?: number;
  /** Optional unit suffix (e.g. "s", "%"). */
  suffix?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

function clamp(v: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && v < min) return min;
  if (max !== undefined && v > max) return max;
  return v;
}

/**
 * `[−] [value] [+]` numeric stepper. The value text uses
 * `font-mono tabular-nums` for stable widths. Values are clamped to
 * `[min, max]` before being emitted via `onChange`.
 */
function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
  disabled,
  "aria-label": ariaLabel,
}: NumberStepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  const handleDecrement: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (disabled || atMin) return;
    onChange?.(clamp(value - step, min, max));
  };

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (disabled || atMax) return;
    onChange?.(clamp(value + step, min, max));
  };

  return (
    <fieldset
      data-slot="number-stepper"
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn("m-0 inline-flex items-center gap-1 border-0 p-0", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleDecrement}
        disabled={disabled || atMin}
        aria-label="Decrement"
        data-slot="number-stepper-decrement"
      >
        <Minus />
      </Button>
      <span
        data-slot="number-stepper-value"
        className="inline-flex min-w-8 items-center justify-center px-1 font-mono text-sm tabular-nums text-foreground"
        aria-live="polite"
      >
        {value}
        {suffix ? <span className="ml-0.5 text-muted-foreground">{suffix}</span> : null}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleIncrement}
        disabled={disabled || atMax}
        aria-label="Increment"
        data-slot="number-stepper-increment"
      >
        <Plus />
      </Button>
    </fieldset>
  );
}

export type { NumberStepperProps };
export { NumberStepper };
