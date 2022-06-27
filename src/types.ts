export type TelegramRequestBody =
  | {
      message: {
        chat: {
          id: number;
          type: "private" | "group" | "supergroup" | "channel";
        };
        text: string;
      };
    }
  | {
      callback_query: {
        message: {
          chat: {
            id: number;
            type: "private" | "group" | "supergroup" | "channel";
          };
          text: string;
        };
        data: string;
      };
    };

export type TelegramResponseBody = {
  reply_markup?: {
    inline_keyboard: TelegramInlineKeyboardButton[][];
  };
};

export type TelegramInlineKeyboardButton = {
  text: string;
  callback_data: string;
};
