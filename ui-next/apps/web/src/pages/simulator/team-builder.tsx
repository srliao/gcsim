import { TeamDisplay } from "@gcsim/avatar";
import { latestChars } from "@gcsim/data";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useMemo, useState } from "react";
import { useSimulatorStore } from "../../stores/simulator-store";

function getCharacterNames(): string[] {
  const names = new Set<string>();
  for (const keys of Object.values(latestChars)) {
    for (const k of keys) {
      names.add(k);
    }
  }
  return [...names].sort();
}

function makeCharacter(name: string): Sim.Character {
  return {
    name,
    element: "",
    level: 90,
    max_level: 90,
    cons: 0,
    weapon: { name: "", level: 90, max_level: 90, refine: 1 },
    talents: { attack: 9, skill: 9, burst: 9 },
    sets: {},
    stats: [],
    snapshot: [],
  };
}

export function TeamBuilder() {
  const team = useSimulatorStore((s) => s.team);
  const setTeam = useSimulatorStore((s) => s.setTeam);
  const [selected, setSelected] = useState("");

  const characterNames = useMemo(() => getCharacterNames(), []);

  const handleAdd = () => {
    if (!selected || team.length >= 4) return;
    setTeam([...team, makeCharacter(selected)]);
    setSelected("");
  };

  const handleRemove = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const isFull = team.length >= 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <TeamDisplay characters={team} />
          {team.map((char, i) => (
            <Button
              key={char.name}
              variant="ghost"
              size="sm"
              aria-label={`Remove ${char.name}`}
              onClick={() => handleRemove(i)}
            >
              X
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={setSelected} disabled={isFull}>
            <SelectTrigger className="w-48" aria-label="Add Character">
              <SelectValue placeholder="Select character" />
            </SelectTrigger>
            <SelectContent>
              {characterNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={isFull || !selected}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
