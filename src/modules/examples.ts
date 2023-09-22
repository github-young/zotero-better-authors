import { it } from "node:test";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { convertToInitials } from "./convertNames";

function example(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
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

export class BasicExampleFactory {
  @example
  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "chrome/content/preferences.xhtml",
      label: getString("prefs-title"),
      image: "",
      defaultXUL: true,
    };
    ztoolkit.PreferencePane.register(prefOptions);
  }
}

export class UIExampleFactory {
  @example
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "lastauthor",
      "Last Author",
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const authors = item.getCreators();
        let lastAuthorDisplayed: string = "";
        if (authors.length !== 0) {
          const lastAuthor = authors[authors.length - 1];
          if (Zotero.Prefs.get("lastauthor.initials")) {
            lastAuthorDisplayed =
              lastAuthor.lastName +
              ", " +
              convertToInitials(lastAuthor.firstName);
          } else {
            lastAuthorDisplayed =
              lastAuthor.lastName + ", " + lastAuthor.firstName;
          }
        }
        return lastAuthorDisplayed.replace(/,\s$/, "");
      },
      {},
    );
  }
}
