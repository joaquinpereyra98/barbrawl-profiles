import CONSTANTS from "../constants.mjs";
import UTILS from "../utils.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

/**
 * The Barbrawl Profile dialog application.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias BarbrawlProfileDialog
 */
export default class BarbrawlProfileDialog extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  /**
   * @param {Object} options
   * @param {Object} options.profile
   * @param {Function} options.callbackClose
   * @param {Function} options.callbackSubmit
   */
  constructor(options) {
    super(options);
    this.profile = options.profile;
    this.callbackClose = options.callbackClose;
    this.callbackSubmit = options.callbackSubmit;
  }
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      icon: "fas fa-square-user",
      title: "Bar-Brawl Profile Dialog",
      contentClasses: ["barbrawl-profile-dialog"],
      resizable: true,
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: false,
      handler: BarbrawlProfileDialog.#formHandler,
    },
    position: { width: 480, height: "auto" },
    actions: {
      addResource: BarbrawlProfileDialog._addResource,
    },
  };

  _onRender(context, options) {
    this.element.querySelectorAll(".input-attribute").forEach((input) => {
      input.addEventListener("change", (ev) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();

        const groupValue = ev.currentTarget
          .closest(".indent-details")
          ?.querySelector(".group-value");

        if (!groupValue) return;

        groupValue.style.display =
          ev.currentTarget.value === "custom" ? "" : "none";
      });
    });
  }

  /** @override */
  static PARTS = {
    form: {
      template: `modules/${CONSTANTS.MODULE_ID}/templates/barbrawl-profile-dialog/form.hbs`,
    },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /** @override */
  async _prepareContext(options = {}) {
    return {
      nameField: this._prepareNameField(),
      barData: this._prepareBarData(),
      positionOptions: {
        "top-inner": "barbrawl.position.top-inner",
        "top-outer": "barbrawl.position.top-outer",
        "bottom-inner": "barbrawl.position.bottom-inner",
        "bottom-outer": "barbrawl.position.bottom-outer",
        "left-inner": "barbrawl.position.left-inner",
        "left-outer": "barbrawl.position.left-outer",
        "right-inner": "barbrawl.position.right-inner",
        "right-outer": "barbrawl.position.right-outer",
      },
      otherVisibilityOptions: {
        [CONSTANTS.BAR_VISIBILITY.ALWAYS]: "barbrawl.visibility.always",
        [CONSTANTS.BAR_VISIBILITY.HOVER]: "barbrawl.visibility.hover",
        [CONSTANTS.BAR_VISIBILITY.NONE]: "barbrawl.visibility.none",
      },
      ownerVisibilityOptions: {
        [CONSTANTS.BAR_VISIBILITY.INHERIT]:
          "barbrawl.visibility.inheritFromOther",
        [CONSTANTS.BAR_VISIBILITY.ALWAYS]: "barbrawl.visibility.always",
        [CONSTANTS.BAR_VISIBILITY.HOVER_CONTROL]:
          "barbrawl.visibility.hoverOrControl",
        [CONSTANTS.BAR_VISIBILITY.HOVER]: "barbrawl.visibility.hover",
        [CONSTANTS.BAR_VISIBILITY.CONTROL]: "barbrawl.visibility.control",
        [CONSTANTS.BAR_VISIBILITY.NONE]: "barbrawl.visibility.none",
      },
      gmVisibilityOptions: {
        [CONSTANTS.BAR_VISIBILITY.INHERIT]:
          "barbrawl.visibility.inheritFromOwner",
        [CONSTANTS.BAR_VISIBILITY.ALWAYS]: "barbrawl.visibility.always",
        [CONSTANTS.BAR_VISIBILITY.HOVER_CONTROL]:
          "barbrawl.visibility.hoverOrControl",
        [CONSTANTS.BAR_VISIBILITY.HOVER]: "barbrawl.visibility.hover",
        [CONSTANTS.BAR_VISIBILITY.CONTROL]: "barbrawl.visibility.control",
        [CONSTANTS.BAR_VISIBILITY.NONE]: "barbrawl.visibility.none",
      },
      stylesOptions: {
        user: "barbrawl.textStyle.user",
        none: "barbrawl.textStyle.none",
        fraction: "barbrawl.textStyle.fraction",
        percent: "barbrawl.textStyle.percent",
      },
      buttons: [
        {
          type: "submit",
          icon: "fa-solid fa-save",
          label: "PERMISSION.Submit",
        },
      ],
    };
  }

  _prepareNameField() {
    const nameValue = this.profile.name;

    return new foundry.data.fields.StringField(
      {
        blank: false,
        nullable: false,
        initial: nameValue,
      },
      { name: "name" }
    );
  }

  _prepareBarData() {
    const barData = foundry.utils.duplicate(this.profile.barData);

    for (const bar of Object.values(barData)) {
      bar.mincolor = this._prepareColorsFields(
        bar.id,
        bar.mincolor,
        "mincolor"
      );
      bar.maxcolor = this._prepareColorsFields(
        bar.id,
        bar.maxcolor,
        "maxcolor"
      );
      bar.fgImage = this._prepareImgPathFields(bar.id, bar.fgImage, "fgImage");
      bar.bgImage = this._prepareImgPathFields(bar.id, bar.bgImage, "bgImage");
    }
    return barData;
  }

  _prepareColorsFields(barId, colorValue, colorKey) {
    const { ColorField } = foundry.data.fields;
    const field = new ColorField(
      {
        blank: false,
        nullable: false,
        initial: colorValue,
      },
      {
        name: `barData.${barId}.${colorKey}`,
      }
    );

    return {
      field,
      value: colorValue,
    };
  }

  _prepareImgPathFields(barId, pathValue = "", pathKey) {
    const { FilePathField } = foundry.data.fields;
    const field = new FilePathField(
      {
        initial: pathValue,
        categories: ["IMAGE"],
      },
      {
        name: `barData.${barId}.${pathKey}`,
      }
    );

    return {
      field,
      value: pathValue,
    };
  }

  /**
   * Handle submission
   * @this {BarbrawlProfileConfig} - The handler is called with the application as its bound scope
   * @param {SubmitEvent} event - The originating form submission event
   * @param {HTMLFormElement} form - The form element that was submitted
   * @param {FormDataExtended} formData - Processed data for the submitted form
   */
  static #formHandler(event, form, formData) {
    const profileData = foundry.utils.expandObject(formData.object);
    if (this.callbackSubmit instanceof Function)
      this.callbackSubmit(profileData);

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

    if (this.callbackClose instanceof Function) this.callbackClose();
    return super.close(options);
  }

  static _addResource() {
    const barsIds = Object.keys(this.profile.barData);
    const newBar = UTILS.getDefaultBarData(barsIds);

    this.profile.barData[newBar.id] = newBar;
    this.render();
  }
}
