import { TelegramResponseBody } from "../types";

export type ResponseData = {
  text: string;
  params?: TelegramResponseBody;
};

export type Command = (params: string) => ResponseData;
