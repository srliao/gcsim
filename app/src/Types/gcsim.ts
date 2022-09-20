export type StatKey =
  | 'n/a'
  | 'def%'
  | 'def'
  | 'hp'
  | 'hp%'
  | 'atk'
  | 'atk%'
  | 'er'
  | 'em'
  | 'cr'
  | 'cd'
  | 'heal'
  | 'pyro%'
  | 'hydro%'
  | 'cryo%'
  | 'electro%'
  | 'anemo%'
  | 'geo%'
  | 'dendro%'
  | 'phys%';

export type Element =
  | 'electro'
  | 'pyro'
  | 'cryo'
  | 'hydro'
  | 'dendro'
  | 'quicken'
  | 'frozen'
  | 'anemo'
  | 'geo'
  | 'physical';

export type CharacterKey =
  | 'aetheranemo'
  | 'lumineanemo'
  | 'aethergeo'
  | 'luminegeo'
  | 'aetherelectro'
  | 'lumineelectro'
  | 'aetherdendro'
  | 'luminedendro'
  | 'aetherhydro'
  | 'luminehydro'
  | 'aetherpyro'
  | 'luminepyro'
  | 'aethercryo'
  | 'luminecryo'
  | 'albedo'
  | 'aloy'
  | 'amber'
  | 'barbara'
  | 'beidou'
  | 'bennett'
  | 'chongyun'
  | 'diluc'
  | 'diona'
  | 'eula'
  | 'fischl'
  | 'ganyu'
  | 'hutao'
  | 'jean'
  | 'kazuha'
  | 'kaeya'
  | 'ayaka'
  | 'ayato'
  | 'keqing'
  | 'klee'
  | 'sara'
  | 'lisa'
  | 'mona'
  | 'ningguang'
  | 'noelle'
  | 'qiqi'
  | 'raiden'
  | 'razor'
  | 'rosaria'
  | 'kokomi'
  | 'sayu'
  | 'sucrose'
  | 'tartaglia'
  | 'thoma'
  | 'venti'
  | 'xiangling'
  | 'xiao'
  | 'xingqiu'
  | 'xinyan'
  | 'yanfei'
  | 'yoimiya'
  | 'zhongli'
  | 'gorou'
  | 'itto'
  | 'shenhe'
  | 'yunjin'
  | 'yaemiko'
  | 'yelan'
  | 'kuki'
  | 'heizou'
  | 'tighnari'
  | 'collei';

export type ArtifactKey =
  | 'adventurer'
  | 'archaicpetra'
  | 'berserker'
  | 'blizzardstrayer'
  | 'bloodstainedchivalry'
  | 'braveheart'
  | 'crimsonwitchofflames'
  | 'deepwoodmemories'
  | 'defenderswill'
  | 'echoesofanoffering'
  | 'emblemofseveredfate'
  | 'gambler'
  | 'gladiatorsfinale'
  | 'gildeddreams'
  | 'heartofdepth'
  | 'huskofopulentdreams'
  | 'instructor'
  | 'lavawalker'
  | 'luckydog'
  | 'maidenbeloved'
  | 'martialartist'
  | 'noblesseoblige'
  | 'oceanhuedclam'
  | 'paleflame'
  | 'prayersfordestiny'
  | 'prayersforillumination'
  | 'prayersforwisdom'
  | 'prayerstospringtime'
  | 'resolutionofsojourner'
  | 'retracingbolide'
  | 'scholar'
  | 'shimenawasreminiscence'
  | 'tenacityofthemillelith'
  | 'theexile'
  | 'thunderingfury'
  | 'thundersoother'
  | 'tinymiracle'
  | 'travelingdoctor'
  | 'vermillionhereafter'
  | 'viridescentvenerer';

