import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog';
import { Toaster } from './shared/components/toaster/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster, ConfirmDialog],
  templateUrl: './app.html',
})
export class App {
  // Instantiating ThemeService applies the persisted theme via its constructor effect.
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  constructor() {
    this.languageService.init();
  }
}
