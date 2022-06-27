import { Command } from "../utils/commands";
import spells from "../assets/spells.json";
import { fuzzySearchRegexTemplate } from "../utils/parse-dice";

const schools = {
  abjuration: "Abjuration",
  conjuration: "Invocation",
  divination: "Divination",
  enchantment: "Enchantement",
  evocation: "Évocation",
  illusion: "Illusion",
  necromancy: "Nécromancie",
  transmutation: "Transmutation",
} as const;

export const searchSpellCommand: Command = (params) => {
  if (!params) {
    return {
      text: "Pour chercher un sort, ajouter le nom du sort à la commande. Si le nom est exact, vous aurez sa description",
    };
  }

  let result = [];

  let page = 0;
  let spellsPerPage = 10;

  if (params.includes("page:")) {
    let [, parsedPage = "1"] = /page:([a-z-0-9]*)/.exec(params) ?? [];
    page = parseInt(parsedPage) || page;
    params = params.replace(`page:${parsedPage}`, "").trim();
  }

  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    result = spells.filter((s) => s.id == id);
  } else {
    const fullRegexString = params
      .split(" ")
      .map((s) => s.trim())
      .map(fuzzySearchRegexTemplate)
      .join("");

    const regex = new RegExp(fullRegexString, "i");
    console.log("regex", regex);
    result = spells.filter((s) => (s.name?.match(regex) ?? []).length > 0);
  }

  if (result.length > 1) {
    let currentPage = page * spellsPerPage;
    let nextPage = (page + 1) * spellsPerPage;

    let paginatedResult = result.slice(currentPage, nextPage);

    let pageButtons = [];
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
    let resultText = `
*${spell.name} (${spell.isRitual ? "Rituel de " : ""}${
      schools[spell.school as keyof typeof schools]
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

    return { text: resultText };
  } else {
    return { text: `Aucun sort n'a été trouvé pour *${params}*` };
  }
};
