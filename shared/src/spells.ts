import { spells } from ".";
import { Spell } from "./types/spell";

export function searchSpellByName(name: string): Spell[] {
  const fullRegexString = name
    .split(" ")
    .map((s) => s.trim())
    .map(fuzzySearchRegexTemplate)
    .join("");

  const regex = new RegExp(fullRegexString, "i");
  console.log("regex", regex);
  return spells.filter((s) => (s.name?.match(regex) ?? []).length > 0) ?? [];
}

export function fuzzySearchRegexTemplate(word: string) {
  return `(?=[a-z\u00E0-\u00FC]*${word}[a-z\u00E0-\u00FC]*)`;
}

export const schoolsNames = {
  abjuration: "Abjuration",
  conjuration: "Invocation",
  divination: "Divination",
  enchantment: "Enchantement",
  evocation: "Évocation",
  illusion: "Illusion",
  necromancy: "Nécromancie",
  transmutation: "Transmutation",
} as const;
