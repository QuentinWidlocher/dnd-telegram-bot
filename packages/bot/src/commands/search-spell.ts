import { retreive } from "../utils/storage";
import {
  Command,
  createButtonGrid,
  createButtonHorizontalList,
} from "../utils/commands";
import type { InlineKeyboardButton } from "typegram";
import {
  schoolsNames,
  searchSpellByName,
  AnySpell,
  spells,
  assertSpell,
} from "shared";

export const searchSpellCommand: Command = async (params, message) => {
  if (!params) {
    return {
      text: "Pour chercher un sort, ajouter le nom du sort à la commande. Si le nom est exact, vous aurez sa description",
    };
  }

  let result: AnySpell[] = [];

  let page = 0;
  let spellsPerPage = 10;

  if (params.includes("page:")) {
    let [, parsedPage = "1"] = /page:([a-z-0-9]*)/.exec(params) ?? [];
    page = parseInt(parsedPage) || page;
    params = params.replace(`page:${parsedPage}`, "").trim();
  }

  let { spells: spellsInGrimoire = [] } = await retreive(message.chat.id);

  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    result = [...spells, ...spellsInGrimoire].filter((s) => s.id == id);
  } else {
    result = searchSpellByName(params);
  }

  if (result.length > 1) {
    let currentPage = page * spellsPerPage;
    let nextPage = (page + 1) * spellsPerPage;

    let paginatedResult = result.slice(currentPage, nextPage);

    let pageButtons: InlineKeyboardButton[] = [];
    let buttons = paginatedResult.map((r) => ({
      text: r.name,
      callback_data: `/s id:${r.id}`,
    }));

    if (currentPage > 0) {
      pageButtons.push({
        text: `< Page ${page}`,
        callback_data: `/s ${params} page:${page - 1}`,
      });
    }
    if (nextPage <= result.length) {
      pageButtons.push({
        text: `Page ${page + 2} >`,
        callback_data: `/s ${params} page:${page + 1}`,
      });
    }

    return {
      text: `Résultat de la recherche pour : *${params}*${
        result.length > spellsPerPage
          ? `\nPage ${page + 1}/${Math.ceil(result.length / spellsPerPage)}`
          : ""
      }`,
      params: {
        reply_markup: {
          inline_keyboard: [...buttons.map((b) => [b]), pageButtons],
        },
      },
    };
  } else if (result.length > 0) {
    const [spell] = result;
    let resultText = "";

    if (assertSpell(spell)) {
      resultText = `
*${spell.name} (${spell.isRitual ? "Rituel de " : ""}${
        schoolsNames[spell.school]
      })*
Sort de niveau ${spell.level}

*Durée d'incantation :* ${spell.castingTime}
*Portée :* ${spell.range}
*Durée :* ${spell.duration}
*Composantes :* ${spell.components}

${spell.description.replace(/<br>/g, "\n\n")}
${
  spell.higherLevel != undefined
    ? `

*Au niveau supérieur :*
${spell.higherLevel.replace(/<br>/g, "\n\n")}
`
    : ""
}`.trim();
    } else {
      resultText = `*${spell.name}*`;
    }

    if ([...spells, ...spellsInGrimoire].some((s) => s.id == spell.id)) {
      return {
        text: resultText,
        params: createButtonGrid([
          [
            {
              label: "Retirer du grimoire",
              command: `/grimoire remove id:${spell.id}`,
            },
            {
              label: "Utiliser le sort",
              command: `/grimoire use id:${spell.id}`,
            },
          ],
          [
            {
              label: "Voir votre grimoire",
              command: "/grimoire",
            },
          ],
        ]),
      };
    } else {
      return {
        text: resultText,
        params: createButtonHorizontalList([
          {
            label: "Ajouter au grimoire",
            command: `/grimoire add id:${spell.id}`,
          },
        ]),
      };
    }
  } else {
    return { text: `Aucun sort n'a été trouvé pour *${params}*` };
  }
};
