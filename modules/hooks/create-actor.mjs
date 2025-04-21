import CONSTANTS from "../constants.mjs";

export default async function onCreateActor(actor, options) {
  if (options.pack) return;

  const settings = game.settings;
  const { MODULE_ID, SETTINGS } = CONSTANTS;

  const profiles = settings.get(MODULE_ID, SETTINGS.PROFILES)?.profiles ?? [];
  const useDefault = settings.get(MODULE_ID, SETTINGS.DEFAULT_PROFILE_BOOLEAN);
  const defaultId = settings.get(MODULE_ID, SETTINGS.DEFAULT_PROFILE_VALUE) ?? false;
  const askProfile = settings.get(MODULE_ID, SETTINGS.ASK_PROFILE);

  let profileId = useDefault ? defaultId : false;

  if (!profileId && askProfile) {
    const choices = Object.fromEntries(profiles.map(p => [p.id, p.name]));

    profileId = await foundry.applications.api.DialogV2.prompt({
      window: { title: "Import Profile to Actor", icon: "fas fa-square-user" },
      position: { width: 300 },
      content: new foundry.data.fields.StringField({
        choices,
        label: "Profiles",
        hint: `Select profile to import from settings to the Actor ${actor.name}`,
      }).toFormGroup({}, { name: "profileId" }).outerHTML,
      ok: {
        label: "Load Profile",
        icon: "fa-solid fa-file-import",
        callback: (_, button) => button.form.elements.profileId.value,
      },
      modal: true,
      rejectClose: false,
    });
  }

  if (!profileId) return null;

  const barData = profiles.find(p => p.id === profileId)?.barData;
  if (barData) {
    await actor.update(
      { "prototypeToken.flags.barbrawl.resourceBars": barData },
      { diff: false }
    );
  }
}
