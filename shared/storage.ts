import DB, { GetItemOutput } from "aws-sdk/clients/dynamodb";

const db = new DB({
  region: "us-east-1",
  credentials: {
    // @ts-ignore
    accessKeyId: process?.env?.ACCESS_KEY_ID ?? import.meta.env.ACCESS_KEY_ID,
    // @ts-ignore
    secretAccessKey: process?.env?.SECRET_ACCESS_KEY ?? import.meta.env.SECRET_ACCESS_KEY,
  },
});

export type UserData = {
  spells: {
    id: string;
    name: string;
    usage: number;
  }[];
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
