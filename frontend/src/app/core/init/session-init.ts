import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

/**
 * Runs during bootstrap: applies the persisted language (localStorage), then tries to restore a
 * session from the refresh cookie so a page reload keeps the user signed in. If the session restores,
 * AuthService overrides the language/theme with the account's saved preference, so a fresh device
 * still ends up matching what was last chosen while logged in. A failed restore (no/expired cookie)
 * simply leaves the app unauthenticated with the local preference applied.
 */
export function initSession() {
  const auth = inject(AuthService);
  const language = inject(LanguageService);

  language.init();

  return auth.refresh().pipe(catchError(() => of(null)));
}
