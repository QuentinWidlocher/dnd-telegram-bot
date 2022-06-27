import { commands } from "./commands";
import { TelegramRequestBody } from "./types";
import { ResponseData } from "./utils/commands";
import { sendToUser } from "./utils/telegram-api";

const commandParseRegex = /\/(\w+)\s?(.+)?/;

export async function app(body: TelegramRequestBody) {
  console.log("body", body);

  if ("callback_query" in body) {
    const { chat } = body.callback_query.message;
    return executeCommand(chat, body.callback_query.data);
  } else {
    const { chat, text } = body.message;
    return executeCommand(chat, text);
  }
}

function executeCommand(
  chat: { id: number; type: "private" | string },
  text: string
) {
  const respond = ({ text = "", params = {} }: ResponseData) =>
    sendToUser(chat.id, text, params);

  let [command, params] = parseCommand(text) ?? [];

  if (command in commands) {
    return respond(commands[command](params));
  } else {
    if (chat.type == "private") {
      return respond({
        text: "J'avoue que j'ai rien compris là... Recommence ?",
      });
    }
  }
}

function parseCommand(message: string) {
  console.log("parsing command", message);

  let parsed = commandParseRegex.exec(message);

  if (parsed != null) {
    let [, command, params] = parsed;
    console.log("parsed", command, params);
    return [command, params];
  } else {
    return null;
  }
}
