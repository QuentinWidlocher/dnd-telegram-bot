import {
  Command,
  createButtonGrid,
  createButtonHorizontalList,
  createButtonVerticalList,
} from "../utils/commands";
import spells from "../assets/spells.json";
import { retreive, store } from "../utils/storage";
import { searchSpellByName, searchSpellCommand } from "./search-spell";

export const grimoireCommand: Command = async (params: string, message) => {
  if (message.chat.type != "private") {
    return {
      text: "Cette commande ne peut être utilisée qu'en conversation directe avec le bot.",
    };
  }

  const [command = "", ...args] = params?.split(" ") ?? [];

  if (command == "add" && args[0]) {
    return addToGrimoireCommand(params, message);
  } else if (command == "remove" && args[0]) {
    return removeFromGrimoireCommand(params, message);
  } else if (command == "use" && args[0]) {
    return useSpellCommand(params, message);
  } else if (command == "rest") {
    return restCommand(params, message);
  } else {
    return listGrimoireCommand(params, message);
  }
};

const addToGrimoireCommand: Command = async (params, message) => {
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

const removeFromGrimoireCommand: Command = async (params, message) => {
  const [command = "", ...args] = params?.split(" ") ?? [];

  let foundSpells = getSpellFromParams(args.join(" "));

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

  let data = await retreive(message.from.id);
  data = {
    ...data,
    spells: data.spells?.filter((spell) => spell.id != spell.id) ?? [],
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
  const data = await retreive(message.from.id);
  const spells = data.spells;

  if (spells.length == 0) {
    return { text: "Votre grimoire est vide" };
  }

  return {
    text: `Votre grimoire :`,
    params: createButtonGrid([
      ...spells.map((spell) => [
        {
          label: `${spell.name} (${spell.usage})`,
          command: `/spell id:${spell.id}`,
        },
        {
          label: "Utiliser",
          command: `/grimoire use id:${spell.id}`,
        },
      ]),
      [
        {
          label: "Réinitialiser votre grimoire",
          command: "/grimoire rest",
        },
      ],
    ]),
  };
};

const useSpellCommand: Command = async (params, message) => {
  const [command = "", ...args] = params?.split(" ") ?? [];

  let foundSpells = getSpellFromParams(args.join(" "));

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

  let data = await retreive(message.from.id);
  let previousUsage = data.spells?.find((s) => s.id == spell.id)?.usage ?? 0;
  data = {
    ...data,
    spells:
      data.spells?.map((spell) => {
        if (spell.id == spell.id) {
          spell.usage++;
        }
        return spell;
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

function getSpellFromParams(params: string) {
  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    const foundSpell = spells.find((spell) => spell.id == id);
    return foundSpell ? [foundSpell] : [];
  } else {
    return searchSpellByName(params);
  }
}
