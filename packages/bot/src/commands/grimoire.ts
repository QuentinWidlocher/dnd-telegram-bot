import {
  Command,
  createButtonGrid,
  createButtonHorizontalList,
  createButtonVerticalList,
} from "../utils/commands";
import invariant from "tiny-invariant";
import { retreive, store, update } from "../utils/storage";
import { searchSpellByName, SpellInGrimoire, spells } from "shared";
import { v4 as uuidv4 } from "uuid";

export const grimoireCommand: Command = async (params: string, message) => {
  if (message.chat.type != "private") {
    return {
      text: "Cette commande ne peut être utilisée qu'en conversation directe avec le bot.",
    };
  }

  const [command = "", ...args] = params?.split(" ") ?? [];

  if (command == "add" && args[0]) {
    return addToGrimoireCommand(params, message);
  } else if (command == "create" && args[0]) {
    return createToGrimoireCommand(params, message);
  } else if (command == "remove" && args[0]) {
    return removeFromGrimoireCommand(params, message);
  } else if (command == "use" && args[0]) {
    return useSpellCommand(params, message);
  } else if (command == "rest") {
    return restCommand(params, message);
  } else if (command == "help") {
    return helpCommand(params, message);
  } else {
    return listGrimoireCommand(params, message);
  }
};

const addToGrimoireCommand: Command = async (params, message) => {
  invariant(message.from);

  const [command = "", ...args] = params?.split(" ") ?? [];

  let foundSpells = getSpellFromParams(args.join(" "));

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(
        foundSpells.map((s) => ({
          label: s.name,
          command: `/grimoire add id:${s.id}`,
        }))
      ),
    };
  } else if (foundSpells.length < 1) {
    return { text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*` };
  }

  let spell = foundSpells[0];

  let data = await retreive(message.from.id);
  data = {
    ...data,
    spells: [
      ...(data.spells ?? []),
      {
        id: spell.id,
        name: spell.name,
        usage: 0,
        custom: false,
      },
    ],
  };
  await store(message.from.id, data);

  return {
    text: `Le sort *${spell.name}* à été ajouté à votre grimoire`,
    params: createButtonHorizontalList([
      {
        label: "Voir votre grimoire",
        command: "/grimoire",
      },
    ]),
  };
};

const createToGrimoireCommand: Command = async (params, message) => {
  invariant(message.from);

  const [command = "", ...args] = params?.split(" ") ?? [];
  const spellToCreate = {
    id: uuidv4(),
    name: args.join(" "),
    usage: 0,
    custom: true,
  };

  let data = await retreive(message.from.id);
  data = {
    ...data,
    spells: [...(data.spells ?? []), spellToCreate],
  };
  await store(message.from.id, data);

  return {
    text: `*${spellToCreate.name}* à été ajouté à votre grimoire`,
    params: createButtonHorizontalList([
      {
        label: "Voir votre grimoire",
        command: "/grimoire",
      },
    ]),
  };
};

const removeFromGrimoireCommand: Command = async (params, message) => {
  invariant(message.from);
  const [command = "", ...args] = params?.split(" ") ?? [];

  if (args[0] == "all") {
    await update(message.from.id, (data) => ({
      ...data,
      spells: [],
    }));

    return {
      text: `Tous les sorts ont été supprimés de votre grimoire`,
      params: createButtonHorizontalList([
        {
          label: "Voir votre grimoire",
          command: "/grimoire",
        },
      ]),
    };
  }

  let data = await retreive(message.from.id);

  let foundSpells = getSpellFromParams(args.join(" "), data.spells);

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(
        foundSpells.map((s) => ({
          label: s.name,
          command: `/grimoire remove id:${s.id}`,
        }))
      ),
    };
  } else if (foundSpells.length < 1) {
    return { text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*` };
  }

  let spell = foundSpells[0];

  data = {
    ...data,
    spells: data.spells?.filter((s) => s.id != spell.id) ?? [],
  };
  await store(message.from.id, data);

  return {
    text: `Le sort *${spell.name}* à été supprimé de votre grimoire`,
    params: createButtonHorizontalList([
      {
        label: "Voir votre grimoire",
        command: "/grimoire",
      },
    ]),
  };
};

const listGrimoireCommand: Command = async (params, message) => {
  invariant(message.from);
  const data = await retreive(message.from.id);
  const spells = data.spells;

  if (spells.length == 0) {
    return { text: "Votre grimoire est vide" };
  }

  return {
    text: `Votre grimoire :`,
    params: createButtonGrid([
      ...spells.map(
        (spell) =>
          [
            {
              label: `${spell.name} (${spell.usage})`,
              command: spell.custom ? "" : `/spell id:${spell.id}`,
            },
            {
              label: "Utiliser",
              command: `/grimoire use id:${spell.id}`,
            },
            spell.custom
              ? {
                  label: "Supprimer",
                  command: `/grimoire remove id:${spell.id}`,
                }
              : undefined,
          ].filter(Boolean) as { label: string; command: string }[]
      ),
      [
        {
          label: "Se reposer",
          command: "/grimoire rest",
        },
      ],
    ]),
  };
};

const useSpellCommand: Command = async (params, message) => {
  invariant(message.from);
  const [command = "", ...args] = params?.split(" ") ?? [];

  let data = await retreive(message.from.id);

  let foundSpells = getSpellFromParams(args.join(" "), data.spells);

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(
        foundSpells.map((s) => ({
          label: s.name,
          command: `/grimoire use id:${s.id}`,
        }))
      ),
    };
  } else if (foundSpells.length < 1) {
    return { text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*` };
  }

  let spell = foundSpells[0];
  let previousUsage = data.spells?.find((s) => s.id == spell.id)?.usage ?? 0;
  data = {
    ...data,
    spells:
      data.spells?.map((s) => {
        if (s.id == spell.id) {
          s.usage++;
        }
        return s;
      }) ?? [],
  };
  await store(message.from.id, data);

  return {
    text: `Le sort *${spell.name}* à été utilisé ${previousUsage + 1} fois`,
    params: createButtonHorizontalList([
      {
        label: "Voir votre grimoire",
        command: "/grimoire",
      },
    ]),
  };
};

const restCommand: Command = async (params, message) => {
  invariant(message.from);
  let data = await retreive(message.from.id);
  data = {
    ...data,
    spells:
      data.spells?.map((spell) => ({
        ...spell,
        usage: 0,
      })) ?? [],
  };
  await store(message.from.id, data);

  return {
    text: `Votre grimoire a été réinitialisé`,
    params: createButtonHorizontalList([
      {
        label: "Voir votre grimoire",
        command: "/grimoire",
      },
    ]),
  };
};

const helpCommand: Command = async (params, message) => {
  return {
    text: `Les commandes disponibles sont :
\`/grimoire add <nom du sort>\` : ajoute un sort à votre grimoire
\`/grimoire remove <nom du sort>\` : supprime un sort de votre grimoire
\`/grimoire use <nom du sort>\` : utilise un sort de votre grimoire
\`/grimoire create <nom>\` : ajoute une ligne à votre grimoire (ce que vous voulez)
\`/grimoire list\` : liste tous les sorts de votre grimoire
\`/grimoire rest\` : réinitialise votre grimoire
\`/help\` : affiche cette aide`,
  };
};

function getSpellFromParams(
  params: string,
  searchAlsoIn: SpellInGrimoire[] = []
) {
  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    const foundSpell = [...spells, ...searchAlsoIn].find(
      (spell) => spell.id == id
    );
    return foundSpell ? [foundSpell] : [];
  } else {
    return searchSpellByName(params);
  }
}
