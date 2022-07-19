import DB, { GetItemOutput } from "aws-sdk/clients/dynamodb";
import { SpellInGrimoire } from "shared";

const db = new DB({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export type UserData = {
  spells: SpellInGrimoire[];
};

export async function store(userId: string | number, data: Partial<UserData>) {
  return db
    .putItem({
      TableName: "dnd-telegram-bot-user-data",
      Item: {
        userId: { S: String(userId) },
        data: { S: JSON.stringify(data) },
      },
    })
    .promise();
}

export async function retreive(userId: string | number): Promise<UserData> {
  return db
    .getItem({
      TableName: "dnd-telegram-bot-user-data",
      Key: { userId: { S: String(userId) } },
    })
    .promise()
    .then((data) =>
      JSON.parse(
        (data.$response.data as GetItemOutput | undefined)?.Item?.data?.S ??
          "{}"
      )
    );
}

export async function update(
  userId: string | number,
  map: (data: UserData) => UserData
) {
  let data = await retreive(userId);
  data = map(data);
  await store(userId, data);
}
