import { app } from "../app";

export const handler = async (event: any, context: any) => {
  console.log("bot event", event);

  try {
    await app(JSON.parse(event.body ?? "{}"));
    return { statusCode: 200, body: JSON.stringify(event) };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: JSON.stringify(e) };
  }
};
