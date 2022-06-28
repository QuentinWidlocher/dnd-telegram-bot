import { commands } from "./commands";
import { TelegramRequestBody, TelegramRequestMessage } from "./types";
import { ResponseData } from "./utils/commands";
import { sendToUser } from "./utils/telegram-api";

const commandParseRegex = /\/(\w+)\s?(.+)?/;

export async function app(body: TelegramRequestBody) {
  console.log("body", body);

  if ("callback_query" in body) {
    return executeCommand({
      ...body.callback_query.message,
      text: body.callback_query.data,
      from: body.callback_query.from,
    });
  } else {
    return executeCommand(body.message);
  }
}

async function executeCommand(message: TelegramRequestMessage) {
  const respond = ({ text = "", params = {} }: ResponseData) =>
    sendToUser(message.chat.id, text, params);

  let [command, params] = parseCommand(message.text) ?? [];

  if (command in commands) {
    return respond(await commands[command](params, message));
  } else {
    if (message.chat.type == "private") {
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
