import { cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { Portrait } from "../portrait/index.js";

export interface TeamDisplayProps {
  characters: Sim.Character[];
  className?: string;
}

export function TeamDisplay({ characters, className }: TeamDisplayProps) {
  if (characters.length === 0) {
    return (
      <div data-testid="team-display" className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-muted-foreground">No characters</span>
      </div>
    );
  }

  return (
    <div data-testid="team-display" className={cn("flex items-center gap-2", className)}>
      {characters.map((char) => (
        <Portrait key={char.name} characterKey={char.name} element={char.element} size="md" />
      ))}
    </div>
  );
}
