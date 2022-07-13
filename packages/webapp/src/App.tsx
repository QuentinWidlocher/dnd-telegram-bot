import {
  createEffect,
  createRenderEffect,
  createResource,
  Match,
  Switch,
} from "solid-js";
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

    console.log(
      "🚀 ~ file: App.tsx ~ line 15 ~ const[fetchedSpells]=createResource ~ url",
      url
    );

    return fetch(url)
      .then((res) => res.json())
      .then((r) => {
        console.log("🚀 ~ file: App.tsx ~ line 22 ~ returnfetch ~ r", r);
        return r;
      });
  });

  createEffect(() => {
    console.log(
      "🚀 ~ file: App.tsx ~ line 28 ~ createEffect ~ fetchedSpells",
      fetchedSpells()
    );
    console.log(
      "🚀 ~ file: App.tsx ~ line 31 ~ createEffect ~ fetchedSpells",
      fetchedSpells
    );
  });

  return (
    <Layout>
      <Switch
        fallback={
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
        }
      >
        <Match when={fetchedSpells.loading}>
          <span class="my-auto text-center text-hint w-full">
            Chargement du grimoire...
          </span>
        </Match>
        <Match when={fetchedSpells.error}>
          <span class="my-auto text-center text-error w-full">
            Erreur lors du chargement du grimoire
          </span>
        </Match>
      </Switch>
    </Layout>
  );
}
