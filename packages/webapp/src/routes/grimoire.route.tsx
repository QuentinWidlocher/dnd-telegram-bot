import { SpellInGrimoire } from 'shared'
import { useRouteData } from 'solid-app-router'
import { Resource, Show } from 'solid-js'
import { createCloseSignal, createUserSignal } from 'telegram-webapp-solid'
import { Grimoire } from '../components/Grimoire'
import { Layout } from '../components/Layout'
import { createDatabaseSignal } from '../utils/database-signal'

export default function GrimoireRoute() {
  const database = createDatabaseSignal()
  const close = createCloseSignal()
  const spells = useRouteData<Resource<SpellInGrimoire[]>>()
  console.log('Grimoire routeData', spells)

  return (
    <Show when={!spells.loading && !spells.error}>
      <Layout>
        <Grimoire
          spells={spells()}
          onSaveClick={async (spells) => {
            await database.saveSpells(spells)
            close()
          }}
        />
      </Layout>
    </Show>
  )
}
