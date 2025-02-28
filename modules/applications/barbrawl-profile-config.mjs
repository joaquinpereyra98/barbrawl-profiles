import CONSTANTS from "../constants.mjs";
import UTILS from "../utils.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * The Barbrawl Profiles configuration application.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias BarbrawlProfileConfig
 */
export default class BarbrawlProfileConfig extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  constructor(options) {
    super(options);
    this.profiles =
      game.settings.get("barbrawl-profiles", "profiles")?.profiles ?? [];
  }

  _openDialogs = new Collection();

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      icon: "fas fa-square-user",
      title: "Bar-Brawl Profiles",
      contentClasses: ["barbrawl-profile-config"],
      resizable: true,
      controls: [
        {
          icon: "fa-solid fa-file-export",
          label: "Export JSON",
          action: "exportJson",
          visible: true,
        },
        {
          icon: "fa-solid fa-file-import",
          label: "Import JSON",
          action: "importJson",
          visible: true,
        },
      ],
    },
    form: {
      handler: BarbrawlProfileConfig.#formHandler,
      submitOnChange: false,
      closeOnSubmit: false,
    },
    position: { width: 400, height: "auto" },
    actions: {
      createProfile: BarbrawlProfileConfig._createProfile,
      editProfile: BarbrawlProfileConfig._editProfile,
      importJson: BarbrawlProfileConfig._importJson,
      exportJson: BarbrawlProfileConfig._exportJson,
      deleteProfile: BarbrawlProfileConfig._deleteProfile,
    },
  };

  /** @override */
  static PARTS = {
    form: {
      template: `modules/${CONSTANTS.MODULE_ID}/templates/barbrawl-profile-config/form.hbs`,
    },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /** @override */
  async _prepareContext(options = {}) {
    return {
      profiles: this.profiles,
      buttons: [
        {
          type: "submit",
          icon: "fa-solid fa-save",
          label: "PERMISSION.Submit",
        },
      ],
    };
  }

  /**
   * Handle submission
   * @this {BarbrawlProfileConfig} - The handler is called with the application as its bound scope
   * @param {SubmitEvent} event - The originating form submission event
   * @param {HTMLFormElement} form - The form element that was submitted
   * @param {FormDataExtended} formData - Processed data for the submitted form
   */
  static async #formHandler(event, form, formData) {
    await game.settings.set("barbrawl-profiles", "profiles", {
      profiles: this.profiles,
    });

    return this.close({ submitted: true });
  }

  /** @inheritDoc */
  async close(options = {}) {
    if (!options.submitted) {
      const proceed = await foundry.applications.api.DialogV2.confirm({
        content:
          "Are you sure you want to close? Unsaved changes will be lost.",
        rejectClose: false,
        modal: true,
      });

      if (!proceed) return;
    }

    return super.close(options);
  }

  /** @inheritDoc */
  _onClose(options = {}) {
    if (this._openDialogs.size) {
      this._openDialogs.forEach((dialog) => {
        dialog.close();
      });
    }
    super._onClose(options);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Imports profile data from a JSON file. Allows the user to choose whether to overwrite existing data or merge it.
   *
   * @param {PointerEvent} event - The click event that triggered the import.
   * @param {HTMLElement} target - The HTML element that initiated the action, containing the [data-action] attribute.
   */
  static async _importJson(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const { BooleanField } = foundry.data.fields;

    const overwriteField = new BooleanField(
      {
        initial: false,
        label: "Overwrite Existing Data",
        hint: "If enabled, the imported JSON data will replace all existing data. If disabled, the imported data will be merged with the current data.",
      },
      { name: "overwriteData" }
    ).toFormGroup().outerHTML;

    const action = await DialogV2.wait({
      window: { title: "Import Profile Data" },
      content: `<div class="form-group">
            <label for="data">${game.i18n.localize(
              "DOCUMENT.ImportSource"
            )}</label>
            <input type="file" name="data" accept=".json"/>
        </div> ${overwriteField}`,
      position: { width: 450 },
      modal: true,
      buttons: [
        {
          action: "import",
          default: false,
          label: "Import",
          icon: "fa-solid fa-file-import",
          callback: (_, button) => ({
            data: button.form.data.files,
            overwriteData: button.form.overwriteData.checked,
          }),
        },
        {
          action: "cancel",
          default: true,
          label: "Cancel",
          icon: "fas fa-times",
        },
      ],
      rejectClose: false,
    });

    if (!action || action === "cancel") return;

    const { data, overwriteData } = action;
    if (!data.length)
      return ui.notifications.error("You did not upload a data file!");

    const importedProfiles = JSON.parse(
      await readTextFromFile(data[0])
    ).profiles;

    let profiles = overwriteData
      ? [...importedProfiles]
      : [...this.profiles, ...importedProfiles];

    const existingIds = new Set();
    profiles = profiles.map((profile) => {
      const isValidId =
        profile.id && typeof profile.id === "string" && profile.id.length >= 16;

      if (!isValidId || existingIds.has(profile.id)) {
        profile.id = foundry.utils.randomID();
      }

      existingIds.add(profile.id);
      return profile;
    });
    this.profiles = profiles;
    await game.settings.set("barbrawl-profiles", "profiles", { profiles });
    this.render();
  }

  /**
   * Exports the current profile data as a JSON file.
   * If the stored profiles differ from the current ones, prompts the user for confirmation before overwriting.
   *
   * @param {PointerEvent} event - The click event that triggered the export.
   * @param {HTMLElement} target - The HTML element that initiated the action, containing the [data-action] attribute.
   */
  static async _exportJson(event, target) {
    event.preventDefault();

    const settingData = game.settings.get("barbrawl-profiles", "profiles");
    const filename = `barbrawl-profiles-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`;

    if (!foundry.utils.objectsEqual(settingData.profiles, this.profiles)) {
      const proceed = await foundry.applications.api.DialogV2.confirm({
        content:
          "The current profiles differ from the saved ones. Do you want to overwrite the settings?",
        rejectClose: false,
        modal: true,
      });

      if (!proceed) return;

      await game.settings.set("barbrawl-profiles", "profiles", {
        profiles: this.profiles,
      });
    }

    saveDataToFile(
      JSON.stringify({ profiles: this.profiles }, null, 2),
      "text/json",
      `${filename}.json`
    );
  }

  /**
   * Creates a new profile with a generated name and default bar data, then updates the UI.
   *
   * @param {PointerEvent} event - The click event that triggered the profile creation.
   * @param {HTMLElement} target - The HTML element that initiated the action, containing the [data-action] attribute.
   */
  static _createProfile(event, target) {
    event.preventDefault();

    const name = UTILS.generateNewProfileName(this.profiles);

    this.profiles.push({
      name,
      id: foundry.utils.randomID(16),
      barData: UTILS.createFirstTwoBars(),
    });

    this.render();
  }

  /**
   * Opens a dialog to edit an existing profile. Updates the profile data upon submission.
   *
   * @param {PointerEvent} event - The click event that triggered the profile edit.
   * @param {HTMLElement} target - The HTML element that initiated the action, containing the [data-action] attribute.
   */
  static async _editProfile(event, target) {
    event.preventDefault();
    const profileId = target.closest(".profile")?.dataset?.id;
    const profileIndex = this.profiles.findIndex((p) => p.id === profileId);

    if (profileIndex === -1) return;

    const profile = this.profiles[profileIndex];

    const { BarbrawlProfileDialog } = game.modules.get(
      CONSTANTS.MODULE_ID
    ).apps;
    const dialog = new BarbrawlProfileDialog({
      profile,
      callbackClose: () => {
        this._openDialogs.delete(dialog.id);
      },
      callbackSubmit: (profileData) => {
        foundry.utils.mergeObject(profileData, profile, {
          overwrite: false,
        });
        this.profiles[profileIndex] = profileData;
        this.render();
      },
    });

    this._openDialogs.set(dialog.id, dialog);
    dialog.render(true);
  }

  /**
   * Deletes a profile after confirming with the user.
   *
   * @param {PointerEvent} event - The click event that triggered the profile deletion.
   * @param {HTMLElement} target - The HTML element that initiated the action, containing the [data-action] attribute.
   */
  static async _deleteProfile(event, target) {
    event.preventDefault();

    const profileId = target.closest(".profile")?.dataset?.id;
    if (!profileId) return;

    const proceed = await foundry.applications.api.DialogV2.confirm({
      content: "Are you sure you want to delete this profile?",
      rejectClose: false,
      modal: true,
    });

    if (!proceed) return;

    this.profiles = this.profiles.filter((p) => p.id !== profileId);
    this.render();
  }
}
