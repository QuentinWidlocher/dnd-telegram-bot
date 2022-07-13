import { SpellInGrimoire } from "shared";
import { RouteDataFunc } from "solid-app-router";
import { createResource } from "solid-js";
import { createUserSignal } from "telegram-webapp-solid";

export const grimoireRouteLoader: RouteDataFunc = ({ }) => {
  const user = createUserSignal();
  const userId = import.meta.env.PROD ? String(user().id) : "260800881";

  let url = new URL(
    `https://dnd-telegram-bot.netlify.app/.netlify/functions/get-spells`
  );
  url.searchParams.set("user-id", userId);

  const [r] = createResource<SpellInGrimoire[]>(() =>
    fetch(url).then((res) => res.json())
  );

  return r;
};
