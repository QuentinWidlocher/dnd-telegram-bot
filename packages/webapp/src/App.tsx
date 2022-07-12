import { Spell } from "shared";
import { createEffect, createSignal, For, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  createCloseSignal,
  createInitDataSignal,
  MainButton,
} from "telegram-webapp-solid";
import { Layout } from "./Layout";

function createBooleanTimeoutSignal(timeout: number = 2000) {
  const [state, setState] = createSignal(false);
  let timeoutRef;

  createEffect(() => {
    if (state()) {
      timeoutRef = setTimeout(() => {
        setState(false);
      }, 2000);
    } else {
      clearTimeout(timeoutRef);
    }
  });

  return [state, setState] as const;
}

export default function App() {
  const close = createCloseSignal();
  const [initData, sendData] = createInitDataSignal();
  const [spells, setSpells] = createStore<Spell[]>(
    JSON.parse(
      new URL(window.location.href).searchParams.get("data") ??
        '[{"id": "fireball", "name": "Big mega fireball thrown from the eyes", "usage": 0}, {"id": "heal", "name": "Heal", "usage": 1}]'
    ).sort((a, b) => a.id.localeCompare(b.id))
  );
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
        text="Close the app"
        onClick={() => {
          sendData(JSON.stringify(spells));
          close();
        }}
      />
    </Layout>
  );
}
