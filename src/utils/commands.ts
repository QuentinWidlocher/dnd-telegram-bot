import type { Message, InlineKeyboardMarkup } from "typegram";

export type ResponseData = {
  text: string;
  params?: {
    reply_markup?: InlineKeyboardMarkup
  };
};

export type Command = (
  params: string,
  message: Message.TextMessage
) => Promise<ResponseData>;

export function createButtonHorizontalList(
  buttons: { label: string; command: string }[]
): ResponseData['params'] {
  return createButtonGrid([buttons]);
}

export function createButtonVerticalList(
  buttons: { label: string; command: string }[]
): ResponseData['params'] {
  return createButtonGrid(buttons.map((b) => [b]));
}

export function createButtonGrid(
  buttons: { label: string; command: string }[][]
): ResponseData['params'] {
  const buttonsList = buttons.map((row, index) => {
    const buttonsRow = row.map((button, index) => ({
      text: button.label,
      callback_data: button.command,
    }));

    return buttonsRow;
  });

  return {
    reply_markup: {
      inline_keyboard: buttonsList,
    },
  };
}
