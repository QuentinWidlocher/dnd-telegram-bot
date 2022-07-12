import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import invariant from "tiny-invariant";
import { app } from "./app";
import { retreive, store } from "./utils/storage";

export const handler = async (
  event: APIGatewayProxyEventV2WithRequestContext<any>,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("event", event);

  switch (event.rawPath) {
    case "/default/DnDTelegramBot":
      try {
        await app(JSON.parse(event.body ?? "{}"));
        return { statusCode: 200, body: JSON.stringify(event) };
      } catch (e) {
        console.error(e);
        return { statusCode: 200, body: JSON.stringify(e) };
      }

    case "/default/get-spells":
      var userId = event.queryStringParameters?.["user-id"];
      invariant(userId, "userId is required");
      return { statusCode: 200, body: JSON.stringify(await retreive(userId)) };

    case "/default/save-spells":
      var userId = event.queryStringParameters?.["user-id"];
      invariant(userId, "userId is required");
      var data = JSON.parse(event.body ?? "{}");
      invariant(data, "data is required");

      await store(userId, data);

      return { statusCode: 200, body: "" };

    default:
      return { statusCode: 404, body: "" };
  }
};
