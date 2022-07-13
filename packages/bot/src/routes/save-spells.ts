import invariant from "tiny-invariant";
import { update } from "../utils/storage";

export const handler = async (event: any, context: any) => {
  console.log("save-spells event", event);

  let userId = event.queryStringParameters?.["user-id"];
  invariant(userId, "userId is required");
  let spells = JSON.parse(event.body ?? "[]");
  invariant(spells, "data is required");

  await update(userId, (data) => ({
    ...data,
    spells,
  }));

  return { statusCode: 200, body: "" };
};
