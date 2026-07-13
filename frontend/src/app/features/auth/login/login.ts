import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageSwitcher } from '../../../shared/components/language-switcher/language-switcher';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { ForgotPasswordModal } from '../forgot-password-modal/forgot-password-modal';
import { RegisterModal } from '../register-modal/register-modal';

/** Login page (frame 1): welcome panel + sign-in card, with register/forgot popups over a dimmed page. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe, RegisterModal, ForgotPasswordModal, ThemeToggle, LanguageSwitcher],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly showRegister = signal(false);
  readonly showForgot = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorKey.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.errorKey.set('auth.loginFailed');
        this.submitting.set(false);
      },
    });
  }

  openRegister(): void {
    this.errorKey.set(null);
    this.showForgot.set(false);
    this.showRegister.set(true);
  }

  openForgot(): void {
    this.errorKey.set(null);
    this.showRegister.set(false);
    this.showForgot.set(true);
  }

  onRegistered(): void {
    this.showRegister.set(false);
    this.router.navigate(['/home']);
  }

  toggleShowPassword(): void {
    this.showPassword.set(!this.showPassword());
  }
}
