import { createSlice } from '@reduxjs/toolkit';
import { Artifact, Character, team, Weapon } from '~src/Types/types.d';

export interface Inventory {
  teams: {
    [key in string]: team;
  };
  characters: {
    [key in string]: Character;
  };
  database: {
    characters: Character[];
    artifacts: Artifact[];
    weapons: Weapon[];
  };
}

const initialState: Inventory = {
  teams: {},
  characters: {},
  database: {
    characters: [],
    artifacts: [],
    weapons: [],
  },
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState: initialState,
  reducers: {},
});

export const inventoryActions = inventorySlice.actions;

export type InventorySlice = {
  [inventorySlice.name]: ReturnType<typeof inventorySlice['reducer']>;
};
