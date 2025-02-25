import CONSTANTS from "../constants.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class BarbrawlProfileConfig extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      icon: "fas fa-square-user",
      title: "Bar-Brawl Profiles",
      contentClasses: ["barbrawl-profile-config"],
      resizable: true
    },
    form: {
      handler: BarbrawlProfileConfig.formHandler,
      submitOnChange: false,
      closeOnSubmit: false,
    },
    position: {
      width: 300,
      height: 400,
    },
  };

  static PARTS = {
    form: {
      template: `modules/${CONSTANTS.MODULE_ID}/templates/barbrawl-profile-config/form.hbs`,
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  async _prepareContext(options = {}) {
    return {
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
   * Process form submission for the sheet
   * @this {BarbrawlProfileConfig}                      The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async formHandler(event, form, formData) {}
}
