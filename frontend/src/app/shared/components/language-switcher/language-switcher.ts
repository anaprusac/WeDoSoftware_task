import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

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

  // Click-to-open pairs naturally with click-outside-to-close. A mouseleave-based close was used
  // previously but broke as soon as the pointer crossed the small gap between the trigger and the
  // dropdown (the gap sits outside the trigger's hoverable box, since the absolutely-positioned menu
  // doesn't expand it), closing the menu before a click on an option could land.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  select(lang: Language): void {
    this.languageService.use(lang);
    this.preferencesService.persistLanguage(lang);
    this.open.set(false);
  }
}
