import CONSTANTS from "./constants.mjs";

export default function registerSettings() {

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES, {
    names: "Profies Storage",
    scope: "world",
    config: false,
    type: Object,
    default: {},
    requiresReload: false,
  });

  const { BarbrawlProfileConfig } = game.modules.get(CONSTANTS.MODULE_ID).apps;

  game.settings.registerMenu(
    CONSTANTS.MODULE_ID,
    CONSTANTS.SETTINGS.PROFILES_MENU,
    {
      name: "barbrawlProfiles",
      label: "Barbrawl Profile Manager",
      hint: "Manage Barbrawl bar profiles for tokens, including creation, editing, and deletion",
      icon: "fas fa-bars",
      type: BarbrawlProfileConfig,
      restricted: true,
    }
  );
}
