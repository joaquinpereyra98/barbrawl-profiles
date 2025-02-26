/**
 * A data model that represents the Profile configuration options.
 */
export default class ProfilesSetting extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const { ArrayField, SchemaField, StringField, ObjectField } =
      foundry.data.fields;
    return {
      profiles: new ArrayField(
        new SchemaField({
          name: new StringField({
            trim: true,
            blank: true,
          }),
          id: new StringField(),
          barData: new ObjectField(),
        }),
        {
          initial: [],
          gmOnly: true,
        }
      ),
    };
  }
}
