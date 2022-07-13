import { searchSpellByName, spells } from 'shared'
import { createSignal, Show } from 'solid-js'
import { Layout } from '../components/Layout'
import { SpellList } from '../components/SpellList'

export default function SpellSearchRoute() {
  const [searchQuery, setSearchQuery] = createSignal('')
  const filteredSpells = () =>
    searchQuery() ? searchSpellByName(searchQuery()) : []

  return (
    <Layout>
      <SpellList
        spells={filteredSpells()}
        emptyMessage="Aucun sort à afficher, modifiez votre recherche"
      />
      <input
        type="text"
        class="input input-bordered input-primary w-full mt-5"
        id="search"
        placeholder="Chercher un sort"
        onInput={(e) => setSearchQuery(e.currentTarget.value)}
      />
    </Layout>
  )
}
