import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const AVAILABLE_LANGUAGES = ['en', 'sr'] as const;
export type Language = (typeof AVAILABLE_LANGUAGES)[number];

/**
 * Thin wrapper over ngx-translate that persists the chosen language and keeps a signal in sync so
 * templates can react. New languages are added by dropping a JSON file in `public/i18n` and listing
 * the code in {@link AVAILABLE_LANGUAGES}.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private static readonly StorageKey = 'wds-lang';

  private readonly translate = inject(TranslateService);
  private readonly _lang = signal<Language>('en');
  readonly lang = this._lang.asReadonly();
  readonly available = AVAILABLE_LANGUAGES;

  /** Called once at startup to apply the stored (or default) language. */
  init(): void {
    const stored = localStorage.getItem(LanguageService.StorageKey);
    this.use(this.isSupported(stored) ? stored : 'en');
  }

  use(lang: Language): void {
    this._lang.set(lang);
    this.translate.use(lang);
    localStorage.setItem(LanguageService.StorageKey, lang);
    document.documentElement.setAttribute('lang', lang);
  }

  /** Applies `lang` only if it's one of the supported codes; silently ignores anything else. */
  useIfSupported(lang: string): void {
    if (this.isSupported(lang)) {
      this.use(lang);
    }
  }

  private isSupported(value: string | null): value is Language {
    return value !== null && (AVAILABLE_LANGUAGES as readonly string[]).includes(value);
  }
}
