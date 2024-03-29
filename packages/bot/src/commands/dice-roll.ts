import { Command } from "../utils/commands";
import { parseRoll } from "../utils/parse-dice";

export const rollCommand: Command = async (params: string) => {
  let { rolls, modifier, totalBeforeModifiers, total } =
    parseRoll(params) ?? {};

  if (!rolls?.length) {
    return {
      text: `Désolé mais ce n'est pas un lancer de dés valide.\nIl faut un format du genre "2d8+4" par exemple.`,
    };
  } else {
    if (rolls.length > 1) {
      let rollList = rolls.reduce(
        (acc, r, i) => `${acc}\nJet n°${i + 1} : ${r}`,
        ""
      );
      let totalString = `Total : ${totalBeforeModifiers}`;

      if (total != totalBeforeModifiers) {
        totalString = `Total : ${totalBeforeModifiers}${
          modifier ?? ""
        } = ${total}`;
      }

      return { text: `${params}\n${rollList}\n\n${totalString}` };
    } else {
      if (total != totalBeforeModifiers) {
        return {
          text: `${params}\n${totalBeforeModifiers}${
            modifier ?? ""
          } = ${total}`,
        };
      } else {
        return {
          text: `${params}\n${totalBeforeModifiers}`,
        };
      }
    }
  }
};
