import { config } from "../../package.json";

/**
 * Get preference value.
 * Wrapper of `Zotero.Prefs.get`.
 * @param key
 */
export function getPref(key: string) {
  return Zotero.Prefs.get(`${config.prefsPrefix}.${key}`, true);
}

/**
 * Set preference value.
 * Wrapper of `Zotero.Prefs.set`.
 * @param key
 * @param value
 */
export function setPref(key: string, value: string | number | boolean) {
  return Zotero.Prefs.set(`${config.prefsPrefix}.${key}`, value, true);
}

/**
 * Clear preference value.
 * Wrapper of `Zotero.Prefs.clear`.
 * @param key
 */
export function clearPref(key: string) {
  return Zotero.Prefs.clear(`${config.prefsPrefix}.${key}`, true);
}

/**
 * Register preference observer.
 * Wrapper of `Zotero.Prefs.registerObserver`.
 * @param key
 * @param callback
 * @param global
 * @returns symbol
 */
export function registerPrefObserver(
  key: string,
  callback: (event: any) => void,
  global?: boolean,
): symbol {
  return Zotero.Prefs.registerObserver(
    `${config.prefsPrefix}.${key}`,
    callback,
    global,
  );
}

/**
 * Unregister preference observer.
 * Wrapper of `Zotero.Prefs.unregisterObserver`.
 * @param symbol
 */
export function unregisterPrefObserver(symbol: symbol) {
  return Zotero.Prefs.unregisterObserver(symbol);
}
