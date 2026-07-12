import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Runs during bootstrap: tries to restore a session from the refresh cookie so a page reload keeps
 * the user signed in. A failure (no/expired cookie) simply leaves the app unauthenticated.
 */
export function initSession() {
  const auth = inject(AuthService);
  return auth.refresh().pipe(catchError(() => of(null)));
}
