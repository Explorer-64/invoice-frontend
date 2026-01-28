export type NonEssentialCategory = "analytics" | "marketing";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = "invoiceJobs.cookiePreferences";
export const OPEN_COOKIE_SETTINGS_EVENT = "invoicejobs:open-cookie-settings";

const consentListeners = new Set<(prefs: CookiePreferences) => void>();
const scriptQueues: Record<NonEssentialCategory, Set<() => void>> = {
  analytics: new Set(),
  marketing: new Set(),
};

const isBrowser = typeof window !== "undefined";

export const createDefaultPreferences = (): CookiePreferences => ({
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export function getStoredPreferences(): CookiePreferences | null {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookiePreferences;
  } catch (error) {
    console.error("Failed to parse cookie preferences", error);
    return null;
  }
}

export function hasConsentFor(category: NonEssentialCategory): boolean {
  const prefs = getStoredPreferences();
  return Boolean(prefs?.[category]);
}

export function savePreferences(partial: Partial<Omit<CookiePreferences, "essential" | "updatedAt">>): CookiePreferences {
  const existing = getStoredPreferences();
  const nextPrefs: CookiePreferences = {
    essential: true,
    analytics: partial.analytics ?? existing?.analytics ?? false,
    marketing: partial.marketing ?? existing?.marketing ?? false,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(nextPrefs));
  }

  notifyListeners(nextPrefs);
  return nextPrefs;
}

export function clearPreferences() {
  if (!isBrowser) return;
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  notifyListeners(createDefaultPreferences());
}

export function subscribeToConsent(listener: (prefs: CookiePreferences) => void) {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
}

function notifyListeners(prefs: CookiePreferences) {
  consentListeners.forEach((listener) => listener(prefs));
  flushScriptQueues(prefs);
}

function flushScriptQueues(prefs: CookiePreferences) {
  (Object.keys(scriptQueues) as NonEssentialCategory[]).forEach((category) => {
    if (prefs[category]) {
      scriptQueues[category].forEach((callback) => callback());
      scriptQueues[category].clear();
    }
  });
}

export function runWhenConsented(category: NonEssentialCategory, callback: () => void) {
  const prefs = getStoredPreferences();
  if (prefs?.[category]) {
    callback();
    return () => undefined;
  }

  scriptQueues[category].add(callback);
  return () => scriptQueues[category].delete(callback);
}

export function triggerCookieSettings() {
  if (!isBrowser) return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
