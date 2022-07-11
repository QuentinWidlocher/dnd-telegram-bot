import { Command } from "./utils/commands";
import { chaosCommand } from "./commands/chaos";
import { rollCommand } from "./commands/dice-roll";
import { grimoireCommand } from "./commands/grimoire";
import { searchSpellCommand } from "./commands/search-spell";
import { webAppCommand } from "./commands/webapp";

export const commands: { [k: string]: Command } = {
  chaos: chaosCommand,
  c: chaosCommand,

  roll: rollCommand,
  r: rollCommand,

  spell: searchSpellCommand,
  s: searchSpellCommand,

  grimoire: grimoireCommand,

  webapp: webAppCommand,
};
