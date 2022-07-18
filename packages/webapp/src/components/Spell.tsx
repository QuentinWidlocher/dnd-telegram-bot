import {
  AnySpell,
  assertSpellInGrimoire,
  assertSpell,
  SpellInGrimoire,
} from 'shared'
import { Link } from 'solid-app-router'
import Plus from '../../node_modules/iconoir/icons/plus.svg'
import Minus from '../../node_modules/iconoir/icons/minus.svg'
import DeleteCircledOutline from '../../node_modules/iconoir/icons/delete-circled-outline.svg'
import QuestionMarkCircle from '../../node_modules/iconoir/icons/question-mark-circle.svg'
import { Show } from 'solid-js'
import { createMainButtonSignal } from 'telegram-webapp-solid'
import { createBooleanTimeoutSignal } from '../utils/boolean-timeout-signal'

export type SpellProps = {
  spell: AnySpell
  onPlusButtonClick?: () => void
  onMinusButtonClick?: () => void
  onSpellChange?: (spell: SpellInGrimoire) => void
  onSpellDelete?: () => void
  showButtons: boolean
}

export function Spell(props: SpellProps) {
  const mainButton = createMainButtonSignal({})
  const [confirmDelete, setConfirmDelete] = createBooleanTimeoutSignal()

  return (
    <li class="flex w-full space-x-2">
      <Show
        when={
          assertSpell(props.spell) ||
          (assertSpellInGrimoire(props.spell) && !props.spell.custom)
        }
      >
        <Link
          onClick={() => mainButton.setVisible(false)}
          href={`/spell/${props.spell.id}`}
          class="bg-base-100 focus:bg-primary focus:bg-opacity-20 hover:bg-base-200 hover:text-primary-focus px-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1 py-3"
        >
          <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {props.spell.name}
          </span>
          <Show when={assertSpellInGrimoire(props.spell)}>
            <span class="ml-2 font-bold">
              {assertSpellInGrimoire(props.spell) && props.spell.usage}
            </span>
          </Show>
        </Link>
      </Show>
      <Show when={assertSpellInGrimoire(props.spell) && props.spell.custom}>
        <div class="bg-base-100 flex place-items-center place-content-between rounded-lg text-primary flex-1 pr-5">
          <input
            type="text"
            value={props.spell.name}
            class="flex-1 input text-base min-w-0 rounded-r-none"
            onInput={(e) => {
              props.onSpellChange({
                ...(props.spell as SpellInGrimoire),
                name: e.currentTarget.value,
              })
            }}
          >
            {props.spell.name}
          </input>
          <div
            class="tooltip tooltip-error"
            classList={{ 'tooltip-open': confirmDelete() }}
            data-tip="Appuyez deux fois pour supprimer"
          >
            <button
              class="btn btn-square btn-error-ghost rounded-none"
              classList={{
                'btn-error': confirmDelete(),
                'btn-error-ghost': !confirmDelete(),
              }}
              onClick={() => {
                if (confirmDelete()) {
                  props.onSpellDelete()
                  setConfirmDelete(false)
                } else {
                  setConfirmDelete(true)
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
          <span class="ml-5 font-bold">
            {assertSpellInGrimoire(props.spell) && props.spell.usage}
          </span>
        </div>
      </Show>
      <Show when={assertSpellInGrimoire(props.spell) && props.showButtons}>
        <button
          class="btn btn-primary-ghost btn-square"
          onClick={() => props.onMinusButtonClick()}
          disabled={
            assertSpellInGrimoire(props.spell) && props.spell.usage <= 0
          }
        >
          <Minus />
        </button>
        <button
          class="btn btn-primary-ghost btn-square"
          onClick={() => props.onPlusButtonClick()}
        >
          <Plus />
        </button>
      </Show>
    </li>
  )
}
