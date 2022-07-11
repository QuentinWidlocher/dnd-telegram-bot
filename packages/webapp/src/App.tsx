import { Component, createResource, Show } from 'solid-js'
import {
  createInitDataSignal,
  createUserSignal,
  MainButton,
} from 'telegram-webapp-solid'
import { retreive } from '../../../utils/storage'
import { Layout } from './Layout'

const App: Component = () => {
  const user = createUserSignal()
  const [initData, sendData] = createInitDataSignal()

  const [data] = createResource(() => {
    return retreive(user?.id)
  })

  return (
    <Layout>
      <div class="my-auto flex flex-col">
        <p class="text-center text-hint w-full">
          Hi {user?.first_name ?? ''}, welcome to the demo app. <br />
        </p>
        <Show
          when={!data.loading}
          fallback={
            <span class="text-center text-hint w-full">Loading your data</span>
          }
        >
          <pre>
            <code>{JSON.stringify(data(), null, 2)}</code>
          </pre>
        </Show>
      </div>

      <MainButton
        text="Close the app"
        onClick={() => {
          sendData(JSON.stringify({ date: new Date() }))
        }}
      />
    </Layout>
  )
}

export default App
