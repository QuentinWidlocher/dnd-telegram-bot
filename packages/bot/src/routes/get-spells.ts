import invariant from "tiny-invariant";
import { retreive } from "../utils/storage";

export const handler = async (event: any, context: any) => {
  console.log("get-spells event", event);

  let userId = event.queryStringParameters?.["user-id"];
  invariant(userId, "userId is required");
  return {
    statusCode: 200,
    body: JSON.stringify((await retreive(userId)).spells ?? []),
  };
};
