import { SpellInGrimoire } from "shared"
import { createResource } from "solid-js"
import { createUserSignal } from "telegram-webapp-solid"

export function createDatabaseSignal() {
  const user = createUserSignal()
  const userId = import.meta.env.PROD ? String(user().id) : "260800881";

  async function saveSpells(spells: SpellInGrimoire[]) {
    let url = new URL(
      `https://dnd-telegram-bot.netlify.app/.netlify/functions/save-spells`,
    )
    url.searchParams.set('user-id', userId)

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spells),
    })
  }

  function getSpells() {
    let url = new URL(
      `https://dnd-telegram-bot.netlify.app/.netlify/functions/get-spells`
    );
    url.searchParams.set("user-id", userId);

    const [r] = createResource<SpellInGrimoire[]>(() => fetch(url).then((res) => res.json()));

    return r;
  }

  async function updateSpells(map: (spells: SpellInGrimoire[]) => SpellInGrimoire[]) {
    const spells = await getSpells();
    const newSpells = map(spells());
    await saveSpells(newSpells);
  }

  return {
    saveSpells,
    getSpells,
    updateSpells
  }
}