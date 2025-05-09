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
  if (game.modules.get("token-mold")?.active) {
    Hooks.on("renderTokenMoldForm", hooks.onRenderTokenMoldForm);
    Hooks.on("closeTokenMoldForm", hooks.onCloseTokenMoldForm);

    const tokenMold = game["token-mold"];

    if (!tokenMold || typeof tokenMold._overwriteConfig !== "function") {
      console.warn("Token Mold module or _setTokenData method not found.");
      return;
    }
    const originalOverwriteConfig = tokenMold._overwriteConfig;
    tokenMold._overwriteConfig = function (tokenData, actor) {
      originalOverwriteConfig.call(this, tokenData, actor);

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
        if (barData) {
          ["bar1.attribute", "bar2.attribute", "displayBars"].forEach((key) => {
            if (key in tokenData) delete tokenData[key];
          });

          foundry.utils.setProperty(
            tokenData,
            "flags.barbrawl.resourceBars",
            barData
          );
        }
      }
      return tokenData;
    };
  }
});

Hooks.on("renderTokenConfig", hooks.onRenderTokenConfig);
Hooks.on("createActor", hooks.onCreateActor);
