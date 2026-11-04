type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void | Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void | Promise<void>;
};

/** True when the document (or a webkit host) is in fullscreen. */
export function isAppFullscreen() {
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

/** Enter browser fullscreen from a user tap. No-ops if denied or unsupported. */
export function requestAppFullscreen() {
  if (isAppFullscreen()) return;
  const root = document.documentElement as FullscreenElement;
  const request =
    root.requestFullscreen?.bind(root) ??
    root.webkitRequestFullscreen?.bind(root);
  if (!request) return;
  void Promise.resolve(request()).catch(() => {});
}

/** Leave browser fullscreen. No-ops if not in fullscreen or denied. */
export function exitAppFullscreen() {
  if (!isAppFullscreen()) return;
  const doc = document as FullscreenDocument;
  const exit =
    doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc);
  if (!exit) return;
  void Promise.resolve(exit()).catch(() => {});
}

/** Toggle browser fullscreen from a user tap. */
export function toggleAppFullscreen() {
  if (isAppFullscreen()) {
    exitAppFullscreen();
    return;
  }
  requestAppFullscreen();
}
