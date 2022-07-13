import { searchSpellByName, spells } from 'shared'
import { useNavigate } from 'solid-app-router'
import { createSignal, Show } from 'solid-js'
import { createBackButtonSignal } from 'telegram-webapp-solid'
import { Layout } from '../components/Layout'
import { SpellList } from '../components/SpellList'

export default function SpellSearchRoute() {
  const [searchQuery, setSearchQuery] = createSignal('')
  const filteredSpells = () =>
    searchQuery() ? searchSpellByName(searchQuery()) : []

  const navigate = useNavigate()
  const backButton = createBackButtonSignal({
    show: true,
    onClick: function goBack() {
      backButton.setVisible(false)
      navigate('/grimoire')
    },
  })

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
