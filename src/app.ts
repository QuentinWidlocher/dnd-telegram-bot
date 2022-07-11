import { commands } from "./commands";
import { ResponseData } from "./utils/commands";
import { sendToUser } from "./utils/telegram-api";
import type { Message, Update } from "typegram";

const commandParseRegex = /\/(\w+)\s?(.+)?/;

export async function app(body: Update.MessageUpdate | Update.CallbackQueryUpdate) {
  console.log("body", body);

  if ("callback_query" in body) {
    if (body.callback_query?.message && "text" in body.callback_query.message) {
      return executeCommand({
        ...body.callback_query.message,
        text: body.callback_query.data ?? '',
        from: body.callback_query.from,
      });
    }
  } else if ("text" in body.message) {
    return executeCommand(body.message);
  }
}

async function executeCommand(message: Message.TextMessage) {
  const respond = ({ text = "", params = {} }: ResponseData) =>
    sendToUser({ chat_id: message.chat.id, text, ...params });

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
