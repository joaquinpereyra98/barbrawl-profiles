import CONSTANTS from "./constants.mjs";

export default function registerSettings() {
  const { apps, data } = game.modules.get(CONSTANTS.MODULE_ID);

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES, {
    names: "Profies Storage",
    scope: "world",
    config: false,
    type: data.ProfilesSetting,
    requiresReload: false,
    default: {
      profiles: [],
    },
  });

  game.settings.registerMenu(
    CONSTANTS.MODULE_ID,
    CONSTANTS.SETTINGS.PROFILES_MENU,
    {
      name: "Barbrawl Profiles Manager",
      label: "Barbrawl Profile Manager",
      hint: "Manage Barbrawl profiles",
      icon: "fas fa-bars",
      type: apps.BarbrawlProfileConfig,
      restricted: true,
    }
  );
}
