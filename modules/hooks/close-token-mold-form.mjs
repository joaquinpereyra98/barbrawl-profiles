import CONSTANTS from "../constants.mjs";

/**
 * 
 * @param {Application} app - The Application instance being closed.
 * @returns 
 */
export default function onCloseTokenMoldForm(app) {
  if (!app.barbrawlProfiles) return;
    game.settings.set(
      CONSTANTS.MODULE_ID,
      CONSTANTS.SETTINGS.PROFILES_TOKEN_MOLD,
      app.barbrawlProfiles
    );

}
