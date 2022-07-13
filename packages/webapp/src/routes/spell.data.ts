import { SpellInGrimoire, spells } from "shared";
import { RouteDataFunc, useNavigate } from "solid-app-router";
import { Resource } from "solid-js";

export const spellRouteLoader: RouteDataFunc = ({ params, data }) => {
  const foundSpell = spells.find((spell) => spell.id === params.id);

  if (foundSpell == null) {
    const navigate = useNavigate();
    navigate("/grimoire");
    return;
  }

  const grimoire = (data as Resource<SpellInGrimoire[]>)();

  return {
    spell: foundSpell,
    grimoire
  };
};
