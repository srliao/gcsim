import type { SimResults } from "../../packages/types/src/sim.js";
import { mockCharacters } from "./characters.js";

export const mockSimResult: SimResults = {
  schema_version: { major: "2", minor: "0" },
  sim_version: "2.5.0",
  build_date: "2026-03-19",
  mode: 0,
  modified: false,
  key_type: "char",
  initial_character: "hutao",
  character_details: mockCharacters,
  target_details: [
    {
      level: 100,
      hp: 10000000,
      resist: {
        pyro: 0.1,
        hydro: 0.1,
        electro: 0.1,
        cryo: 0.1,
        anemo: 0.1,
        geo: 0.1,
        dendro: 0.1,
        physical: 0.1,
      },
      position: { x: 0, y: 0, r: 1 },
      name: "target-1",
    },
  ],
  simulator_settings: {
    iterations: 1000,
    delays: { swap: 1 },
  },
  player_position: { x: 0, y: 0, r: 0.1 },
  energy_settings: {
    active: false,
    amount: 0,
    start: 0,
    end: 0,
  },
  incomplete_characters: [],
  config_file: [
    "hutao char lvl=90/90 cons=1 talent=10,10,10;",
    'hutao add weapon="staffofhoma" refine=1 lvl=90/90;',
    'hutao add set="crimsonwitchofflames" count=4;',
    "xingqiu char lvl=90/90 cons=6 talent=1,10,13;",
    'xingqiu add weapon="sacrificialsword" refine=5 lvl=90/90;',
    'xingqiu add set="emblemofseveredfate" count=4;',
    "target lvl=100 hp=10000000 resist=.1;",
    "active hutao;",
  ].join("\n"),
  sample_seed: "12345",
  statistics: {
    min_seed: "111",
    max_seed: "999",
    p25_seed: "250",
    p50_seed: "500",
    p75_seed: "750",
    runtime: 2.5,
    iterations: 1000,
    duration: {
      min: 85,
      max: 105,
      mean: 95.2,
      sd: 3.1,
      q1: 93,
      q2: 95,
      q3: 97,
      histogram: [10, 30, 80, 200, 350, 200, 80, 30, 15, 5],
    },
    dps: {
      min: 35000,
      max: 65000,
      mean: 50250.5,
      sd: 4200.3,
      q1: 47500,
      q2: 50000,
      q3: 53000,
      histogram: [5, 15, 50, 150, 300, 250, 130, 60, 30, 10],
    },
    warnings: {
      target_overlap: false,
      insufficient_energy: false,
      insufficient_stamina: false,
      swap_cd: false,
      skill_cd: false,
      dash_cd: false,
      burst_cd: false,
    },
    character_dps: [
      { min: 20000, max: 45000, mean: 35100, sd: 3200 },
      { min: 10000, max: 25000, mean: 15150, sd: 2100 },
    ],
    field_time: [
      { min: 50, max: 80, mean: 65.3, sd: 5.1 },
      { min: 15, max: 45, mean: 29.9, sd: 4.8 },
    ],

    // Chart data
    damage_buckets: {
      bucket_size: 60,
      buckets: [
        { min: 0, max: 5000, mean: 2500, sd: 800 },
        { min: 3000, max: 12000, mean: 7500, sd: 1500 },
        { min: 8000, max: 20000, mean: 14000, sd: 2000 },
        { min: 15000, max: 30000, mean: 22000, sd: 2500 },
        { min: 20000, max: 40000, mean: 30000, sd: 3000 },
        { min: 25000, max: 48000, mean: 36000, sd: 3200 },
        { min: 28000, max: 52000, mean: 40000, sd: 3500 },
        { min: 30000, max: 55000, mean: 42500, sd: 3800 },
        { min: 32000, max: 58000, mean: 45000, sd: 4000 },
        { min: 33000, max: 60000, mean: 47000, sd: 4200 },
      ],
    },
    cumu_damage: {
      bucket_size: 60,
      targets: {
        "target-1": {
          overall: {
            min: [0, 2500, 10000, 24000, 44000, 70000, 100000, 135000, 175000, 220000],
            max: [5000, 17000, 37000, 67000, 107000, 155000, 210000, 268000, 328000, 390000],
            q1: [1000, 6000, 16000, 32000, 55000, 85000, 120000, 160000, 205000, 255000],
            q2: [2500, 10000, 24000, 46000, 76000, 112000, 155000, 200000, 250000, 305000],
            q3: [4000, 14000, 32000, 60000, 96000, 140000, 190000, 245000, 305000, 365000],
          },
        },
      },
    },
    dps_by_element: [
      {
        elements: {
          pyro: { min: 20000, max: 40000, mean: 30000, sd: 2500 },
          physical: { min: 2000, max: 8000, mean: 5100, sd: 800 },
        },
      },
      {
        elements: {
          hydro: { min: 8000, max: 20000, mean: 14000, sd: 1800 },
          physical: { min: 500, max: 2000, mean: 1150, sd: 300 },
        },
      },
    ],
    source_dps: [
      {
        sources: {
          "Normal Attack": { min: 12000, max: 25000, mean: 18000, sd: 2000 },
          "Elemental Skill": { min: 8000, max: 18000, mean: 12000, sd: 1500 },
          "Elemental Burst": { min: 3000, max: 8000, mean: 5100, sd: 800 },
        },
      },
      {
        sources: {
          "Normal Attack": { min: 2000, max: 6000, mean: 4000, sd: 600 },
          "Elemental Skill": { min: 5000, max: 15000, mean: 9000, sd: 1200 },
          "Elemental Burst": { min: 1000, max: 4000, mean: 2150, sd: 400 },
        },
      },
    ],
    character_actions: [
      {
        sources: {
          normal: { min: 100, max: 200, mean: 150, sd: 15 },
          skill: { min: 20, max: 40, mean: 30, sd: 4 },
          burst: { min: 8, max: 12, mean: 10, sd: 1 },
          dash: { min: 5, max: 15, mean: 10, sd: 2 },
        },
      },
      {
        sources: {
          normal: { min: 30, max: 60, mean: 45, sd: 5 },
          skill: { min: 15, max: 30, mean: 22, sd: 3 },
          burst: { min: 8, max: 12, mean: 10, sd: 1 },
        },
      },
    ],
    source_reactions: [
      {
        sources: {
          Vaporize: { min: 30, max: 70, mean: 50, sd: 6 },
          Overloaded: { min: 5, max: 15, mean: 10, sd: 2 },
        },
      },
      {
        sources: {
          Vaporize: { min: 10, max: 30, mean: 20, sd: 4 },
        },
      },
    ],
    total_source_energy: [
      {
        sources: {
          "Elemental Skill": { min: 100, max: 200, mean: 150, sd: 15 },
          "Elemental Burst": { min: 30, max: 60, mean: 45, sd: 5 },
        },
      },
      {
        sources: {
          "Elemental Skill": { min: 80, max: 160, mean: 120, sd: 12 },
        },
      },
    ],
    target_aura_uptime: [
      {
        sources: {
          Pyro: { min: 0.3, max: 0.6, mean: 0.45, sd: 0.05 },
          Hydro: { min: 0.2, max: 0.5, mean: 0.35, sd: 0.04 },
        },
      },
    ],
    end_stats: [
      { ending_energy: { min: 38, max: 43, mean: 40.5, sd: 1.2 } },
      { ending_energy: { min: 60, max: 70, mean: 65.2, sd: 2.1 } },
    ],
    rps: {
      min: 5,
      max: 15,
      mean: 10.2,
      sd: 1.5,
      q1: 9,
      q2: 10,
      q3: 11,
      histogram: [5, 20, 50, 100, 200, 150, 80, 40, 20, 5],
    },
    eps: {
      min: 100,
      max: 300,
      mean: 200,
      sd: 25,
      q1: 185,
      q2: 200,
      q3: 215,
      histogram: [5, 15, 40, 100, 250, 200, 100, 50, 25, 10],
    },
    hps: {
      min: 0,
      max: 5000,
      mean: 2500,
      sd: 800,
      q1: 2000,
      q2: 2500,
      q3: 3000,
      histogram: [20, 50, 100, 200, 250, 180, 100, 50, 30, 20],
    },
    shp: {
      min: 0,
      max: 10000,
      mean: 5000,
      sd: 1500,
      q1: 4000,
      q2: 5000,
      q3: 6000,
      histogram: [10, 30, 80, 150, 250, 200, 130, 80, 40, 10],
    },
  },
};
