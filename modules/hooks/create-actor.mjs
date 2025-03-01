import CONSTANTS from "../constants.mjs";

export default async function onCreateActor(actor, options) {
  if (options.pack) return;

  const profiles =
    game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)
      ?.profiles ?? [];

  const profileChoices = profiles.reduce(
    (acc, { id, name }) => ({ ...acc, [id]: name }),
    {}
  );

  const profileId = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Import Profile to Actor", icon: "fas fa-square-user" },
    position: { width: 300 },
    content: new foundry.data.fields.StringField({
      choices: profileChoices,
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

  if (!profileId) return null;

  const barData = profiles.find((p) => p.id === profileId)?.barData;
  if (barData) {
    return await actor.update(
      { "prototypeToken.flags.barbrawl.resourceBars": barData },
      { diff: false }
    );
  }
}
