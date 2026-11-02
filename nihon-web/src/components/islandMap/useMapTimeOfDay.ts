import { useEffect, useState } from "react";
import { parseMapTimeSetting, timeOfDayAt, timeOfDayFor } from "../../lib/timeOfDay";
import type { MapTimeSetting, TimeOfDay } from "../../lib/timeOfDay";

// How often the map looks at the clock, so it turns from day to dusk while it is open.
const CLOCK_CHECK_MS = 60_000;
// The learner's choice on the Time island, kept in this browser only.
const SETTING_KEY = "island_map_time";

function useCurrentHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const timer = window.setInterval(() => setHour(new Date().getHours()), CLOCK_CHECK_MS);
    return () => window.clearInterval(timer);
  }, []);
  return hour;
}

function readSetting(): MapTimeSetting {
  try {
    return parseMapTimeSetting(localStorage.getItem(SETTING_KEY));
  } catch (error) {
    console.warn("The map's time setting could not be read; following the clock", error);
    return "clock";
  }
}

function saveSetting(setting: MapTimeSetting) {
  try {
    if (setting === "clock") localStorage.removeItem(SETTING_KEY);
    else localStorage.setItem(SETTING_KEY, setting);
  } catch (error) {
    console.warn("The map's time setting could not be saved; it lasts until the page is left", error);
  }
}

export type MapTime = { timeOfDay: TimeOfDay; clockTimeOfDay: TimeOfDay; setting: MapTimeSetting; chooseSetting: (setting: MapTimeSetting) => void };

export function useMapTimeOfDay(): MapTime {
  const hour = useCurrentHour();
  const [setting, setSetting] = useState(readSetting);
  const chooseSetting = (next: MapTimeSetting) => { setSetting(next); saveSetting(next); };
  return { timeOfDay: timeOfDayFor(setting, hour), clockTimeOfDay: timeOfDayAt(hour), setting, chooseSetting };
}
