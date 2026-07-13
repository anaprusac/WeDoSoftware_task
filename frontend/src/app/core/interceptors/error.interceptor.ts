import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * On a 401 for an authenticated request, transparently refreshes the token once and retries.
 * Server/network errors surface a toast; validation errors (4xx) bubble to the calling form.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  // Resolved lazily via Injector, not eagerly with inject(): AuthService's constructor chain reaches
  // TranslateService (through LanguageService), and TranslateService's own translation-file fetch
  // passes through this interceptor. Eagerly injecting AuthService here for every request, including
  // that very first i18n fetch, would re-enter TranslateService while it is still being constructed
  // (NG0200 circular dependency). Resolving on first actual use (inside catchError, i.e. only when an
  // HTTP error occurs) sidesteps that entirely.
  const injector = inject(Injector);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isRefresh = req.url.endsWith('/auth/refresh');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const auth = injector.get(AuthService);

      if (error.status === 401 && isApi && !isRefresh && auth.isAuthenticated()) {
        return auth.refresh().pipe(
          switchMap(() =>
            next(
              req.clone({
                withCredentials: true,
                setHeaders: { Authorization: `Bearer ${auth.accessToken}` },
              }),
            ),
          ),
          catchError((refreshError) => {
            auth.clearSession();
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      if (isApi && (error.status === 0 || error.status >= 500)) {
        toast.error(injector.get(TranslateService).instant('common.error'));
      }

      return throwError(() => error);
    }),
  );
};
