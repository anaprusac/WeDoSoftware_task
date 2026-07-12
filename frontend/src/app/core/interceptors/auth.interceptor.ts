import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Endpoints that establish or refresh a session — they must NOT carry a (possibly stale) bearer token.
const SESSION_ENDPOINTS = /\/auth\/(login|register|refresh|forgot-password|reset-password)$/;

/** Adds credentials (for the refresh cookie) and the bearer token to API requests. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  let request = req.clone({ withCredentials: true });

  const token = auth.accessToken;
  if (token && !SESSION_ENDPOINTS.test(req.url)) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(request);
};
