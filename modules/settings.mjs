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

  if (game.modules.get("token-mold")) {
    game.settings.register(
      CONSTANTS.MODULE_ID,
      CONSTANTS.SETTINGS.PROFILES_TOKEN_MOLD,
      {
        names: "Profies Token Mold Storage",
        scope: "world",
        config: false,
        type: data.TokenMoldSetting,
        requiresReload: false,
        default: {
          profile: "",
          overwrite: false,
        },
      }
    );
  }

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.ASK_PROFILE, {
    name: "Ask for Profile on Actor Creation",
    hint: "When enabled, a dialog will appear each time an Actor is created, allowing you to choose which profile to apply.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.DEFAULT_PROFILE_BOOLEAN, {
    name: "Default Actor Profile",
    hint: "When enabled, new actors will use the specified default profile without showing the creation dialog.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.DEFAULT_PROFILE_VALUE, {
    name: "Default Actor Profile ID",
    hint: "Defines the default profile to be assigned when creating new actors. Only applies if the 'Default Actor Profile' setting is enabled.",
    scope: "world",
    config: true,
    type: new foundry.data.fields.StringField({
      required: true,
      blank: true,
      choices: (game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)?.profiles ?? []).reduce((acc, v) => {
        acc[v.id] = v.name;
        return acc;
      }, {})
    }),
    requiresReload: false,
    default: "",
  });

}
