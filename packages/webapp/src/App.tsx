import { Component, createResource, Match, Show, Switch } from "solid-js";
import {
  createInitDataSignal,
  createUserSignal,
  MainButton,
} from "telegram-webapp-solid";
import { Layout } from "./Layout";

const App: Component = () => {
  const user = createUserSignal();
  const [initData, sendData] = createInitDataSignal();
  const data = JSON.parse(
    new URL(window.location.href).searchParams.get("data") ?? "{}"
  );

  return (
    <Layout>
      <div class="my-auto flex flex-col">
        <p class="text-center text-hint w-full">
          Hi {user?.first_name ?? ""}, welcome to the demo app. <br />
        </p>
        <div tabindex="0" class="collapse">
          <div class="collapse-title font-mono">initData</div>
          <div class="collapse-content">
            <pre class="text-hint mx-auto">
              <code>{JSON.stringify(initData(), null, 2)}</code>
            </pre>
          </div>
        </div>
        <div tabindex="0" class="collapse">
          <div class="collapse-title font-mono">data</div>
          <div class="collapse-content">
            <pre class="text-hint mx-auto">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        </div>
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
