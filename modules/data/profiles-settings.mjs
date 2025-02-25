/**
 * A data model that represents the Profile configuration options.
 */
export default class ProfilesSetting extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const { ArrayField, SchemaField } = foundry.data.fields;
    return {};
  }
}
