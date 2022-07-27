import { Navigate, Route, Router, Routes } from "solid-app-router";
import { lazy, onMount, Suspense } from "solid-js";
import {
  createExpandSignal,
  createLifecycleSignal,
} from "telegram-webapp-solid";
import { Layout } from "./components/Layout";
import { grimoireRouteLoader } from "./routes/grimoire.data";
import { spellRouteLoader } from "./routes/spell.data";

const GrimoireRoute = lazy(() => import("./routes/grimoire.route"));
const SpellRoute = lazy(() => import("./routes/spell.route"));
const SpellSearchRoute = lazy(() => import("./routes/spell-search.route"));

export function App() {
  const { ready } = createLifecycleSignal();
  const [, expand] = createExpandSignal();

  onMount(() => {
    ready();
    expand();
  });

  return (
    <Router>
      <Suspense
        fallback={
          <Layout>
            <span class="my-auto w-full text-center text-hint">
              Chargement...
            </span>
          </Layout>
        }
      >
        <Routes>
          <Route
            path="/grimoire"
            component={GrimoireRoute}
            data={grimoireRouteLoader}
          />
          <Route
            path="/spell/:id"
            component={SpellRoute}
            data={spellRouteLoader}
          />
          <Route path="/spell-search" component={SpellSearchRoute} />
          <Route path="/">
            <Navigate href={"/grimoire"} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
