import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { matchValidator, passwordStrengthValidator } from '../../../core/validation/password';
import { Modal } from '../../../shared/components/modal/modal';
import { PasswordRules } from '../../../shared/components/password-rules/password-rules';

/** "Reset password" popup on the profile page (frame 11) — requires the current password. */
@Component({
  selector: 'app-change-password-modal',
  imports: [ReactiveFormsModule, TranslatePipe, Modal, PasswordRules],
  templateUrl: './change-password-modal.html',
  styleUrl: './change-password-modal.css',
})
export class ChangePasswordModal {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly close = output<void>();
  readonly submitting = signal(false);
  readonly errorText = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      repeatNewPassword: ['', Validators.required],
    },
    { validators: matchValidator('newPassword', 'repeatNewPassword') },
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorText.set(null);

    const value = this.form.getRawValue();
    this.authService
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        confirmNewPassword: value.repeatNewPassword,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('changePassword.success'));
          this.close.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.errorText.set(error?.error?.detail ?? this.translate.instant('changePassword.currentIncorrect'));
          this.submitting.set(false);
        },
      });
  }
}
