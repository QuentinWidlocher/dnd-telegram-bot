import { spells } from ".";
import { AnySpell, Spell, SpellInGrimoire } from "./types/spell";

export function searchSpellByName(name: string): Spell[] {
  const fullRegexString = name
    .split(" ")
    .map((s) => s.trim())
    .join(".*");

  const regex = new RegExp(fullRegexString, "i");
  console.log("regex", regex);
  return spells.filter((s) => (s.name?.match(regex) ?? []).length > 0) ?? [];
}

export function fuzzySearchRegexTemplate(words: string[]) {
  return `(?=[a-z\u00E0-\u00FC]*(${words.join("|")})[a-z\u00E0-\u00FC]*)`;
}

export const schoolsNames: {
  [k in Spell["school"]]: string;
} = {
  abjuration: "Abjuration",
  conjuration: "Invocation",
  divination: "Divination",
  enchantment: "Enchantement",
  evocation: "Évocation",
  illusion: "Illusion",
  necromancy: "Nécromancie",
  transmutation: "Transmutation",
} as const;

export function assertSpellInGrimoire(
  spell: AnySpell
): spell is SpellInGrimoire {
  return "usage" in spell;
}

export function assertSpell(spell: AnySpell): spell is Spell {
  return !assertSpellInGrimoire(spell);
}
