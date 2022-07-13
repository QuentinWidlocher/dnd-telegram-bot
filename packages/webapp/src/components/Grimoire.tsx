import { SpellInGrimoire } from 'shared'
import { Link } from 'solid-app-router'
import { createEffect, For, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createMainButtonSignal } from 'telegram-webapp-solid'
import { createBooleanTimeoutSignal } from '../utils/boolean-timeout-signal'
import { SpellList } from './SpellList'
import { LocalTest } from './test'

export type GrimoireProps = {
  spells: SpellInGrimoire[]
  onSaveClick: (spells: SpellInGrimoire[]) => void
}

export function Grimoire(props: GrimoireProps) {
  const originalSpells = [...props.spells.map((s) => ({ ...s }))]
  const [spells, setSpells] = createStore<SpellInGrimoire[]>(props.spells)
  const [confirmRest, setConfirmRest] = createBooleanTimeoutSignal()
  const mainButton = createMainButtonSignal({
    text: 'Sauvegarder',
    show: false,
    onClick: () => {
      props.onSaveClick(spells)
    },
  })

  createEffect(() => {
    if (
      originalSpells.some(
        (s) => spells.find((s2) => s2.id == s.id)?.usage != s.usage,
      )
    ) {
      mainButton.setVisible(true)
    } else {
      mainButton.setVisible(false)
    }
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
      <SpellList
        spells={spells}
        showButtons
        onPlusButtonClick={(i) => updateUsage(i, 1)}
        onMinusButtonClick={(i) => updateUsage(i, -1)}
        emptyMessage="Aucun sort dans votre grimoire"
      >
        <li class="w-full">
          <Link href="/spell-search" class="btn btn-primary-ghost w-full">
            Ajouter un sort au grimoire
          </Link>
        </li>
      </SpellList>
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
