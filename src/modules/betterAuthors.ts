import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { convertToInitials, determineCountry } from "./convertNames";
import { getPref } from "../utils/prefs";

function betterAuthorsPlugin(
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
      ztoolkit.log(
        `Error in last author ${target.name}.${String(propertyKey)}`,
        e,
      );
      throw e;
    }
  };
  return descriptor;
}

export class BasicBetterAuthorsFactory {
  @betterAuthorsPlugin
  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "chrome/content/preferences.xhtml",
      scripts: [rootURI + "chrome/content/preferences.js"],
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/favicon.png`,
      defaultXUL: true,
    };
    ztoolkit.PreferencePane.register(prefOptions);
  }
}

type NameOrderType = "firstlast" | "lastfirst";

export class UIBetterAuthorsFactory {
  static getSeparator(sepSource: string): string {
    const sepSetting = getPref(sepSource) as string;
    let sep = " ";
    if (sepSetting === "space") {
      sep = " ";
    } else if (sepSetting === "comma") {
      sep = ", ";
    } else if (sepSetting === "none") {
      sep = "";
    }
    return sep;
  }
  static getSeparatorString(
    sepSource: string,
    defaultReturn: string = "",
  ): string {
    const sepInput = getPref(sepSource);
    if (sepInput) {
      return sepInput as string;
    } else {
      return defaultReturn;
    }
  }
  static getAuthorNameWithNameOrder(
    nameorder: NameOrderType,
    firstName: string,
    lastName: string,
    separator: string,
  ): string {
    const firstnameStyle: string = getPref("firstnamestyle") as string;
    let firstnameAsInitials: boolean = false;
    if (firstnameStyle === "initials") {
      firstnameAsInitials = true;
    }
    if (nameorder === "firstlast") {
      if (firstnameAsInitials) {
        return convertToInitials(firstName) + separator + lastName;
      } else {
        return firstName + separator + lastName;
      }
    } else if (nameorder === "lastfirst") {
      if (firstnameAsInitials) {
        return lastName + separator + convertToInitials(firstName);
      } else {
        return lastName + separator + firstName;
      }
    } else {
      throw new Error(`Invalid author name order: ${nameorder}.`);
    }
  }
  static displayAuthorName(
    authors: Zotero.Item.Creator[],
    index: number,
    sep: string = " ",
    sepCJK: string = "",
  ): string {
    if (authors.length == 0) return "";
    const targetAuthor = authors[index];
    const firstName = targetAuthor.firstName as string;
    const lastName = targetAuthor.lastName as string;
    // BasicTool.getZotero().log(targetAuthor.fieldMode)
    if (targetAuthor.fieldMode == 0) {
      // Double fields mode
      const firstnameStyle: string = getPref("firstnamestyle") as string;
      let firstnameAsNone: boolean = false;
      if (firstnameStyle === "none") {
        firstnameAsNone = true;
      }
      if (firstnameAsNone) {
        return targetAuthor.lastName as string;
      } else {
        const nameCountry = determineCountry(firstName, lastName);
        const nameOrderStyle = getPref("namestyle");
        let nameorder: NameOrderType = "firstlast";
        let separator = sep;
        if (nameOrderStyle === "auto") {
          // BasicTool.getZotero().log(nameCountry);
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            nameorder = "lastfirst";
          } else {
            nameorder = "firstlast";
          }
          separator = sepCJK;
        } else if (nameOrderStyle == "firstlast") {
          nameorder = "firstlast";
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            separator = sepCJK;
          } else {
            separator = sep;
          }
        } else if (nameOrderStyle == "lastfirst") {
          nameorder = "lastfirst";
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            separator = sepCJK;
          } else {
            separator = sep;
          }
        } else {
          throw new Error(
            `Invalid author name order setting: ${nameOrderStyle}.`,
          );
        }
        return this.getAuthorNameWithNameOrder(
          nameorder,
          firstName,
          lastName,
          separator,
        );
      }
    } else {
      // Single field mode should be used to institutions. Only lastName field has value.
      return targetAuthor.lastName as string;
    }
  }

  @betterAuthorsPlugin
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
        const authors = creators.filter(
          (creator) => creator.creatorTypeID === 8,
        );
        if (authors.length == 0) return "";
        const sepIntra = this.getSeparatorString("sep-intra-author");
        const sepIntraCJK = this.getSeparatorString("sep-intra-author-cjk");
        const lastAuthorDisplayed: string = this.displayAuthorName(
          authors,
          authors.length - 1,
          sepIntra,
          sepIntraCJK,
        );
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
        const authors = creators.filter(
          (creator) =>
            creator.creatorTypeID === Zotero.CreatorTypes.getID("author"),
        );
        if (authors.length == 0) return "";
        // const sep = this.getSeparator("sep");
        const separators: string[] = [];
        const sepIntra: string = this.getSeparatorString("sep-intra-author");
        const sepIntraCJK: string = this.getSeparatorString(
          "sep-intra-author-cjk",
        );
        const sepInter: string = this.getSeparatorString("sep-inter-author");
        const sepOmitted: string = this.getSeparatorString(
          "sep-omitted-authors",
        );
        const indicatorLastAuthor: string = this.getSeparatorString(
          "indicator-for-lastauthor",
        );
        const indicatorPosition: string = getPref(
          "indicator-position",
        ) as string;
        // get first n authors
        // Initialize the first author list
        const firstAuthorsList: string[] = [];
        const includeFirstAuthorsFlag = getPref(
          "include-firstauthors-in-list",
        ) as boolean;
        let firstN = 0;
        if (includeFirstAuthorsFlag) {
          const firstAuthorNumber = getPref("first_n_authors");
          if (firstAuthorNumber !== undefined) {
            firstN = firstAuthorNumber as number;
          }
          for (let i = 0; i < authors.length; i++) {
            if (i < firstN || firstN == 0) {
              const authorDisplayed: string = this.displayAuthorName(
                authors,
                i,
                sepIntra,
                sepIntraCJK,
              );
              firstAuthorsList.push(authorDisplayed);
            } else {
              break;
            }
          }
        }
        // get last author
        const includeLastAuthorFlag = getPref(
          "include-lastauthor-in-list",
        ) as boolean;
        let lastAuthorDisplayed: string = "";
        if (includeLastAuthorFlag) {
          lastAuthorDisplayed = this.displayAuthorName(
            authors,
            authors.length - 1,
            sepIntra,
            sepIntraCJK,
          );
        }
        // Output
        let displayedString: string = "";
        const authorsList: string[] = [];
        // [firsts], if any
        if (includeFirstAuthorsFlag) {
          authorsList.push(...firstAuthorsList);
        }
        if (firstN !== 0 && firstN < authors.length - 1) {
          displayedString = authorsList.join(sepInter) + sepInter + sepOmitted;
        } else {
          displayedString = authorsList.join(sepInter);
        }
        // [last], if any
        if (includeLastAuthorFlag) {
          if (!displayedString) {
            displayedString += lastAuthorDisplayed;
          } else if (displayedString == lastAuthorDisplayed) {
            // in case of only one author
            displayedString = lastAuthorDisplayed;
          } else {
            if (indicatorPosition === "before") {
              displayedString +=
                sepInter + indicatorLastAuthor + lastAuthorDisplayed;
            } else {
              displayedString +=
                sepInter + lastAuthorDisplayed + indicatorLastAuthor;
            }
          }
        }
        return displayedString;
      },
      {},
    );
  }
}
