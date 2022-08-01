/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import "./polyfill";

import { App } from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
