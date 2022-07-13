import { Navigate, Route, Router, Routes } from 'solid-app-router'
import { lazy, Suspense } from 'solid-js'
import { Layout } from './components/Layout'
import { grimoireRouteLoader } from './routes/grimoire.data'
import { spellRouteLoader } from './routes/spell.data'

const GrimoireRoute = lazy(() => import('./routes/grimoire.route'))
const SpellRoute = lazy(() => import('./routes/spell.route'))

export function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <Layout>
            <span class="my-auto w-full text-center-text-hint">
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
          <Route path="/">
            <Navigate href={'/grimoire'} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}
