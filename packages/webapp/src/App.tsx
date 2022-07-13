import { Spell } from "shared";
import { createEffect, createResource, Match, Show, Switch } from "solid-js";
import { createCloseSignal, createUserSignal } from "telegram-webapp-solid";
import { Grimoire } from "./Grimoire";
import { Layout } from "./Layout";

export function App() {
  const close = createCloseSignal();
  const user = createUserSignal();

  const [fetchedSpells] = createResource(user?.id ?? 260800881, (id) => {
    let url = new URL(
      `https://dnd-telegram-bot.netlify.app/.netlify/functions/get-spells`
    );
    url.searchParams.set("user-id", String(id));

    return fetch(url).then((res) => res.json());
  });

  createEffect(() => {
    console.log(fetchedSpells.loading);
    console.log(fetchedSpells.error);
    console.log(fetchedSpells());
  });

  return (
    <Switch>
      <Match when={fetchedSpells()}>
        <Layout>
          <Grimoire
            spells={fetchedSpells()}
            onSaveClick={async (spells) => {
              let url = new URL(
                `https://dnd-telegram-bot.netlify.app/.netlify/functions/save-spells`
              );
              url.searchParams.set("user-id", String(user.id));

              await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(spells),
              });

              close();
            }}
          />
        </Layout>
      </Match>
      <Match when={fetchedSpells.loading}>
        <Layout>
          <span class="my-auto text-center text-hint w-full">
            Chargement du grimoire...
          </span>
        </Layout>
      </Match>
      <Match when={fetchedSpells.error != null}>
        <Layout>
          <span class="my-auto text-center text-error w-full">
            {`${console.error(fetchedSpells.error)}`}
            Erreur lors du chargement du grimoire
          </span>
        </Layout>
      </Match>
    </Switch>
  );
}
