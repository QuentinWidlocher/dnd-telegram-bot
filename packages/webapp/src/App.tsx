import { createResource, Match, Switch } from "solid-js";
import { createCloseSignal, createUserSignal } from "telegram-webapp-solid";
import { Grimoire } from "./Grimoire";
import { Layout } from "./Layout";

export function App() {
  const close = createCloseSignal();
  const user = createUserSignal();

  const [fetchedSpells] = createResource(() => {
    let url = new URL(
      `https://dnd-telegram-bot.netlify.app/.netlify/functions/get-spells`
    );
    url.searchParams.set("user-id", String(user.id));

    return fetch(url).then((res) => res.json());
  });

  return (
    <Layout>
      <Switch>
        <Match when={fetchedSpells.loading}>
          <span class="my-auto text-center text-hint w-full">
            Chargement du grimoire...
          </span>
        </Match>
        <Match when={fetchedSpells.error}>
          <span class="my-auto text-center text-error w-full">
            {`${console.error(fetchedSpells.error)}`}
            Erreur lors du chargement du grimoire
          </span>
        </Match>
        <Match
          when={
            !fetchedSpells.loading && !fetchedSpells.error && fetchedSpells()
          }
        >
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
        </Match>
      </Switch>
    </Layout>
  );
}
