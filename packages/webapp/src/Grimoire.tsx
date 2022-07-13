import { Spell } from "shared";
import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { MainButton } from "telegram-webapp-solid";
import { createBooleanTimeoutSignal } from "./utils/boolean-timeout-signal";

export type GrimoireProps = {
  spells: Spell[];
  onSaveClick: (spells: Spell[]) => void;
};

export function Grimoire(props: GrimoireProps) {
  console.log("Grimoire props", props);

  const [spells, setSpells] = createStore<Spell[]>(props.spells);
  const [confirmRest, setConfirmRest] = createBooleanTimeoutSignal();

  function updateUsage(index: number, diff: number) {
    setSpells(index, (spell) => ({
      ...spell,
      usage: Math.max(0, spell.usage + diff),
    }));
  }

  return (
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="flex w-full space-x-2 h-5">
        <div class="flex-1 flex justify-between text-hint text-sm">
          <span>Sort</span>
          <span>Utilisation</span>
        </div>
        <button class="invisible btn btn-square" disabled>
          -
        </button>
        <button class="invisible btn btn-square" disabled>
          +
        </button>
      </div>
      <ul class="flex-1 my-auto flex flex-col space-y-2 overflow-y-auto">
        <For each={spells}>
          {(spell, i) => (
            <li class="flex w-full space-x-2">
              <div class="bg-base-200 px-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1">
                <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {spell.name}
                </span>
                <span class="ml-2 font-bold">{spell.usage}</span>
              </div>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => updateUsage(i(), -1)}
                disabled={spell.usage <= 0}
              >
                -
              </button>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => updateUsage(i(), 1)}
              >
                +
              </button>
            </li>
          )}
        </For>
      </ul>
      <div class="flex flex-col mt-5">
        <button
          class="btn"
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
      </div>
      <MainButton
        text="Sauvegarder"
        onClick={() => {
          props.onSaveClick(spells);
        }}
      />
    </div>
  );
}
