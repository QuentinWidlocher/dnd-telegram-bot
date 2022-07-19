import { SpellInGrimoire } from "shared";
import { Link } from "solid-app-router";
import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import {
  createHapticImpactSignal,
  createMainButtonSignal,
  HapticButton,
} from "telegram-webapp-solid";
import { createBooleanTimeoutSignal } from "../utils/boolean-timeout-signal";
import { SpellList } from "./SpellList";
import HalfMoon from "../../node_modules/iconoir/icons/half-moon.svg";
import AddDatabaseScript from "../../node_modules/iconoir/icons/add-database-script.svg";
import { v4 as uuidv4 } from "uuid";

export type GrimoireProps = {
  spells: SpellInGrimoire[];
  onSaveClick: (spells: SpellInGrimoire[]) => void;
  onMainButtonClick: (spells: SpellInGrimoire[]) => void;
};

export function Grimoire(props: GrimoireProps) {
  const originalSpells = [...props.spells.map((s) => ({ ...s }))];
  const [spells, setSpells] = createStore<SpellInGrimoire[]>(props.spells);
  const [confirmRest, setConfirmRest] = createBooleanTimeoutSignal();
  const mainButton = createMainButtonSignal({
    text: "Sauvegarder",
    show: false,
    hapticForce: "medium",
    onClick: () => {
      props.onMainButtonClick(spells);
    },
  });
  const hapticImpact = createHapticImpactSignal("medium");

  onCleanup(() => {
    props.onSaveClick(spells);
  });

  createEffect(() => {
    if (
      originalSpells.length != spells.length ||
      originalSpells.some((s) => {
        let { name: foundName, usage: foundUsage } = spells.find(
          (s2) => s2.id == s.id
        );
        let { name, usage } = s;
        return name != foundName || usage != foundUsage;
      })
    ) {
      mainButton.setVisible(true);
    } else {
      mainButton.setVisible(false);
    }
  });
  function addCustomSpell() {
    if (spells.some((s) => s.name == "")) {
      return;
    }

    setSpells((spells) => [
      ...spells,
      {
        id: uuidv4(),
        name: "",
        usage: 0,
        custom: true,
      },
    ]);
  }

  return (
    <div class="flex flex-col flex-1 overflow-y-hidden -mx-5 px-5">
      <div class="flex w-full space-x-2 h-5 mb-1">
        <div class="flex-1 flex justify-between text-hint text-sm px-2">
          <span>Sort{spells.length > 1 ? `s (${spells.length})` : ""}</span>
          <span>Utilisations</span>
        </div>
        <div class="invisible btn btn-square"></div>
        <div class="invisible btn btn-square"></div>
      </div>
      <SpellList
        spells={spells}
        showButtons
        emptyMessage="Aucun sort dans votre grimoire"
        onSpellChange={setSpells}
        onSpellDelete={(i) => {
          setSpells((spells) => spells.filter((_, j) => j != i));
        }}
      >
        <li class="w-full flex flex-col-reverse xs:!flex-row xs:space-x-2">
          <HapticButton
            class="btn btn-primary-ghost flex-1 space-x-2 mt-2 xs:!mt-0"
            onClick={addCustomSpell}
          >
            <span>Ajouter une ligne</span>
          </HapticButton>
          <Link
            href="/spell-search"
            class="btn btn-primary flex-1 space-x-2"
            onClick={() => {
              mainButton.setVisible(false);
              hapticImpact();
            }}
          >
            <span>Ajouter un sort</span>
            <AddDatabaseScript />
          </Link>
        </li>
      </SpellList>
      <div class="flex flex-col mt-5">
        <button
          class="btn space-x-2"
          classList={{
            "btn-error": confirmRest(),
            "btn-primary-ghost": !confirmRest(),
          }}
          onClick={() => {
            if (confirmRest()) {
              hapticImpact();
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
          <span>{confirmRest() ? "Appuyez pour valider" : "Se reposer"}</span>
          <HalfMoon />
        </button>
        <span class="text-hint text-center text-sm w-full mt-2">
          Un repos remet tous les compteurs à zéro
        </span>
      </div>
    </div>
  );
}
