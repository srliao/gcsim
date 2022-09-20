import { CharacterKey, characters } from '~src/Types/gcsim';
import { Character, Weapon } from '~src/Types/types';
import { ascLvlMax } from '~src/util';
import { parseGOOD } from '.';
import { GCharacter } from './good';

export function convert_character(char: GCharacter): Character {
  //@ts-ignore
  const key: CharacterKey = parseGOOD(char.key);
  let res: Character = {
    name: parseGOOD(char.key),
    level: char.level,
    element: characters[key].element,
    max_level: ascLvlMax(char.ascension),
    cons: char.constellation,
    weapon: default_weapon(characters[key].weapon_type),
    talents: {
      attack: char.talent.auto,
      skill: char.talent.skill,
      burst: char.talent.burst,
    },
    stats: [],
    snapshot: [],
    sets: {},
  };

  return res;
}

function default_weapon(w: string): Weapon {
  let weap = {
    name: 'dullblade',
    refine: 1,
    level: 1,
    max_level: 20,
  };
  switch (w) {
    case 'claymore':
      weap.name = 'wastergreatsword';
      return weap;
    case 'polearm':
      weap.name = 'beginnersprotector';
      return weap;
    case 'bow':
      weap.name = 'huntersbow';
      return weap;
    case 'catalyst':
      weap.name = 'apprenticenotes';
      return weap;
    case 'sword':
    //fallthrough
    default:
      return weap;
  }
}
