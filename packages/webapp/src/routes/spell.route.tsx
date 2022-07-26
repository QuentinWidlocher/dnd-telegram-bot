import { schoolsNames, Spell, SpellInGrimoire, spells } from "shared";
import { RouteDataFunc, useNavigate, useRouteData } from "solid-app-router";
import { createEffect, createSignal, Resource, Show } from "solid-js";
import {
  createBackButtonSignal,
  createHapticImpactSignal,
} from "telegram-webapp-solid";
import AddDatabaseScript from "../../node_modules/iconoir/icons/add-database-script.svg";
import RemoveDatabaseScript from "../../node_modules/iconoir/icons/remove-database-script.svg";
import { Layout } from "../components/Layout";
import { createDatabaseSignal } from "../utils/database-signal";

export const spellRouteLoader: RouteDataFunc<Promise<Spell>> = async ({
  params,
}) => {
  return spells.find((spell) => spell.id === params.spellId);
};

export default function SpellRoute() {
  const data = useRouteData<{
    spell: Spell;
    grimoire: Resource<SpellInGrimoire[]>;
  }>();

  const [grimoire, setGrimoire] = createSignal<SpellInGrimoire[] | null>(null);
  const [saving, setSaving] = createSignal(false);

  createEffect(() => {
    if (!data.grimoire.loading && !data.grimoire.error) {
      setGrimoire(data.grimoire());
    }
  });

  const spellIsAlreadyInGrimoire = () =>
    grimoire()?.some((spell) => spell.id == data.spell.id);

  const database = createDatabaseSignal();

  const navigate = useNavigate();
  const backButton = createBackButtonSignal({
    show: true,
    onClick: function goBack() {
      backButton.setVisible(false);
      navigate("/grimoire");
    },
  });

  const hapticImpact = createHapticImpactSignal("medium");

  async function addToGrimoire() {
    hapticImpact();
    setSaving(true);
    const updatedGrimoire = [
      ...grimoire().filter((spell) => spell.id != data.spell.id),
      {
        id: data.spell.id,
        name: data.spell.name,
        usage: 0,
        custom: false,
      },
    ];
    await database.saveSpells(updatedGrimoire);
    setGrimoire(updatedGrimoire);
    setSaving(false);
  }

  async function removeFromGrimoire() {
    hapticImpact();
    setSaving(true);
    const updatedGrimoire = grimoire().filter(
      (spell) => spell.id != data.spell.id
    );
    await database.saveSpells(updatedGrimoire);
    setGrimoire(updatedGrimoire);
    setSaving(false);
  }

  return (
    <>
      <Layout>
        <div class="bg-base-200 text-center bg-blend-overlay -m-2 p-5 rounded-xl h-full flex flex-col align-middle">
          <h1 class="font-bold text-3xl text-primary mx-auto my-3">
            {data.spell.level}
          </h1>
          <div class="w-full">
            <h1 class="font-bold text-xl my-0 text-primary">
              {data.spell.name}
            </h1>
            <h2 class="text-primary">
              {schoolsNames[data.spell.school]}
              {data.spell.isRitual ? ` (Rituel)` : ""}
            </h2>
          </div>
          <ul class="text-left my-5 w-full lg:w-2/3">
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Temps d'incantation :</strong>
                </div>
                <div class="w-1/2">{data.spell.castingTime}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Portée :</strong>
                </div>
                <div class="w-1/2">{data.spell.range}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Durée du sort :</strong>
                </div>
                <div class="w-1/2">{data.spell.duration}</div>
              </div>
            </li>
            <li>
              <div class="flex">
                <div class="w-1/2">
                  <strong>Composantes :</strong>
                </div>
                <div class="w-1/2 h-20 overflow-y-auto">
                  {data.spell.components}
                </div>
              </div>
            </li>
          </ul>
          <p
            class="text-left flex-grow overflow-y-auto"
            innerHTML={
              data.spell.description +
              (data.spell.higherLevel ? `<hr>${data.spell.higherLevel}` : "")
            }
          ></p>
          <Show
            when={grimoire() && spellIsAlreadyInGrimoire()}
            fallback={
              <button
                class="btn btn-primary w-full mt-2 space-x-2"
                classList={{ loading: saving() }}
                onClick={() => addToGrimoire()}
                disabled={saving() || data.grimoire.loading}
              >
                {saving() ? null : <AddDatabaseScript />}
                <span>Ajouter au grimoire</span>
              </button>
            }
          >
            <button
              class="btn btn-error-ghost w-full mt-2 space-x-2"
              classList={{ loading: saving() }}
              onClick={() => removeFromGrimoire()}
              disabled={saving() || data.grimoire.loading}
            >
              {saving() ? null : <RemoveDatabaseScript />}
              <span>Retirer du grimoire</span>
            </button>
          </Show>
        </div>
      </Layout>
    </>
  );
}
