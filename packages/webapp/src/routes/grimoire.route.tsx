import { SpellInGrimoire } from "shared";
import { useRouteData } from "solid-app-router";
import { Resource, Show } from "solid-js";
import {
  createCloseSignal,
  createMainButtonSignal,
} from "telegram-webapp-solid";
import { Grimoire } from "../components/Grimoire";
import { Layout } from "../components/Layout";
import { createDatabaseSignal } from "../utils/database-signal";

export default function GrimoireRoute() {
  const database = createDatabaseSignal();
  const close = createCloseSignal();
  const spells = useRouteData<Resource<SpellInGrimoire[]>>();
  const mainButton = createMainButtonSignal({});
  console.log("Grimoire routeData", spells);

  return (
    <Show when={!spells.loading && !spells.error}>
      <Layout>
        <Grimoire
          spells={spells()}
          onMainButtonClick={async (spells) => {
            mainButton.setProgressVisible(true);
            mainButton.setActive(false);
            await database.saveSpells(spells);
            close();
            mainButton.setProgressVisible(false);
            mainButton.setActive(true);
          }}
          onSaveClick={async (spells) => {
            mainButton.setProgressVisible(true);
            mainButton.setActive(false);
            await database.saveSpells(spells);
            mainButton.setProgressVisible(false);
            mainButton.setActive(true);
          }}
        />
      </Layout>
    </Show>
  );
}
