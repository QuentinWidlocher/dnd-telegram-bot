import { SpellInGrimoire } from 'shared'
import { Link } from 'solid-app-router'
import { For, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createMainButtonSignal } from 'telegram-webapp-solid'
import { createBooleanTimeoutSignal } from '../utils/boolean-timeout-signal'
import { LocalTest } from './test'

export type GrimoireProps = {
  spells: SpellInGrimoire[]
  onSaveClick: (spells: SpellInGrimoire[]) => void
}

export function Grimoire(props: GrimoireProps) {
  const [spells, setSpells] = createStore<SpellInGrimoire[]>(props.spells)
  const [confirmRest, setConfirmRest] = createBooleanTimeoutSignal()
  const mainButton = createMainButtonSignal({
    text: 'Sauvegarder',
    show: true,
    onClick: () => {
      props.onSaveClick(spells)
    },
  })

  function updateUsage(index: number, diff: number) {
    setSpells(index, (spell) => ({
      ...spell,
      usage: Math.max(0, spell.usage + diff),
    }))
  }

  return (
    <div class="flex flex-col flex-1 overflow-y-hidden -mx-5 px-5">
      <div class="flex w-full space-x-2 h-5 mb-1">
        <div class="flex-1 flex justify-between text-hint text-sm px-2">
          <span>Sorts ({spells.length})</span>
          <span>Utilisation</span>
        </div>
        <div class="invisible btn btn-square"></div>
        <div class="invisible btn btn-square"></div>
      </div>
      <ul class="flex-1 my-auto flex flex-col space-y-2 overflow-y-auto bg-base-300 -mx-5 p-5 shadow-inner">
        <For each={spells}>
          {(spell, i) => (
            <li class="flex w-full space-x-2">
              <div class="bg-base-100 px-5 overflow-hidden flex place-items-center place-content-between rounded-lg text-primary flex-1">
                <Link
                  onClick={() => mainButton.setVisible(false)}
                  href={`/spell/${spell.id}`}
                  class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {spell.name}
                </Link>
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
            'btn-error': confirmRest(),
            'btn-primary-ghost': !confirmRest(),
          }}
          onClick={() => {
            if (confirmRest()) {
              setSpells(
                spells.map((spell) => ({
                  ...spell,
                  usage: 0,
                })),
              )
              setConfirmRest(false)
            } else {
              setConfirmRest(true)
            }
          }}
          disabled={spells.every((s) => s.usage <= 0)}
        >
          {confirmRest() ? 'Appuyez pour valider' : 'Se reposer'}
        </button>
        <span class="text-hint text-center text-sm w-full mt-2">
          Un repos remet tous les compteurs à zéro
        </span>
      </div>
    </div>
  )
}
