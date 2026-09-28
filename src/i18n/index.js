/**
 * God's Eye View — internationalisation.
 *
 * Usage: import { t, setLocale, initI18n } from './i18n/index.js';
 *        const label = t('firstRun.title');
 *
 * The active locale is persisted in localStorage under 'gev:locale:v1' and
 * detected from the browser preference on first run. Call initI18n(document)
 * once at startup to apply the locale to the static HTML in the page.
 *
 * Bundles are statically imported so t() stays synchronous at runtime.
 */

import en from './locales/en.json' with { type: 'json' };
import fr from './locales/fr.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };
import de from './locales/de.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };

const BUNDLES = { en, fr, es, de, pt };

let currentLocale = 'en';

/**
 * @type {Set<string>}
 */
export const SUPPORTED_LOCALES = new Set(['en', 'fr', 'es', 'de', 'pt']);

/**
 * Resolve the best-supported locale for this browser.
 * @param {Document} [documentRef]
 * @returns {string} A supported locale tag (always falls back to 'en').
 */
export function detectLocale(documentRef) {
  const doc = documentRef || globalThis.document;
  if (typeof doc?.querySelector !== 'function') {
    return currentLocale || 'en';
  }
  try {
    const stored = localStorage.getItem('gev:locale:v1');
    if (stored && SUPPORTED_LOCALES.has(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const nav =
    doc?.ownerDocument?.navigator ||
    doc?.navigator ||
    globalThis.navigator ||
    globalThis?.navigator ||
    null;
  const raw =
    (nav?.languages && nav.languages.length ? nav.languages[0] : nav?.language || nav?.userLanguage || '') || '';
  const tag = raw.toLowerCase().split(/[-_]/)[0];
  if (tag === 'fr') return 'fr';
  if (tag === 'es') return 'es';
  if (tag === 'de') return 'de';
  if (tag === 'pt') return 'pt';
  return 'en';
}

/**
 * Set the active locale and persist it.
 * @param {string} locale
 */
export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.has(locale)) locale = 'en';
  currentLocale = locale;
  try {
    localStorage.setItem('gev:locale:v1', locale);
  } catch {
    /* best effort */
  }
}

/** @returns {string} The active locale tag. */
export function getLocale() {
  return currentLocale;
}

/**
 * Translate a key into the current locale. Returns the key itself when no
 * translation is available, so missing strings surface visibly rather than
 * silently disappearing.
 *
 * @param {string} key  Dot-separated path, e.g. 'firstRun.title'.
 * @param {object} [params]  Mustache-style replacements for `{name}`.
 * @returns {string}
 */
export function t(key, params) {
  const bundle = BUNDLES[currentLocale] || BUNDLES.en;
  const value = bundle[key] ?? BUNDLES.en[key] ?? key;
  if (!params || typeof params !== 'object') return value;
  return Object.keys(params).reduce(
    (str, k) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]),
    value,
  );
}

/**
 * Switch locale and re-render the static page text via data-i18n attributes.
 * @param {Document} [documentRef]
 * @returns {string} The new locale.
 */
export function applyLocale(documentRef) {
  const doc = documentRef || globalThis.document;
  currentLocale = detectLocale(doc);
  const bundle = BUNDLES[currentLocale] || BUNDLES.en;
  const nodes = doc?.querySelectorAll?.('[data-i18n]');
  if (!nodes) return currentLocale;
  for (const node of nodes) {
    const key = node.getAttribute('data-i18n');
    if (key && bundle[key]) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        node.placeholder = bundle[key];
      } else {
        node.textContent = bundle[key];
      }
    }
  }
  // Apply aria-label translations from data-i18n-aria attributes.
  const ariaNodes = doc?.querySelectorAll?.('[data-i18n-aria]');
  if (ariaNodes) {
    for (const node of ariaNodes) {
      const key = node.getAttribute('data-i18n-aria');
      if (key && bundle[key]) {
        node.setAttribute('aria-label', bundle[key]);
      }
    }
  }
  return currentLocale;
}

/**
 * Initialise i18n for the page: detect locale, persist, apply to HTML.
 * Call once at startup.
 * @param {Document} [documentRef]
 * @returns {{ locale: string, t: typeof t, setLocale: typeof setLocale }}
 */
export function initI18n(documentRef) {
  const doc = documentRef || globalThis.document;
  currentLocale = detectLocale(doc);
  applyLocale(doc);
  return {
    locale: currentLocale,
    t,
    setLocale,
    getLocale,
    applyLocale,
  };
}
