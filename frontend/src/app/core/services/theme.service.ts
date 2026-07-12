import { Injectable, computed, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Applies the light/dark theme by stamping `data-theme` on the document root. The choice is
 * persisted in localStorage; the first visit falls back to the OS preference.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly StorageKey = 'wds-theme';

  private readonly _theme = signal<Theme>(this.readInitial());
  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => document.documentElement.setAttribute('data-theme', this._theme()));
  }

  toggle(): void {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem(ThemeService.StorageKey, theme);
  }

  private readInitial(): Theme {
    const stored = localStorage.getItem(ThemeService.StorageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
