import invariant from "tiny-invariant";
import { store } from "../utils/storage";

export const handler = async (event: any, context: any) => {
  console.log("save-spells event", event);

  let userId = event.queryStringParameters?.["user-id"];
  invariant(userId, "userId is required");
  let data = JSON.parse(event.body ?? "{}");
  invariant(data, "data is required");

  await store(userId, data);

  return { statusCode: 200, body: "" };
};