export type WeaponKey =
  | 'akuoumaru'
  | 'alleyhunter'
  | 'amenomakageuchi'
  | 'amosbow'
  | 'apprenticesnotes'
  | 'aquasimulacra'
  | 'aquilafavonia'
  | 'beginnersprotector'
  | 'blackcliffagate'
  | 'blackclifflongsword'
  | 'blackcliffpole'
  | 'blackcliffslasher'
  | 'blackcliffwarbow'
  | 'blacktassel'
  | 'bloodtaintedgreatsword'
  | 'calamityqueller'
  | 'cinnabarspindle'
  | 'compoundbow'
  | 'coolsteel'
  | 'crescentpike'
  | 'darkironsword'
  | 'deathmatch'
  | 'debateclub'
  | 'dodocotales'
  | 'dragonsbane'
  | 'dragonspinespear'
  | 'dullblade'
  | 'elegyfortheend'
  | 'emeraldorb'
  | 'endoftheline'
  | 'engulfinglightning'
  | 'everlastingmoonglow'
  | 'eyeofperception'
  | 'fadingtwilight'
  | 'favoniuscodex'
  | 'favoniusgreatsword'
  | 'favoniuslance'
  | 'favoniussword'
  | 'favoniuswarbow'
  | 'ferrousshadow'
  | 'festeringdesire'
  | 'filletblade'
  | 'freedomsworn'
  | 'frostbearer'
  | 'hakushinring'
  | 'halberd'
  | 'hamayumi'
  | 'harangeppakufutsu'
  | 'harbingerofdawn'
  | 'huntersbow'
  | 'hunterspath'
  | 'ironpoint'
  | 'ironsting'
  | 'kagotsurubeisshin'
  | 'kagurasverity'
  | 'katsuragikirinagamasa'
  | 'kitaincrossspear'
  | 'lionsroar'
  | 'lithicblade'
  | 'lithicspear'
  | 'lostprayertothesacredwinds'
  | 'luxurioussealord'
  | 'magicguide'
  | 'mappamare'
  | 'memoryofdust'
  | 'messenger'
  | 'mistsplitterreforged'
  | 'mitternachtswaltz'
  | 'mouunsmoon'
  | 'oathsworneye'
  | 'oldmercspal'
  | 'otherworldlystory'
  | 'pocketgrimoire'
  | 'polarstar'
  | 'predator'
  | 'primordialjadecutter'
  | 'primordialjadewingedspear'
  | 'prototypeamber'
  | 'prototypearchaic'
  | 'prototypecrescent'
  | 'prototyperancour'
  | 'prototypestarglitter'
  | 'rainslasher'
  | 'ravenbow'
  | 'recurvebow'
  | 'redhornstonethresher'
  | 'royalbow'
  | 'royalgreatsword'
  | 'royalgrimoire'
  | 'royallongsword'
  | 'royalspear'
  | 'rust'
  | 'sacrificialbow'
  | 'sacrificialfragments'
  | 'sacrificialgreatsword'
  | 'sacrificialsword'
  | 'seasonedhuntersbow'
  | 'serpentspine'
  | 'sharpshootersoath'
  | 'silversword'
  | 'skyridergreatsword'
  | 'skyridersword'
  | 'skywardatlas'
  | 'skywardblade'
  | 'skywardharp'
  | 'skywardpride'
  | 'skywardspine'
  | 'slingshot'
  | 'snowtombedstarsilver'
  | 'solarpearl'
  | 'songofbrokenpines'
  | 'staffofhoma'
  | 'summitshaper'
  | 'swordofdescension'
  | 'thealleyflash'
  | 'thebell'
  | 'theblacksword'
  | 'thecatch'
  | 'theflute'
  | 'thestringless'
  | 'theunforged'
  | 'theviridescenthunt'
  | 'thewidsith'
  | 'thrillingtalesofdragonslayers'
  | 'thunderingpulse'
  | 'travelershandysword'
  | 'twinnephrite'
  | 'vortexvanquisher'
  | 'wastergreatsword'
  | 'wavebreakersfin'
  | 'whiteblind'
  | 'whiteirongreatsword'
  | 'whitetassel'
  | 'windblumeode'
  | 'wineandsong';

export interface CharacterDetail {
  element: Element;
  weapon_type: string;
}

