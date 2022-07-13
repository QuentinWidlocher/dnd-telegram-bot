import { SpellInGrimoire } from 'shared'
import { useRouteData } from 'solid-app-router'
import { Resource, Show } from 'solid-js'
import { createUserSignal } from 'telegram-webapp-solid'
import { Grimoire } from '../components/Grimoire'
import { Layout } from '../components/Layout'

export default function GrimoireRoute() {
  const user = createUserSignal()
  const spells = useRouteData<Resource<SpellInGrimoire[]>>()

  return (
    <Show when={!spells.loading && !spells.error}>
      <Layout>
        <Grimoire
          spells={spells()}
          onSaveClick={async (spells) => {
            let url = new URL(
              `https://dnd-telegram-bot.netlify.app/.netlify/functions/save-spells`,
            )
            url.searchParams.set('user-id', String(user().id))

            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(spells),
            })

            close()
          }}
        />
      </Layout>
    </Show>
  )
}
