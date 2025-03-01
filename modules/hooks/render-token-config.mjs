import UTILS from "../utils.mjs";
import CONSTANTS from "../constants.mjs";

/**
 * Imports a profile from the world-setting to the token.
 * @param {TokenDocument} tokenDoc - The Token document instance.
 * @returns {TokenDocument|null} - The updated TokenDocument instance or null.
 */
async function importProfile(tokenDoc) {
  const profiles =
    game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)?.profiles ?? [];

  const profileChoices = profiles.reduce(
    (acc, { id, name }) => ({ ...acc, [id]: name }),
    {}
  );

  const profileId = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Import Profile", icon: "fas fa-square-user" },
    position: { width: 300 },
    content: new foundry.data.fields.StringField({
      choices: profileChoices,
      label: "Profiles",
      hint: `Select profile to import from settings to the Token ${tokenDoc.name}`,
    }).toFormGroup({}, {name: "profileId"}).outerHTML,
    ok: {
      label: "Load Profile",
      icon: "fa-solid fa-file-import",
      callback: (_, button) => button.form.elements.profileId.value,
    },
    rejectClose: false,
  });

  if (!profileId) return null;

  const barData = profiles.find((p) => p.id === profileId)?.barData;
  if (barData) {
    return await tokenDoc.update(
      { "flags.barbrawl.resourceBars": barData },
      { diff: false }
    );
  }
}

/**
 * Export the bardata from a token to the world-setting
 * @param {TokenDocument} tokenDoc - The Token document instance
 * @returns {Object} - The assigned setting value
 */
async function exportProfile(tokenDoc) {
  const { StringField } = foundry.data.fields;

  const profiles =
    game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES)?.profiles ?? [];

  const nameField = new StringField(
    {
      label: "Profile Name",
      hint: `Write the name for the new profile ${tokenDoc.name}`,
      initial: UTILS.generateNewProfileName(profiles),
    },
    { name: "nameProfile" }
  ).toFormGroup().outerHTML;

  const nameProfile = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Export Profile", icon: "fas fa-square-user" },
    position: {
      width: 300,
    },
    content: `${nameField}`,
    ok: {
      label: "Save Profile",
      icon: "fa-solid fa-file-export",
      callback: (_, button) => button.form.elements.nameProfile.value,
    },
    rejectClose: false,
  });

  if (!nameProfile) return;

  const barData = tokenDoc.getFlag("barbrawl", "resourceBars") ?? {};

  profiles.push({
    name: nameProfile,
    id: foundry.utils.randomID(16),
    barData,
  });

  return await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.PROFILES, { profiles });
}
/**
 * Appends a context menu item for saving or loading profiles when the `#context-menu` element is attached.
 * @param {Event} event - The event triggering the function.
 * @param {string} type - The action type, either 'save' or 'load'.
 * @param {TokenDocument} tokenDoc - The Token document instance.
 */
async function appendContextItem(event, type, tokenDoc) {
  const actions = {
    save: { name: "Save Profile", icon: "fa-file-export" },
    load: { name: "Load Profile", icon: "fa-file-import" },
  };

  const { name, icon } = actions[type];
  const targetElement = event.target;
  const existingMenu = targetElement.querySelector("#context-menu");

  const createMenuItem = (menu) => {
    if (!menu.querySelector(".context-item.barbrawl-profiles")) {
      const listItem = document.createElement("li");
      listItem.className = "context-item barbrawl-profiles";
      listItem.innerHTML = `<i class="fa-solid ${icon}"></i> ${name}`;
      listItem.addEventListener("click", () =>
        type === "load" ? importProfile(tokenDoc) : exportProfile(tokenDoc)
      );
      menu.querySelector("ol.context-items")?.appendChild(listItem);
    }
  };

  if (existingMenu) return createMenuItem(existingMenu);

  let timeoutId = setTimeout(() => observer.disconnect(), 3000);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.id === "context-menu") {
          createMenuItem(node);
          clearTimeout(timeoutId);
          observer.disconnect();
        }
      });
    }
  });

  observer.observe(targetElement, { childList: true });
}

/**
 * A hook event function that fires when a TokenConfig is rendered.
 * @param {Application} app - The TokenConfig application instance.
 * @param {jQuery} $html - The jQuery object containing the rendered HTML.
 */
export default function onRenderTokenConfig(app, [html]) {
  const resourcesTab = html.querySelector(
    ".app.token-sheet div[data-tab='resources']"
  );
  if (!resourcesTab) return;

  const buttonMap = {
    ".brawlbar-save": "save",
    ".brawlbar-load": "load",
  };

  resourcesTab.addEventListener("click", (event) => {
    const clickedButton = Object.keys(buttonMap).find((selector) =>
      event.target.closest(selector)
    );
    if (clickedButton)
      appendContextItem(event, buttonMap[clickedButton], app.document);
  });
}
