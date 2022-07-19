import { spells } from "shared";
import { RouteDataFunc, useNavigate } from "solid-app-router";
import { createDatabaseSignal } from "../utils/database-signal";

export const spellRouteLoader: RouteDataFunc = ({ params }) => {
  const foundSpell = spells.find((spell) => spell.id === params.id);

  if (foundSpell == null) {
    const navigate = useNavigate();
    navigate("/grimoire");
    return;
  }

  const database = createDatabaseSignal();

  const grimoire = database.getSpells();

  return {
    spell: foundSpell,
    grimoire,
  };
};
