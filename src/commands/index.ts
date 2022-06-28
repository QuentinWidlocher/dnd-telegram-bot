import { Command } from "../utils/commands";
import { chaosCommand } from "./chaos";
import { rollCommand } from "./dice-roll";
import { grimoireCommand } from "./grimoire";
import { searchSpellCommand } from "./search-spell";

export const commands: { [k: string]: Command } = {
  chaos: chaosCommand,
  c: chaosCommand,

  roll: rollCommand,
  r: rollCommand,

  spell: searchSpellCommand,
  s: searchSpellCommand,

  grimoire: grimoireCommand,
};
