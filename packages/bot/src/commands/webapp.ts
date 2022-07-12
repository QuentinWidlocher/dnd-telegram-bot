import { retreive } from "shared";
import invariant from "tiny-invariant";
import { Command } from "../utils/commands";

export const webAppCommand: Command = async (params, message) => {
  invariant(message.from);

  const data = await retreive(message.from.id);
  const spells = data.spells;

  const searchParams = new URLSearchParams();
  searchParams.append("data", JSON.stringify(spells));

  return {
    text: "Here, open the webapp",
    params: {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open web app",
              web_app: {
                url: `https://dnd-telegram-bot.netlify.app/?${searchParams.toString()}`,
              },
            },
          ],
        ],
      },
    },
  };
};
