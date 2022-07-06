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
                url: "https://heroic-donut-d2e626.netlify.app/",
              }
            }
          ]
        ]
      }
    }
  }
}