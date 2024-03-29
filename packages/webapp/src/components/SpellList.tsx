import { AnySpell, SpellInGrimoire } from "shared";
import { For, mergeProps, ParentProps, Show } from "solid-js";
import { Spell as SpellComponent } from "./Spell";
import autoAnimate from "@formkit/auto-animate";
import DatabaseScript from "../../node_modules/iconoir/icons/database-script.svg";

export type SpellListProps = {
  spells: AnySpell[];
  showButtons?: boolean;
  onSpellChange?: (index: number, spell: SpellInGrimoire) => void;
  onSpellDelete?: (index: number) => void;
  emptyMessage?: string;
};

export function SpellList(props: ParentProps<SpellListProps>) {
  const mergedProps = mergeProps(
    {
      showButtons: false,
      emptyMessage: "Aucun sort à afficher",
    },
    props
  );

  let list = (
    <ul class="flex-1 my-auto flex flex-col space-y-2 overflow-y-auto bg-base-200 -mx-5 p-5 shadow-inner">
      <For each={mergedProps.spells}>
        {(spell: AnySpell, i) => (
          <SpellComponent
            spell={spell}
            onSpellChange={(spell: SpellInGrimoire) =>
              mergedProps.onSpellChange(i(), spell)
            }
            onSpellDelete={() => mergedProps.onSpellDelete(i())}
            showButtons={mergedProps.showButtons}
          />
        )}
      </For>
      <Show when={mergedProps.spells?.length <= 0}>
        <li class="text-center text-hint my-auto overflow-x-hidden py-5">
          <div class="flex justify-center scale-[300%] mb-10">
            <DatabaseScript />
          </div>
          {mergedProps.emptyMessage}
        </li>
      </Show>
      {mergedProps.children}
    </ul>
  );

  autoAnimate(list as HTMLUListElement);

  return list;
}
