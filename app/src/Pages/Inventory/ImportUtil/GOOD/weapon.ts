import { Weapon } from '~src/Types/types';
import { ascToMaxLvl } from '~src/util';
import { parseGOOD } from '.';
import { GWeapon } from './good';

export function convert_weapon(w: GWeapon): Weapon {
  return {
    name: parseGOOD(w.key),
    refine: w.refinement,
    level: w.level,
    max_level: ascToMaxLvl(w.ascension),
  };
}
