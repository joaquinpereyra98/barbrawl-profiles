import CONSTANTS from "./modules/constants.mjs";
import registerSettings from "./modules/settings.mjs";
import * as hooks from "./modules/hooks/_module.mjs";
import * as apps from "./modules/applications/_module.mjs";
import * as data from "./modules/data/_modules.mjs";

Hooks.on("init", () => {
  foundry.utils.mergeObject(game.modules.get(CONSTANTS.MODULE_ID), {
    apps,
    data,
  });
});

Hooks.on("ready", () => {
  registerSettings();
  if (game.modules.get("token-mold")) {
    Hooks.on("renderTokenMoldForm", hooks.onRenderTokenMoldForm);
    Hooks.on("closeTokenMoldForm", hooks.onCloseTokenMoldForm);

    const tokenMold = game["token-mold"];

    if (!tokenMold || typeof tokenMold._setTokenData !== "function") {
      console.warn("Token Mold module or _setTokenData method not found.");
      return;
    }
    const originalSetTokenData = tokenMold._setTokenData;
    tokenMold._setTokenData = function (scene, tokenData) {
      const newTokenData = originalSetTokenData.call(this, scene, tokenData);
      console.log(newTokenData)
      const tokenMoldSettingData = game.settings.get(
        CONSTANTS.MODULE_ID,
        CONSTANTS.SETTINGS.PROFILES_TOKEN_MOLD
      );

      if (tokenMoldSettingData.overwrite) {
        const profiles =
          game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)
            ?.profiles ?? [];

        const barData = profiles.find(
          (p) => p.id === tokenMoldSettingData.profile
        )?.barData;

        foundry.utils.setProperty(
            newTokenData,
          "flags.barbrawl.resourceBars",
          barData
        );
      }
      return newTokenData;
    };
  }
});

Hooks.on("renderTokenConfig", hooks.onRenderTokenConfig);
Hooks.on("createActor", hooks.onCreateActor);
