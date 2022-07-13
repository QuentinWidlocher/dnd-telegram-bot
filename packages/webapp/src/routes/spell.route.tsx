import { Spell, spells, schoolsNames } from 'shared'
import { RouteDataFunc, useNavigate, useRouteData } from 'solid-app-router'
import { createBackButtonSignal } from 'telegram-webapp-solid'
import { Layout } from '../components/Layout'

export const spellRouteLoader: RouteDataFunc<Promise<Spell>> = async ({
  params,
}) => {
  return spells.find((spell) => spell.id === params.spellId)
}

export default function SpellRoute() {
  const spell = useRouteData<Spell>()
  const navigate = useNavigate()
  const backButton = createBackButtonSignal({
    show: true,
    onClick: () => {
      backButton.setVisible(false)
      navigate(-1)
    },
  })

  return (
    <>
      <Layout>
        <div class="bg-base-200 text-center bg-blend-overlay -m-2 p-5 rounded-xl h-full flex flex-col align-middle">
          <h1 class="font-bold text-3xl text-primary mx-auto my-3">
            {spell.level}
          </h1>
          <div class="w-full">
            <h1 class="font-bold text-xl my-0 text-primary">{spell.name}</h1>
            <h2 class="text-primary">
              {schoolsNames[spell.school]}
              {spell.isRitual ? ` (Rituel)` : ''}
            </h2>
          </div>
          <ul class="text-left my-5 w-full lg:w-2/3">
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Temps d'incantation :</strong>
                </div>
                <div class="w-1/2">{spell.castingTime}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Portée :</strong>
                </div>
                <div class="w-1/2">{spell.range}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Durée du sort :</strong>
                </div>
                <div class="w-1/2">{spell.duration}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Composantes :</strong>
                </div>
                <div class="w-1/2 h-20 overflow-y-auto">{spell.components}</div>
              </div>
            </li>
          </ul>
          <p
            class="text-left text-paper-900 flex-grow overflow-y-auto"
            innerHTML={spell.description}
          ></p>
        </div>
      </Layout>
    </>
  )
}
