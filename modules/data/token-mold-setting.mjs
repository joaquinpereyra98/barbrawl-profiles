export default class TokenMoldSetting extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const { StringField, BooleanField } = foundry.data.fields;
    return {
      profile: new StringField({
        initial: "",
      }),
      overwrite: new BooleanField({
        initial: false,
      }),
    };
  }
}
