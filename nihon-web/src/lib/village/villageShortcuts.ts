// Keys between the village square and the pages it opens, like a game's menu and map keys: Tab opens the dashboard and
// M the island map, and the same key again goes back to the square. Pure, so it runs under node.

export type ShortcutPlace = "village" | "dashboard" | "map";
export const VILLAGE_PATH = "/village";

/** Physical keys, so they work the same on any keyboard layout. */
const SHORTCUT_PATHS: Readonly<Record<ShortcutPlace, Readonly<Record<string, string>>>> = {
  village: { Tab: "/", KeyM: "/map" },
  dashboard: { Tab: VILLAGE_PATH },
  map: { KeyM: VILLAGE_PATH },
};

export type ShortcutKey = {
  code: string; repeat: boolean;
  shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean;
  /** Whether focus is on something the key would otherwise act on (a link, a button you tabbed to, a text box). */
  isFocusTaken: boolean;
};

/** Where a key press goes from `place`, or null when the key should do its usual job. Tab only leaves while focus
 *  isn't on a control, so a keyboard user who has tabbed into the page (Shift+Tab gets there) keeps moving through it. */
export function shortcutPath(key: ShortcutKey, place: ShortcutPlace): string | null {
  if (key.repeat || key.isFocusTaken || key.shiftKey || key.ctrlKey || key.altKey || key.metaKey) return null;
  return SHORTCUT_PATHS[place][key.code] ?? null;
}
