import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { UserProfile } from '../models/user.model';

/**
 * Holds authentication state as signals. The access token lives only in memory (never in
 * localStorage), and the refresh token is an http-only cookie the browser sends automatically.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<UserProfile | null>(null);
  private refreshInFlight$: Observable<AuthResponse> | null = null;

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null && this._accessToken() !== null);

  get accessToken(): string | null {
    return this._accessToken();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.setSession(response)));
  }

  /** Shares a single in-flight refresh so concurrent 401s don't rotate each other out. */
  refresh(): Observable<AuthResponse> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}).pipe(
        tap((response) => this.setSession(response)),
        finalize(() => (this.refreshInFlight$ = null)),
        shareReplay(1),
      );
    }
    return this.refreshInFlight$;
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(finalize(() => this.clearSession()));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/reset-password`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/change-password`, request);
  }

  loadProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`).pipe(tap((user) => this._user.set(user)));
  }

  /** Updates the cached user after a profile change elsewhere. */
  setUser(user: UserProfile): void {
    this._user.set(user);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
  }

  private setSession(response: AuthResponse): void {
    this._accessToken.set(response.accessToken);
    this._user.set(response.user);
  }
}
