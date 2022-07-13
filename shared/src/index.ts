import { Spell } from "./types/spell";

export * from "./types/spell";
export * from "./spells";

import spellsJson from "./assets/spells.json";
export const spells: Spell[] = spellsJson as Spell[];

import chaosEffectsJson from "./assets/chaos-effects.json";
export const chaosEffects: string[] = chaosEffectsJson;
