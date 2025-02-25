import registerSettings from "./modules/settings.mjs";
import * as hooks from "./modules/hooks/_module.mjs";
import * as apps from "./modules/applications/_module.mjs";
import constants from "./modules/constants.mjs";

Hooks.on("init", ()=> {
    foundry.utils.mergeObject(game.modules.get(constants.MODULE_ID), {
        apps
    })
    
    registerSettings();

});

Hooks.on("renderTokenConfig", hooks.onRenderTokenConfig);
Hooks.on("renderTokenMoldForm", hooks.onRenderTokenMoldForm);