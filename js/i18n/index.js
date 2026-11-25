/**
 * Centralized internationalization (i18n) engine for GTA VI fm.
 * Supports English ('en', default fallback) and Brazilian Portuguese ('pt-BR').
 * Zero external dependencies; DOM-safe for unit testing in Node.js.
 */

import { en } from './en.js';
import { ptBR } from './pt-BR.js';

export const SUPPORTED_LOCALES = ['en', 'pt-BR'];
export const DEFAULT_LOCALE = 'en';
export const LANGUAGE_STORAGE_KEY = 'gta_vi_fm_language_v1';

const DICTIONARIES = {
  en,
  'pt-BR': ptBR,
};

let currentLocale = DEFAULT_LOCALE;
const localeListeners = new Set();

function resolveStorage(explicitStorage) {
  if (explicitStorage !== undefined) return explicitStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

function resolveNavigator(explicitNavigator) {
  if (explicitNavigator !== undefined) return explicitNavigator;
  if (typeof navigator !== 'undefined') {
    return navigator;
  }
  return null;
}

/**
 * Normalizes a BCP-47 tag into one of the supported locales ('en' or 'pt-BR'),
 * mapping any Portuguese regional variant (e.g. 'pt-PT', 'pt') to 'pt-BR',
 * any English variant ('en-US', 'en-GB') to 'en', and returning null otherwise.
 */
export function normalizeLocaleTag(tag) {
  if (!tag || typeof tag !== 'string') return null;
  const cleaned = tag.trim().replace(/_/g, '-');
  if (!cleaned) return null;

  let baseLanguage = '';
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Locale === 'function') {
      baseLanguage = new Intl.Locale(cleaned).language.toLowerCase();
    }
  } catch {
    baseLanguage = '';
  }

  if (!baseLanguage) {
    baseLanguage = cleaned.split('-')[0].toLowerCase();
  }

  if (baseLanguage === 'pt') return 'pt-BR';
  if (baseLanguage === 'en') return 'en';
  return null;
}

/**
 * Detects the best supported locale from the browser/device preferences
 * (`navigator.languages` in priority order, then `navigator.language`).
 */
export function detectDeviceLocale(explicitNavigator) {
  const nav = resolveNavigator(explicitNavigator);
  if (!nav) return DEFAULT_LOCALE;

  const candidates = [];
  if (Array.isArray(nav.languages)) {
    candidates.push(...nav.languages);
  }
  if (typeof nav.language === 'string' && nav.language) {
    candidates.push(nav.language);
  }

  for (const tag of candidates) {
    const matched = normalizeLocaleTag(tag);
    if (matched) return matched;
  }

  return DEFAULT_LOCALE;
}

export function getStoredLocale(explicitStorage) {
  const storage = resolveStorage(explicitStorage);
  if (!storage || typeof storage.getItem !== 'function') return null;
  try {
    const raw = storage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLocaleTag(raw);
  } catch {
    return null;
  }
}

