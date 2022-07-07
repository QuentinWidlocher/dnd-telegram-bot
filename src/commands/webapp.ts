import { Command } from "../utils/commands";

export const webAppCommand: Command = async (params, message) => {
  return {
    text: "Here, open the webapp",
    params: {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open web app",
              web_app: {
                url: "https://magical-florentine-2067c4.netlify.app/",
              },
            },
          ],
        ],
      },
    },
  };
};
