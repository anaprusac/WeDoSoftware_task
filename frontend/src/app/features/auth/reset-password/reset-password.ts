import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { matchValidator, passwordStrengthValidator } from '../../../core/validation/password';
import { LanguageSwitcher } from '../../../shared/components/language-switcher/language-switcher';
import { PasswordRules } from '../../../shared/components/password-rules/password-rules';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';

/** Reset-password page reached from the emailed link (?email=&token=). Sets a new password. */
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, PasswordRules, ThemeToggle, LanguageSwitcher],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  private readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly hasToken = this.email.length > 0 && this.token.length > 0;
  readonly submitting = signal(false);
  readonly errorText = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      repeatNewPassword: ['', [Validators.required]],
    },
    { validators: matchValidator('newPassword', 'repeatNewPassword') },
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (!this.hasToken || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorText.set(null);

    const value = this.form.getRawValue();
    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: value.newPassword,
        confirmNewPassword: value.repeatNewPassword,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('auth.resetSuccess'));
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorText.set(error?.error?.detail ?? this.translate.instant('auth.resetInvalid'));
          this.submitting.set(false);
        },
      });
  }
}
