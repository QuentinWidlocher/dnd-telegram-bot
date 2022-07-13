import { RouteDataFunc } from "solid-app-router";
import { createDatabaseSignal } from "../utils/database-signal";

export const grimoireRouteLoader: RouteDataFunc = ({ }) => {
  const database = createDatabaseSignal();

  return database.getSpells();
};
