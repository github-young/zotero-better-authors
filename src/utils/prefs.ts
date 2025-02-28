import { config } from "../../package.json";

type PluginPrefsMap = _ZoteroTypes.Prefs["PluginPrefsMap"];

const PREFS_PREFIX = config.prefsPrefix;

/**
 * Get preference value.
 * Wrapper of `Zotero.Prefs.get`.
 * @param key
 */
export function getPref<K extends keyof PluginPrefsMap>(key: K) {
  return Zotero.Prefs.get(`${PREFS_PREFIX}.${key}`, true) as PluginPrefsMap[K];
}

/**
 * Set preference value.
 * Wrapper of `Zotero.Prefs.set`.
 * @param key
 * @param value
 */
export function setPref<K extends keyof PluginPrefsMap>(
  key: K,
  value: PluginPrefsMap[K],
) {
  return Zotero.Prefs.set(`${PREFS_PREFIX}.${key}`, value, true);
}

/**
 * Clear preference value.
 * Wrapper of `Zotero.Prefs.clear`.
 * @param key
 */
export function clearPref(key: string) {
  return Zotero.Prefs.clear(`${PREFS_PREFIX}.${key}`, true);
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
