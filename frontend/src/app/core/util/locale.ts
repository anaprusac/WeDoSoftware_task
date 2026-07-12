/**
 * Maps our internal language code to the BCP-47 locale used for Intl formatting. Plain "sr" resolves
 * to Cyrillic by default in ICU, but this app's translations use Latin script, so Serbian must be
 * pinned to "sr-Latn" everywhere a month/weekday name is formatted via Intl.
 */
export function toIntlLocale(lang: string): string {
  return lang === 'sr' ? 'sr-Latn' : lang;
}
