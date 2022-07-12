import { Spell } from "shared";
import { Component, createSignal, For } from "solid-js";
import {
  createCloseSignal,
  createInitDataSignal,
  MainButton,
} from "telegram-webapp-solid";
import { Layout } from "./Layout";

function createSpellSignal(orignalSpells: Spell[]) {
  const [spells, setSpells] = createSignal<Spell[]>(orignalSpells);

  function updateSpell(diff: { id: Spell["id"] } & Partial<Spell>) {
    setSpells((oldSpells) => [
      ...oldSpells.filter((spell) => spell.id !== diff.id),
      { ...oldSpells.find((spell) => spell.id === diff.id), ...diff },
    ]);
  }

  return [spells, setSpells, updateSpell] as const;
}

const App: Component = () => {
  const close = createCloseSignal();
  const [initData, sendData] = createInitDataSignal();
  const [spells, , updateSpell] = createSpellSignal(
    JSON.parse(
      new URL(window.location.href).searchParams.get("data") ??
        '[{"name": "Fireball"}]'
    )
  );

  function updateUsage(spell: Spell, diff: number) {
    updateSpell({
      id: spell.id,
      usage: Math.max(0, spell.usage + diff),
    });
  }

  return (
    <Layout>
      <ul class="my-auto flex flex-col space-y-2">
        <For each={spells()}>
          {(spell) => (
            <li class="flex w-full space-x-2">
              <div class="bg-base-200 px-5 flex place-items-center place-content-between rounded-lg text-primary flex-1">
                <span>{spell.name}</span>
                <span>{spell.usage}</span>
              </div>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => updateUsage(spell, 1)}
              >
                +
              </button>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => updateUsage(spell, -1)}
              >
                -
              </button>
            </li>
          )}
        </For>
      </ul>

      <MainButton
        text="Close the app"
        onClick={() => {
          sendData(JSON.stringify(spells()));
          close();
        }}
      />
    </Layout>
  );
};

export default App;
