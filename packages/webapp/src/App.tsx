import { Component } from 'solid-js'
import {
  createInitDataSignal,
  createUserSignal,
  MainButton,
} from 'telegram-webapp-solid'
import { Layout } from './Layout'

const App: Component = () => {
  const user = createUserSignal()
  const [data, sendData] = createInitDataSignal()

  return (
    <Layout>
      <div class="my-auto flex flex-col">
        <p class="text-center text-hint w-full">
          Hi {user?.first_name ?? ''}, welcome to the demo app.
        </p>
        <pre>
          <code>{JSON.stringify(data(), null, 2)}</code>
        </pre>
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
