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
      closeOnSubmit: true,
    },
    position: { width: 400, height: "auto" },
    actions: {
      createProfile: BarbrawlProfileConfig._createProfile,
      editProfile: BarbrawlProfileConfig._editProfile,
      importJson: BarbrawlProfileConfig._importJson,
      exportJson: BarbrawlProfileConfig._exportJson,
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
    return await game.settings.set("barbrawl-profiles", "profiles", {profiles: this.profiles});
  }

  /** @inheritDoc */
  async close(options = {}) {
    if (this._openDialogs.size) {
      this._openDialogs.forEach((dialog) => {
        dialog.close();
      });
    }
    return super.close(options);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   *
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target -The capturing HTML element which defines the [data-action]
   */
  static _importJson(event, target) {}
  /**
   *
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target -The capturing HTML element which defines the [data-action]
   */
  static _exportJson(event, target) {}

  /**
   *
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target -The capturing HTML element which defines the [data-action]
   */
  static _createProfile(event, target) {
    const existingNames = new Set(this.profiles.map((p) => p.name));
    let number = 1;
    while (existingNames.has(`New Profile ${number}`)) number++;

    this.profiles.push({
      name: `New Profile ${number}`,
      id: foundry.utils.randomID(16),
      sort: this.profiles.length,
      barData: UTILS.createFirstTwoBars(),
    });

    this.render();
  }

  /**
   *
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target -The capturing HTML element which defines the [data-action]
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
          overwrite: false
        })
        this.profiles[profileIndex] = profileData;
        console.log(this.profiles[profileIndex])
        this.render();
      },
    });

    this._openDialogs.set(dialog.id, dialog);
    dialog.render(true);
  }
}
