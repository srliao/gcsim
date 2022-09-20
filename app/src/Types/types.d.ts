import { StatKey, ArtifactKey, CharacterKey, WeaponKey } from './gcsim';

export type statusType = 'idle' | 'loading' | 'done' | 'error';

export type team = Character[];
export interface Character {
  name: string;
  level: number;
  element: string;
  max_level: number;
  cons: number;
  weapon: Weapon;
  talents: Talent;
  stats: number[];
  snapshot: number[];
  sets: Set;
  date_added?: string;
  artifact_sets?: { [key in ArtifactSlots]: Artifact };
}

export interface Talent {
  attack: number;
  skill: number;
  burst: number;
}

export interface Set {
  [key: string]: number;
}

export interface Weapon {
  name: string;
  refine: number;
  level: number;
  max_level: number;
}

export type ArtifactSlots = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
export interface Artifact {
  key: ArtifactKey;
  slot: ArtifactSlots;
  level: number;
  main_stat: StatKey;
  location?: CharacterKey; //character name
  substats: ArtifactSubstat;
}

export interface ArtifactSubStat {
  key: StatKey;
  value: number;
}
