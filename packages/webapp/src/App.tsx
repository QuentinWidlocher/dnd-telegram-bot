import { Component, Show } from 'solid-js'
import {
  createCloseSignal,
  createExpandSignal,
  createUserSignal,
  HapticButton,
  MainButton,
} from 'telegram-webapp-solid'
import { Layout } from './Layout'

const App: Component = () => {
  const [expanded, expand] = createExpandSignal()
  const close = createCloseSignal()
  const user = createUserSignal()

  return (
    <Layout>
      <div class="my-auto flex flex-col">
        <p class="text-center text-hint w-full">
          Hi {user?.first_name ?? ''}, welcome to the demo app. <br />
        </p>
        <Show when={!expanded()}>
          <HapticButton
            class="btn btn-primary btn-outline w-full mt-5"
            onClick={() => expand()}
          >
            Expand the view
          </HapticButton>
        </Show>
      </div>

      <MainButton text="Close the app" onClick={close} />
    </Layout>
  )
}

export default App
