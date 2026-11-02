/** The island map's mood: dawn, day, dusk, or night. It is the map's own setting, separate from the site's light and dark theme. */
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";
/** What the learner chose on the Time island: follow their clock, or keep one mood. */
export type MapTimeSetting = "clock" | TimeOfDay;

export const TIMES_OF_DAY: readonly TimeOfDay[] = ["dawn", "day", "dusk", "night"];

// The hour (local, 0–23) each mood begins; night runs from dusk's end until dawn.
export const DAWN_START_HOUR = 5;
export const DAY_START_HOUR = 8;
export const DUSK_START_HOUR = 16;
export const NIGHT_START_HOUR = 18;

export function timeOfDayAt(hour: number): TimeOfDay {
  if (hour < DAWN_START_HOUR || hour >= NIGHT_START_HOUR) return "night";
  if (hour < DAY_START_HOUR) return "dawn";
  if (hour < DUSK_START_HOUR) return "day";
  return "dusk";
}

export function timeOfDayFor(setting: MapTimeSetting, hour: number): TimeOfDay {
  return setting === "clock" ? timeOfDayAt(hour) : setting;
}

/** A stored setting, read back safely: anything unknown means following the clock. */
export function parseMapTimeSetting(value: string | null): MapTimeSetting {
  return TIMES_OF_DAY.find(mood => mood === value) ?? "clock";
}
