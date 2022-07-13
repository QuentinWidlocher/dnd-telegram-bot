import { spells } from "shared";
import { RouteDataFunc, useNavigate } from "solid-app-router";

export const spellRouteLoader: RouteDataFunc = ({ params }) => {
  const foundSpell = spells.find((spell) => spell.id === params.id);

  if (foundSpell == null) {
    const navigate = useNavigate();
    navigate("/grimoire");
    return;
  }

  return foundSpell;
};
