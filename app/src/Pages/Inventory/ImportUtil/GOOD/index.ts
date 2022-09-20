import { GStatKey, GCharacterKey, GSetKey, GWeaponKey } from './good';
import { CharacterKey, StatKey } from '~src/Types/gcsim';

export * from './artifact';
export * from './character';

export function parseGOOD(
  goodKey: GSetKey | GCharacterKey | GWeaponKey
): string {
  switch (goodKey) {
    case 'KaedeharaKazuha':
      return 'kazuha';
    case 'KamisatoAyaka':
      return 'ayaka';
    case 'KamisatoAyato':
      return 'ayato';
    case 'KujouSara':
      return 'sara';
    case 'RaidenShogun':
      return 'raiden';
    case 'SangonomiyaKokomi':
      return 'kokomi';
    case 'YaeMiko':
      return 'yaemiko';
    case 'AratakiItto':
      return 'itto';
    case 'ShikanoinHeizou':
      return 'heizou';
  }
  return goodKey
    .toString()
    .replace(/[^0-9a-z]/gi, '')
    .toLowerCase();
}

export const StatMapping: {
  [key in GStatKey]: StatKey;
} = {
  hp: 'hp',
  hp_: 'hp%',
  atk: 'atk',
  atk_: 'atk%',
  def: 'def',
  def_: 'def%',
  eleMas: 'em',
  enerRech_: 'er',
  heal_: 'heal',
  critRate_: 'cr',
  critDMG_: 'cd',
  physical_dmg_: 'phys%',
  anemo_dmg_: 'anemo%',
  geo_dmg_: 'geo%',
  electro_dmg_: 'electro%',
  hydro_dmg_: 'hydro%',
  pyro_dmg_: 'pyro%',
  cryo_dmg_: 'cryo%',
  dendro_dmg_: 'dendro%',
  '': 'n/a',
};
