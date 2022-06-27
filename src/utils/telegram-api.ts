import https from "https";
import { TelegramResponseBody } from "../types";

const token = process.env.TELEGRAM_TOKEN;

export async function sendToUser(
  chat_id: number,
  text: string,
  params: TelegramResponseBody = {}
) {
  return post({ chat_id, text, ...params });
}

async function post(data: {}) {
  return new Promise((resolve, reject) => {
    const options = {
      host: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log(data);

    //create the request object with the callback with the result
    const req = https.request(options, (res) => {
      res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
      });
      resolve(JSON.stringify(res.statusCode));
    });

    // handle the possible errors
    req.on("error", (e) => {
      reject(e.message);
    });

    //do the request
    req.write(
      JSON.stringify({
        ...data,
        parse_mode: "Markdown",
      })
    );

    //finish the request
    req.end();
  });
}
