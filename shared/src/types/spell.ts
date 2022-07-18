export type Spell = {
  name: string;
  originalName: string;
  castedBy: string[];
  id: string;
  level: number;
  school:
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";
  isRitual: boolean;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevel?: string;
};

export type SpellInGrimoire = Pick<Spell, "name" | "id"> & {
  usage: number;
  custom: boolean;
};

export type AnySpell = SpellInGrimoire | Spell