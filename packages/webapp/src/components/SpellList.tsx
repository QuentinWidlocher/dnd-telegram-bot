import { Spell, SpellInGrimoire } from "shared";
import { Link } from "solid-app-router";
import { createEffect, For, mergeProps, ParentProps, Show } from "solid-js";
import { createMainButtonSignal } from "telegram-webapp-solid";
import Plus from "../../node_modules/iconoir/icons/plus.svg";
import Minus from "../../node_modules/iconoir/icons/minus.svg";
import DeleteCircledOutline from "../../node_modules/iconoir/icons/delete-circled-outline.svg";

type AnySpell = SpellInGrimoire | Spell;

export type SpellListProps = {
  spells: AnySpell[];
  showButtons?: boolean;
  onPlusButtonClick?: (i: number) => void;
  onMinusButtonClick?: (i: number) => void;
  emptyMessage?: string;
  onSpellChange?: (index: number, spell: SpellInGrimoire) => void;
  onSpellDelete?: (index: number) => void;
};

function assertSpellInGrimoire(spell: AnySpell): spell is SpellInGrimoire {
  return "usage" in spell;
}

function assertSpell(spell: AnySpell): spell is Spell {
  return !("usage" in spell);
}

export function SpellList(props: ParentProps<SpellListProps>) {
  const mainButton = createMainButtonSignal({});
  const mergedProps = mergeProps(
    {
      showButtons: false,
      emptyMessage: "Aucun sort à afficher",
    },
    props
  );

  createEffect(() => {
    console.log("SpellList props", mergedProps.spells);
  });

  return (
    <ul class="flex-1 my-auto flex flex-col space-y-2 overflow-y-auto bg-base-300 -mx-5 p-5 shadow-inner">
      <For each={mergedProps.spells}>
        {(spell: AnySpell, i) => (
          <li class="flex w-full space-x-2">
            <Show
              when={
                assertSpell(spell) ||
                (assertSpellInGrimoire(spell) && !spell.custom)
              }
            >
              <Link
                onClick={() => mainButton.setVisible(false)}
                href={`/spell/${spell.id}`}
                class="bg-base-100 focus:bg-primary focus:bg-opacity-20 hover:bg-base-200 hover:text-primary-focus px-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1 py-3"
              >
                <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {spell.name}
                </span>
                <Show when={assertSpellInGrimoire(spell)}>
                  <span class="ml-2 font-bold">
                    {assertSpellInGrimoire(spell) && spell.usage}
                  </span>
                </Show>
              </Link>
            </Show>
            <Show when={assertSpellInGrimoire(spell) && spell.custom}>
              <div class="bg-base-100 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1 pr-5">
                <input
                  type="text"
                  value={spell.name}
                  class="flex-1 input text-base min-w-0 rounded-r-none"
                  onInput={(e) => {
                    mergedProps.onSpellChange(i(), {
                      ...(spell as SpellInGrimoire),
                      name: e.currentTarget.value,
                    });
                  }}
                >
                  {spell.name}
                </input>
                <button
                  class="btn btn-square btn-error-ghost rounded-none"
                  onClick={() => mergedProps.onSpellDelete(i())}
                >
                  <DeleteCircledOutline />
                </button>
                <span class="ml-5 font-bold">
                  {assertSpellInGrimoire(spell) && spell.usage}
                </span>
              </div>
            </Show>
            <Show
              when={assertSpellInGrimoire(spell) && mergedProps.showButtons}
            >
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => mergedProps.onMinusButtonClick(i())}
                disabled={assertSpellInGrimoire(spell) && spell.usage <= 0}
              >
                <Minus />
              </button>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => mergedProps.onPlusButtonClick(i())}
              >
                <Plus />
              </button>
            </Show>
          </li>
        )}
      </For>
      <Show when={mergedProps.spells?.length <= 0}>
        <li class="text-center text-hint my-auto">
          {mergedProps.emptyMessage}
        </li>
      </Show>
      {mergedProps.children}
    </ul>
  );
}
