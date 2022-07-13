import { Spell } from "shared";
import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { MainButton } from "telegram-webapp-solid";
import { Layout } from "./Layout";
import { createBooleanTimeoutSignal } from "./utils/boolean-timeout-signal";

export type GrimoireProps = {
  spells: Spell[];
  onSaveClick: (spells: Spell[]) => void;
};

export function Grimoire(props: GrimoireProps) {
  const [spells, setSpells] = createStore<Spell[]>(props.spells);
  const [confirmRest, setConfirmRest] = createBooleanTimeoutSignal();

  function updateUsage(index: number, diff: number) {
    setSpells(index, (spell) => ({
      ...spell,
      usage: Math.max(0, spell.usage + diff),
    }));
  }

  return (
    <Layout>
      <ul class="my-auto flex flex-col space-y-2">
        <For each={spells}>
          {(spell, i) => (
            <li class="flex w-full space-x-2">
              <div class="bg-base-200 px-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1">
                <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {spell.name}
                </span>
                <span class="ml-2 font-bold">{spell.usage}</span>
              </div>
              <Show when={spell.usage > 0}>
                <button
                  class="btn btn-primary-ghost btn-square"
                  onClick={() => updateUsage(i(), -1)}
                >
                  -
                </button>
              </Show>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => updateUsage(i(), 1)}
              >
                +
              </button>
            </li>
          )}
        </For>
        <li class="flex flex-col">
          <button
            class="btn mt-5"
            classList={{
              "btn-error": confirmRest(),
              "btn-primary-ghost": !confirmRest(),
            }}
            onClick={() => {
              if (confirmRest()) {
                setSpells(
                  spells.map((spell) => ({
                    ...spell,
                    usage: 0,
                  }))
                );
                setConfirmRest(false);
              } else {
                setConfirmRest(true);
              }
            }}
            disabled={spells.every((s) => s.usage <= 0)}
          >
            {confirmRest() ? "Appuyez pour valider" : "Se reposer"}
          </button>
          <span class="text-hint text-center w-full mt-2">
            Un repos remet tous les compteurs à zéro
          </span>
        </li>
      </ul>
      <MainButton
        text="Sauvegarder"
        onClick={() => {
          props.onSaveClick(spells);
        }}
      />
    </Layout>
  );
}