export const characters: {
  [key in CharacterKey]: CharacterDetail;
} = {
  aetheranemo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  lumineanemo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aethergeo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  luminegeo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aetherelectro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  lumineelectro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aetherdendro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  luminedendro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aetherhydro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  luminehydro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aetherpyro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  luminepyro: {
    element: 'electro',
    weapon_type: 'sword',
  },
  aethercryo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  luminecryo: {
    element: 'electro',
    weapon_type: 'sword',
  },
  albedo: {
    element: 'geo',
    weapon_type: 'sword',
  },
  aloy: {
    element: 'cryo',
    weapon_type: 'bow',
  },
  amber: {
    element: 'pyro',
    weapon_type: 'bow',
  },
  barbara: {
    element: 'hydro',
    weapon_type: 'catalyst',
  },
  beidou: {
    element: 'electro',
    weapon_type: 'claymore',
  },
  bennett: {
    element: 'pyro',
    weapon_type: 'sword',
  },
  chongyun: {
    element: 'cryo',
    weapon_type: 'claymore',
  },
  diluc: {
    element: 'pyro',
    weapon_type: 'claymore',
  },
  diona: {
    element: 'cryo',
    weapon_type: 'bow',
  },
  eula: {
    element: 'cryo',
    weapon_type: 'claymore',
  },
  fischl: {
    element: 'electro',
    weapon_type: 'bow',
  },
  ganyu: {
    element: 'cryo',
    weapon_type: 'bow',
  },
  hutao: {
    element: 'pyro',
    weapon_type: 'polearm',
  },
  jean: {
    element: 'anemo',
    weapon_type: 'sword',
  },
  kazuha: {
    element: 'anemo',
    weapon_type: 'sword',
  },
  kaeya: {
    element: 'cryo',
    weapon_type: 'sword',
  },
  ayaka: {
    element: 'cryo',
    weapon_type: 'sword',
  },
  ayato: {
    element: 'hydro',
    weapon_type: 'sword',
  },
  keqing: {
    element: 'electro',
    weapon_type: 'sword',
  },
  klee: {
    element: 'pyro',
    weapon_type: 'catalyst',
  },
  sara: {
    element: 'electro',
    weapon_type: 'bow',
  },
  lisa: {
    element: 'electro',
    weapon_type: 'catalyst',
  },
  mona: {
    element: 'hydro',
    weapon_type: 'catalyst',
  },
  ningguang: {
    element: 'geo',
    weapon_type: 'catalyst',
  },
  noelle: {
    element: 'geo',
    weapon_type: 'claymore',
  },
  qiqi: {
    element: 'cryo',
    weapon_type: 'sword',
  },
  raiden: {
    element: 'electro',
    weapon_type: 'polearm',
  },
  razor: {
    element: 'electro',
    weapon_type: 'claymore',
  },
  rosaria: {
    element: 'cryo',
    weapon_type: 'polearm',
  },
  kokomi: {
    element: 'hydro',
    weapon_type: 'catalyst',
  },
  sayu: {
    element: 'anemo',
    weapon_type: 'claymore',
  },
  sucrose: {
    element: 'anemo',
    weapon_type: 'catalyst',
  },
  tartaglia: {
    element: 'hydro',
    weapon_type: 'bow',
  },
  thoma: {
    element: 'pyro',
    weapon_type: 'polearm',
  },
  venti: {
    element: 'anemo',
    weapon_type: 'bow',
  },
  xiangling: {
    element: 'pyro',
    weapon_type: 'polearm',
  },
  xiao: {
    element: 'anemo',
    weapon_type: 'polearm',
  },
  xingqiu: {
    element: 'hydro',
    weapon_type: 'sword',
  },
  xinyan: {
    element: 'pyro',
    weapon_type: 'claymore',
  },
  yanfei: {
    element: 'pyro',
    weapon_type: 'catalyst',
  },
  yoimiya: {
    element: 'pyro',
    weapon_type: 'bow',
  },
  zhongli: {
    element: 'geo',
    weapon_type: 'polearm',
  },
  gorou: {
    element: 'geo',
    weapon_type: 'bow',
  },
  itto: {
    element: 'geo',
    weapon_type: 'claymore',
  },
  shenhe: {
    element: 'cryo',
    weapon_type: 'polearm',
  },
  yunjin: {
    element: 'geo',
    weapon_type: 'polearm',
  },
  yaemiko: {
    element: 'electro',
    weapon_type: 'catalyst',
  },
  yelan: {
    element: 'hydro',
    weapon_type: 'bow',
  },
  kuki: {
    element: 'electro',
    weapon_type: 'sword',
  },
  heizou: {
    element: 'anemo',
    weapon_type: 'catalyst',
  },
  tighnari: {
    element: 'dendro',
    weapon_type: 'bow',
  },
  collei: {
    element: 'dendro',
    weapon_type: 'bow',
  },
};
