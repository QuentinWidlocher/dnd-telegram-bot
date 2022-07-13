import { Spell, SpellInGrimoire } from 'shared'
import { Link } from 'solid-app-router'
import { createEffect, For, mergeProps, ParentProps, Show } from 'solid-js'
import { createMainButtonSignal } from 'telegram-webapp-solid'

type AnySpell = SpellInGrimoire | Spell

export type SpellListProps = {
  spells: AnySpell[]
  showButtons?: boolean
  onPlusButtonClick?: (i: number) => void
  onMinusButtonClick?: (i: number) => void
  emptyMessage?: string
}

function assertSpellInGrimoire(spell: AnySpell): spell is SpellInGrimoire {
  return 'usage' in spell
}

function assertSpell(spell: AnySpell): spell is Spell {
  return !('usage' in spell)
}

export function SpellList(props: ParentProps<SpellListProps>) {
  const mainButton = createMainButtonSignal({})
  const mergedProps = mergeProps(
    {
      showButtons: false,
      emptyMessage: 'Aucun sort à afficher',
    },
    props,
  )

  createEffect(() => {
    console.log('SpellList props', mergedProps.spells)
  })

  return (
    <ul class="flex-1 my-auto flex flex-col space-y-2 overflow-y-auto bg-base-300 -mx-5 p-5 shadow-inner">
      <For each={mergedProps.spells}>
        {(spell: AnySpell, i) => (
          <li class="flex w-full space-x-2">
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
            <Show
              when={assertSpellInGrimoire(spell) && mergedProps.showButtons}
            >
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => mergedProps.onMinusButtonClick(i())}
                disabled={assertSpellInGrimoire(spell) && spell.usage <= 0}
              >
                -
              </button>
              <button
                class="btn btn-primary-ghost btn-square"
                onClick={() => mergedProps.onPlusButtonClick(i())}
              >
                +
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
  )
}
