const STORAGE_KEY = "lakaw-finish-success-seen";

/** Clears the celebrate-once flag so the next completed walk can show it again. */
export function clearFinishSuccessSeen() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / no storage: ignore.
  }
}

export function readFinishSuccessSeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeFinishSuccessSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode / no storage: ignore.
  }
}
