import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Language, LanguageService } from '../../../core/services/language.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { FlagIcon } from '../flag-icon/flag-icon';

/** Flag + name dropdown to switch language. Inherits text colour, so it works on any surface. */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe, FlagIcon],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  private readonly languageService = inject(LanguageService);
  private readonly preferencesService = inject(PreferencesService);

  readonly currentLang = this.languageService.lang;
  readonly open = signal(false);
  readonly options: { code: Language; labelKey: string }[] = [
    { code: 'en', labelKey: 'language.english' },
    { code: 'sr', labelKey: 'language.serbian' },
  ];

  labelKeyFor(lang: Language): string {
    return lang === 'en' ? 'language.english' : 'language.serbian';
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  select(lang: Language): void {
    this.languageService.use(lang);
    this.preferencesService.persistLanguage(lang);
    this.open.set(false);
  }
}
