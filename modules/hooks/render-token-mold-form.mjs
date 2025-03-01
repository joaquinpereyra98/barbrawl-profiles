import CONSTANTS from "../constants.mjs";
/**
 * Enhances the Token Mold configuration form by adding profile selection and overwrite options.
 *
 * @param {Application} app - The Application instance being rendered.
 * @param {JQuery<HTMLElement>} $html - A jQuery-wrapped element representing the form’s HTML.
 */
export default function onRenderTokenMoldForm(app, $html) {
  const settingValues = game.settings.get(
    CONSTANTS.MODULE_ID,
    CONSTANTS.SETTINGS.PROFILES_TOKEN_MOLD
  );
  if (!app.barbrawlProfiles) app.barbrawlProfiles = settingValues?._source;

  const tab = $html[0]?.querySelector("div[data-tab='config']");
  if (!tab) return;

  const profiles =
    game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)
      ?.profiles ?? [];

  const { StringField, BooleanField } = foundry.data.fields;

  const selectProfileInput = new StringField({
    choices: Object.fromEntries(profiles.map(({ id, name }) => [id, name])),
    label: "Profiles",
    hint: "Select profile to use when a new token is created.",
  }).toFormGroup({ classes: ["barbrawl-profile-select"] }, { value: app.barbrawlProfiles.profile });

  const overwriteBarData = new BooleanField({
    label: "Overwrite Profile",
    hint: "Overwrite Barbrawl bar data with the profile's data.",
  }).toFormGroup(
    { classes: ["barbrawl-profile-checkbox"] },
    {
      value: app.barbrawlProfiles.overwrite,
    }
  );

  overwriteBarData
    .querySelector("input")
    ?.addEventListener("change", (event) => {
      const checkbox = event.target;
      app.barbrawlProfiles.overwrite = checkbox.checked;
    });

  selectProfileInput
    .querySelector("select")
    ?.addEventListener("change", (event) => {
      const select = event.target;
      app.barbrawlProfiles.profile = select.value;
    });

  tab.prepend(overwriteBarData, selectProfileInput);
}
