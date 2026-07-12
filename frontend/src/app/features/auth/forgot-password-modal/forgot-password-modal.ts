import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Modal } from '../../../shared/components/modal/modal';

/** Forgot-password popup (frame 3): username in, reset link emailed. */
@Component({
  selector: 'app-forgot-password-modal',
  imports: [ReactiveFormsModule, TranslatePipe, Modal],
  templateUrl: './forgot-password-modal.html',
  styleUrl: './forgot-password-modal.css',
})
export class ForgotPasswordModal {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly close = output<void>();
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      // Identical outcome whether or not the account exists (no enumeration).
      next: () => this.done(),
      error: () => this.done(),
    });
  }

  private done(): void {
    this.toast.success(this.translate.instant('auth.resetSent'));
    this.close.emit();
  }
}
