import {
  AnySpell,
  assertSpell,
  assertSpellInGrimoire,
  SpellInGrimoire,
} from "shared";
import { Link } from "solid-app-router";
import { onMount, Show } from "solid-js";
import {
  createHapticImpactSignal,
  createHapticSelectionSignal,
  createMainButtonSignal,
} from "telegram-webapp-solid";
import DeleteCircledOutline from "../../node_modules/iconoir/icons/delete-circled-outline.svg";
import Minus from "../../node_modules/iconoir/icons/minus.svg";
import Plus from "../../node_modules/iconoir/icons/plus.svg";
import QuestionMarkCircle from "../../node_modules/iconoir/icons/question-mark-circle.svg";
import { createBooleanTimeoutSignal } from "../utils/boolean-timeout-signal";

export type SpellProps = {
  spell: AnySpell;
  onSpellChange?: (spell: SpellInGrimoire) => void;
  onSpellDelete?: () => void;
  showButtons: boolean;
};

export function Spell(props: SpellProps) {
  const mainButton = createMainButtonSignal({});
  const hapticImpact = createHapticImpactSignal("medium");
  const hapticSelection = createHapticSelectionSignal();
  const [confirmDelete, setConfirmDelete] = createBooleanTimeoutSignal();

  const customNameInput = (
    <input
      type="text"
      value={props.spell.name}
      class="flex-1 input text-base pr-0 min-w-0 rounded-r-none"
      onFocusIn={() => hapticSelection()}
      onInput={(e) => {
        props.onSpellChange({
          ...(props.spell as SpellInGrimoire),
          name: e.currentTarget.value,
        });
      }}
    >
      {props.spell.name}
    </input>
  );

  onMount(() => {
    if (assertSpellInGrimoire(props.spell) && props.spell.name == "") {
      (customNameInput as HTMLInputElement).focus();
    }
  });

  return (
    <li class="flex w-full space-x-2">
      <Show
        when={
          assertSpell(props.spell) ||
          (assertSpellInGrimoire(props.spell) && !props.spell.custom)
        }
      >
        <div
          onClick={() => mainButton.setVisible(false)}
          class="bg-base-100 focus:bg-primary focus:bg-opacity-20 hover:bg-base-200 hover:text-primary-focus pl-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1"
        >
          <Link
            onFocusIn={() => hapticSelection()}
            href={`/spell/${props.spell.id}`}
            class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-3"
          >
            {props.spell.name}
          </Link>
          <Show when={assertSpellInGrimoire(props.spell)}>
            <input
              type="number"
              class="input m-0 rounded-l-none w-10 px-0 number-spinner-none font-bold text-center"
              value={(props.spell as SpellInGrimoire).usage}
              onFocusIn={() => hapticSelection()}
              onInput={(e) =>
                props.onSpellChange({
                  ...props.spell,
                  usage: e.currentTarget.valueAsNumber,
                } as SpellInGrimoire)
              }
            />
          </Show>
        </div>
      </Show>
      <Show when={assertSpellInGrimoire(props.spell) && props.spell.custom}>
        <div class="bg-base-100 flex min-w-0 place-items-center place-content-between rounded-lg text-primary flex-1">
          {customNameInput}
          <div
            class="tooltip tooltip-error"
            classList={{ "tooltip-open": confirmDelete() }}
            data-tip="Appuyez deux fois pour supprimer"
          >
            <button
              class="btn btn-square btn-error-ghost rounded-none"
              classList={{
                "btn-error": confirmDelete(),
                "btn-error-ghost": !confirmDelete(),
              }}
              onClick={() => {
                if (confirmDelete()) {
                  hapticImpact();
                  props.onSpellDelete();
                  setConfirmDelete(false);
                } else {
                  hapticSelection();
                  setConfirmDelete(true);
                }
              }}
            >
              {confirmDelete() ? (
                <QuestionMarkCircle />
              ) : (
                <DeleteCircledOutline />
              )}
            </button>
          </div>
          <input
            type="number"
            class="input m-0 rounded-l-none w-10 px-0 number-spinner-none font-bold text-center"
            onFocusIn={() => hapticSelection()}
            value={(props.spell as SpellInGrimoire).usage}
            onInput={(e) =>
              props.onSpellChange({
                ...props.spell,
                usage: e.currentTarget.valueAsNumber,
              } as SpellInGrimoire)
            }
          />
        </div>
      </Show>
      <Show when={assertSpellInGrimoire(props.spell) && props.showButtons}>
        <button
          class="btn btn-primary-ghost btn-square"
          onClick={() => {
            if (!assertSpellInGrimoire(props.spell)) {
              return;
            }

            if (props.spell.usage > 0) {
              hapticImpact();
            }
            props.onSpellChange({
              ...props.spell,
              usage: Math.max(0, props.spell.usage - 1),
            });
          }}
        >
          <Minus />
        </button>
        <button
          class="btn btn-primary-ghost btn-square"
          onClick={() => {
            if (!assertSpellInGrimoire(props.spell)) {
              return;
            }

            props.onSpellChange({
              ...props.spell,
              usage: props.spell.usage + 1,
            });
            hapticImpact();
          }}
        >
          <Plus />
        </button>
      </Show>
    </li>
  );
}
