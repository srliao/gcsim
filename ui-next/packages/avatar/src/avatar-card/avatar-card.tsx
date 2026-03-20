import { Card, CardContent, CardHeader, CardTitle, cn } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { Portrait } from "../portrait/index.js";

export interface AvatarCardProps {
  character: Sim.Character;
  className?: string;
}

function formatLevel(level: number, maxLevel: number): string {
  return `${level}/${maxLevel}`;
}

function formatWeapon(weapon: Sim.Weapon): string {
  return `${weapon.name} R${weapon.refine}`;
}

function formatTalents(talents: Sim.Talent): string {
  return `${talents.attack}/${talents.skill}/${talents.burst}`;
}

export function AvatarCard({ character, className }: AvatarCardProps) {
  return (
    <Card data-testid="avatar-card" className={cn("w-fit", className)}>
      <CardHeader className="flex-row items-center gap-3">
        <Portrait characterKey={character.name} element={character.element} size="lg" />
        <div>
          <CardTitle data-testid="avatar-card-name">{character.name}</CardTitle>
          <p data-testid="avatar-card-level" className="text-xs text-muted-foreground">
            Lv. {formatLevel(character.level, character.max_level)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <p data-testid="avatar-card-cons">
          <span className="text-muted-foreground">Constellation: </span>
          <span className="font-medium">C{character.cons}</span>
        </p>
        {character.weapon ? (
          <p data-testid="avatar-card-weapon">
            <span className="text-muted-foreground">Weapon: </span>
            <span className="font-medium">{formatWeapon(character.weapon)}</span>
          </p>
        ) : null}
        {character.talents ? (
          <p data-testid="avatar-card-talents">
            <span className="text-muted-foreground">Talents: </span>
            <span className="font-medium">{formatTalents(character.talents)}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
