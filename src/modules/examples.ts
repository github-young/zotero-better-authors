import { it } from "node:test";
import { config } from "../../package.json";
import { getString } from "../utils/locale";

function example(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling example ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in example ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class UIExampleFactory {
  @example
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "test1",
      "Last Author",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item
      ) => {
        const authors = item.getCreators();
        const lastAuthor = authors[authors.length - 1];
        const lastAuthorName = lastAuthor.lastName + ", " + lastAuthor.firstName;
        return lastAuthorName;
      },
      {}
    );
  }
}
