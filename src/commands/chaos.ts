import { TelegramResponseBody } from "../types";
import { parseRoll, rollParseRegex } from "../utils/parse-dice";
import chaosEffects from "../assets/chaos-effects.json";
import { Command } from "../utils/commands";

export const chaosCommand: Command = () => {
  let { total: d100 } = parseRoll("1d100-1") ?? { total: 0 };

  // A number between 0 and 50
  let d50 = Math.ceil(d100 / 2) - 1;

  let effect = chaosEffects[d50];

  let contextRollParsed = rollParseRegex.exec(effect);

  let responseParams: TelegramResponseBody = {};

  if (contextRollParsed) {
    let [rollToParse] = contextRollParsed;

    responseParams["reply_markup"] = {
      inline_keyboard: [
        [
          {
            text: `Lancer ${rollToParse}`,
            callback_data: `/r ${rollToParse}`,
          },
        ],
      ],
    };
  }

  return {
    text: `Vous obtenez un ${d100}.\n\n${effect}.`,
    params: responseParams,
  };
};
