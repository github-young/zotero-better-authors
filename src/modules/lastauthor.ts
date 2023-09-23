import { it } from "node:test";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { convertToInitials, determineCountry } from "./convertNames";
import { BasicTool } from "zotero-plugin-toolkit/dist/basic";

function lastAuthorPlugin(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling last author ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in last author ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class BasicLastAuthorFactory {
  @lastAuthorPlugin
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

type NameOrderType = "firstlast" | "lastfirst";

export class UILastAuthorFactory {
  static getSeparator(): string {
    const sepSetting = Zotero.Prefs.get("lastauthor.sep");
    let sep = " ";
    if (sepSetting == "space") {
      sep = " ";
    } else if (sepSetting == "comma") {
      sep = ", ";
    } else if (sepSetting == "none") {
      sep = "";
    }
    return sep;
  }
  static getAuthorNameWithNameOrder(nameorder: NameOrderType, firstName: string, lastName: string, separtor: string): string {
    if (nameorder == "firstlast") {
      if (Zotero.Prefs.get("lastauthor.initials")) {
        return convertToInitials(firstName) + separtor + lastName;
      } else {
        return firstName + separtor + lastName;
      }
    } else if (nameorder == "lastfirst") {
      if (Zotero.Prefs.get("lastauthor.initials")) {
        return lastName + separtor + convertToInitials(firstName);
      } else {
        return lastName + separtor + firstName;
      }
    } else {
      throw new Error(`Invalid author name order: ${nameorder}.`);
    }
  }

  static displayAuthorName(authors: Zotero.Item.Creator[], index: number, sep: string = ", "): string {
    if (authors.length == 0) return "";
    const targetAuthor = authors[index];
    const firstName = targetAuthor.firstName as string;
    const lastName = targetAuthor.lastName as string;
    // BasicTool.getZotero().log(targetAuthor.fieldMode)
    if (targetAuthor.fieldMode == 0) {
      // Double fields mode
      if (Zotero.Prefs.get("lastauthor.only_lastname")) {
        return targetAuthor.lastName as string;
      } else {
        const nameStyle = Zotero.Prefs.get("lastauthor.namestyle");
        let nameorder: NameOrderType = "firstlast";
        let separtor = sep;
        if (nameStyle == "auto") {
          const nameCountry = determineCountry(firstName, lastName);
          // BasicTool.getZotero().log(nameCountry);
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            nameorder = "lastfirst";
            separtor = "";
          } else {
            nameorder = "firstlast";
          }
        } else if (nameStyle == "firstlast") {
          nameorder = "firstlast";
        } else if (nameStyle == "lastfirst") {
          nameorder = "lastfirst";
        } else {
          throw new Error(`Invalid author name order setting: ${nameStyle}.`);
        }
        return this.getAuthorNameWithNameOrder(nameorder, firstName, lastName, separtor);
      }

    } else {
      // Single field mode should be used to institutions. Only lastName field has value.
      return targetAuthor.lastName as string;
    }
  }

  @lastAuthorPlugin
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "lastauthor",
      getString("itemtree-lastauthor-title"),
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const creators = item.getCreators();
        // Only get all authors in the creators
        const authors = creators.filter(creator => creator.creatorTypeID === 8);
        if (authors.length == 0) return "";
        const sep = this.getSeparator();
        const lastAuthorDisplayed: string = this.displayAuthorName(authors, authors.length - 1, sep);
        return lastAuthorDisplayed;
      },
      {},
    );
    await ztoolkit.ItemTree.register(
      "authors",
      getString("itemtree-authors-title"),
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const creators = item.getCreators();
        // Only get all authors in the creators
        const authors = creators.filter(creator => creator.creatorTypeID === 8);
        if (authors.length == 0) return "";
        const sep = this.getSeparator();
        const settingFirstN = Zotero.Prefs.get("lastauthor.first_n_name");
        let firstN = 1;
        if (settingFirstN !== undefined) {
          firstN = settingFirstN as number;
        }
        // get first n authors
        const authorList: string[] = [];
        for (let i = 0; i < authors.length; ++i) {
          if (i >= firstN) break;
          const authorDisplayed: string = this.displayAuthorName(authors, i, sep);
          authorList.push(authorDisplayed);
        }

        const lastAuthorDisplayed: string = this.displayAuthorName(authors, authors.length - 1, sep);
        if (firstN < authors.length - 1) {
          return authorList.join(", ") + ", ..., " + lastAuthorDisplayed;
        } else if (firstN == authors.length - 1) {
          return authorList.join(", ") + ", " + lastAuthorDisplayed;
        } else {
          return authorList.join(", ");
        }
      },
      {},
    );
  }
}
