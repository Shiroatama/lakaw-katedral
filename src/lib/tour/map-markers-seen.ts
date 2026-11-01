const STORAGE_KEY = "lakaw-map-markers-seen";

/** True after the staggered map-marker intro has played once. */
export function readMapMarkersSeen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeMapMarkersSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode / no storage: ignore.
  }
}
