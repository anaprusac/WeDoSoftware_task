import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { ThemePreference } from '../models/user.model';

/**
 * Persists the theme/language preference to the backend whenever it is changed while authenticated
 * (from the header or the profile page), so the choice follows the account across devices. Height and
 * weight are read from the current cached profile since the API expects a full replace.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  persistTheme(theme: ThemePreference): void {
    this.persist({ themePreference: theme });
  }

  persistLanguage(language: string): void {
    this.persist({ preferredLanguage: language });
  }

  private persist(change: { themePreference?: ThemePreference; preferredLanguage?: string }): void {
    const user = this.authService.user();
    if (!user) {
      return; // Not logged in — the client-side preference (localStorage) is enough.
    }

    this.profileService
      .update({
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        preferredLanguage: change.preferredLanguage ?? user.preferredLanguage,
        themePreference: change.themePreference ?? user.themePreference,
        preferredUnitSystem: user.preferredUnitSystem,
      })
      .subscribe((updated) => this.authService.setUser(updated));
  }
}
