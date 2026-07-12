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
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  // Resolved lazily to avoid a circular dependency: TranslateService loads its JSON via HttpClient,
  // which would re-enter this interceptor while TranslateService is still being constructed.
  const injector = inject(Injector);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isRefresh = req.url.endsWith('/auth/refresh');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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