export function saveLocalePreference(locale, explicitStorage) {
  const normalized = normalizeLocaleTag(locale);
  if (!normalized) return false;
  const storage = resolveStorage(explicitStorage);
  if (!storage || typeof storage.setItem !== 'function') return false;
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves active locale according to strict priority:
 * 1. Saved manual user preference in localStorage
 * 2. Device / browser preferred language
 * 3. English ('en') fallback
 */
export function resolveInitialLocale({ storage, navigator: nav } = {}) {
  const stored = getStoredLocale(storage);
  if (stored) return stored;
  return detectDeviceLocale(nav);
}

export function getLocale() {
  return currentLocale;
}

export function getDictionary(localeOverride = null) {
  const loc = normalizeLocaleTag(localeOverride) || currentLocale;
  return DICTIONARIES[loc] || DICTIONARIES[DEFAULT_LOCALE];
}

function getNestedValue(obj, path) {
  if (!obj || typeof path !== 'string') return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in cur) {
      cur = cur[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function formatNumber(value, localeOverride = null) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  const dict = getDictionary(localeOverride);
  try {
    return new Intl.NumberFormat(dict.numberLocale || dict.locale).format(num);
  } catch {
    return String(num);
  }
}

export function formatDate(dateInput, options = { dateStyle: 'medium' }, localeOverride = null) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const dict = getDictionary(localeOverride);
  try {
    return new Intl.DateTimeFormat(dict.numberLocale || dict.locale, options).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Translates a dot-separated key (e.g., 'nav.songs') using the active locale,
 * falling back to English if the key is missing, and interpolating `{var}` tokens.
 */
export function t(key, vars = {}, localeOverride = null) {
  const dict = getDictionary(localeOverride);
  let template = getNestedValue(dict, key);
  if (template === undefined) {
    template = getNestedValue(DICTIONARIES[DEFAULT_LOCALE], key);
  }
  if (typeof template !== 'string') {
    return String(key);
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (!(name in vars) || vars[name] === undefined || vars[name] === null) {
      return '';
    }
    const val = vars[name];
    return typeof val === 'number' ? formatNumber(val, localeOverride) : String(val);
  });
}

/**
 * Returns localized editorial metadata for a station/collection while keeping
 * its official title (`station.name`) untouched.
 */
export function getStationLocalizedContent(station, localeOverride = null) {
  if (!station) {
    return { genre: '', hosts: null, description: '' };
  }
  const dict = getDictionary(localeOverride);
  const localized = dict.catalog?.stations?.[station.id];
  return {
    genre: localized?.genre ?? station.genre ?? '',
    hosts: localized && 'hosts' in localized ? localized.hosts : station.hosts ?? null,
    description: localized?.description ?? station.description ?? '',
  };
}

/**
 * Returns localized metadata for a podcast station (`the-wipe`, `wktt`) while
 * keeping official show titles and proper names untouched.
 */
export function getPodcastLocalizedContent(station, localeOverride = null) {
  const podcast = station?.podcast;
  if (!podcast) return null;

  const dict = getDictionary(localeOverride);
  const localized = dict.catalog?.podcasts?.[station.id];
  if (!localized) return podcast;

  const partPrefix = localized.partPrefix || 'Part';
  const segments = (podcast.segments || []).map((seg) => {
    const locSeg = localized.segments?.[seg.id];
    return {
      ...seg,
      host: locSeg?.host || seg.host,
      description: locSeg?.description || seg.description,
    };
  });

  const broadcastParts = (podcast.broadcastParts || []).map((part) => {
    const match = String(part.label || '').match(/^Part\s+(\d+)$/i);
    return {
      ...part,
      label: match ? `${partPrefix} ${match[1]}` : part.label,
    };
  });

  return {
    ...podcast,
    format: localized.format || podcast.format,
    style: localized.style || podcast.style,
    hosts: localized.hosts || podcast.hosts,
    topics: localized.topics || podcast.topics,
    segments,
    broadcastParts,
  };
}

/**
 * Applies translations to all declarative `[data-i18n*]` elements in the DOM
 * and synchronizes `<html lang>`, meta description, and language switcher state.
 */
export function applyDomTranslations(root = typeof document !== 'undefined' ? document : null) {
  if (!root) return;

  if (typeof document !== 'undefined' && root === document) {
    document.documentElement.lang = currentLocale;

    const desc = t('meta.description');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.setAttribute('placeholder', t(key));
    }
  });

  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.setAttribute('title', t(key));
    }
  });

  root.querySelectorAll('[data-lang-option]').forEach((btn) => {
    const optionLocale = normalizeLocaleTag(btn.getAttribute('data-lang-option'));
    const isActive = optionLocale === currentLocale;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

export function subscribeLocaleChange(listener) {
  if (typeof listener !== 'function') return () => {};
  localeListeners.add(listener);
  return () => {
    localeListeners.delete(listener);
  };
}

/**
 * Sets the active locale, optionally persists the user's manual preference in localStorage,
 * updates the DOM immediately without reload, and notifies subscribers.
 */
export function setLocale(nextLocale, { persist = true, applyDom = true } = {}) {
  const resolved = normalizeLocaleTag(nextLocale) || DEFAULT_LOCALE;
  currentLocale = resolved;

  if (persist) {
    saveLocalePreference(resolved);
  }

  if (applyDom && typeof document !== 'undefined') {
    applyDomTranslations(document);
  }

  for (const listener of localeListeners) {
    try {
      listener(resolved);
    } catch {
      // Isolate listener errors
    }
  }

  return resolved;
}

export function initI18n({ storage, navigator: nav } = {}) {
  const initial = resolveInitialLocale({ storage, navigator: nav });
  currentLocale = initial;
  if (typeof document !== 'undefined') {
    applyDomTranslations(document);
  }
  return initial;
}
