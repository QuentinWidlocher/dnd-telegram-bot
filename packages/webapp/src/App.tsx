import { Component, createResource, Match, Switch } from "solid-js";
import {
  createInitDataSignal,
  createUserSignal,
  MainButton,
} from "telegram-webapp-solid";
import { retreive } from "shared";
import { Layout } from "./Layout";

const App: Component = () => {
  const user = createUserSignal();
  const [initData, sendData] = createInitDataSignal();

  const [data] = createResource(() => {
    return retreive(user?.id);
  });

  return (
    <Layout>
      <div class="my-auto flex flex-col">
        <p class="text-center text-hint w-full">
          Hi {user?.first_name ?? ""}, welcome to the demo app. <br />
        </p>
        <Switch>
          <Match when={data.loading}>
            <span class="text-center text-hint w-full">Loading your data</span>
          </Match>
          <Match when={data.error}>
            <span class="text-center text-error w-full">
              Error loading your data
            </span>{" "}
            <br />
            <pre class="text-error mx-auto">
              <code>{JSON.stringify(data.error, null, 2)}</code>
            </pre>
          </Match>
          <Match when={data()}>
            <pre class="text-hint mx-auto">
              <code>{JSON.stringify(data(), null, 2)}</code>
            </pre>
          </Match>
        </Switch>
      </div>

      <MainButton
        text="Close the app"
        onClick={() => {
          sendData(JSON.stringify({ date: new Date() }));
        }}
      />
    </Layout>
  );
};

export default App;
