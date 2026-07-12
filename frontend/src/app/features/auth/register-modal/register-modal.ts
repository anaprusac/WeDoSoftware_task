import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Gender } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { matchValidator, passwordStrengthValidator } from '../../../core/validation/password';
import { Modal } from '../../../shared/components/modal/modal';
import { PasswordRules } from '../../../shared/components/password-rules/password-rules';
import { WheelPicker } from '../../../shared/components/wheel-picker/wheel-picker';

/** Registration popup (frame 2). Height/weight support a metric/imperial toggle; the API always gets metric. */
@Component({
  selector: 'app-register-modal',
  imports: [ReactiveFormsModule, TranslatePipe, Modal, PasswordRules, WheelPicker],
  templateUrl: './register-modal.html',
  styleUrl: './register-modal.css',
})
export class RegisterModal {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly close = output<void>();
  readonly registered = output<void>();

  readonly submitting = signal(false);
  readonly errorText = signal<string | null>(null);

  readonly heightUnit = signal<'cm' | 'in'>('cm');
  readonly weightUnit = signal<'kg' | 'lb'>('kg');

  readonly heightRange = computed(() => (this.heightUnit() === 'cm' ? { min: 80, max: 250 } : { min: 31, max: 98 }));
  readonly weightRange = computed(() => (this.weightUnit() === 'kg' ? { min: 35, max: 220 } : { min: 77, max: 485 }));

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      repeatPassword: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      age: [25, [Validators.required, Validators.min(8), Validators.max(100)]],
      height: [175, [Validators.required]],
      weight: [75, [Validators.required]],
    },
    { validators: matchValidator('password', 'repeatPassword') },
  );

  get f() {
    return this.form.controls;
  }

  setAge(value: number): void {
    this.f.age.setValue(value);
  }

  setHeight(value: number): void {
    this.f.height.setValue(value);
  }

  setWeight(value: number): void {
    this.f.weight.setValue(value);
  }

  toggleHeightUnit(): void {
    const current = this.f.height.value;
    if (this.heightUnit() === 'cm') {
      this.heightUnit.set('in');
      this.f.height.setValue(Math.round(current / 2.54));
    } else {
      this.heightUnit.set('cm');
      this.f.height.setValue(Math.round(current * 2.54));
    }
  }

  toggleWeightUnit(): void {
    const current = this.f.weight.value;
    if (this.weightUnit() === 'kg') {
      this.weightUnit.set('lb');
      this.f.weight.setValue(Math.round(current * 2.20462));
    } else {
      this.weightUnit.set('kg');
      this.f.weight.setValue(Math.round(current / 2.20462));
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorText.set(null);

    const value = this.form.getRawValue();
    const heightCm = this.heightUnit() === 'cm' ? value.height : Math.round(value.height * 2.54);
    const weightKg = this.weightUnit() === 'kg' ? value.weight : Math.round(value.weight / 2.20462);

    this.authService
      .register({
        email: value.email,
        username: value.username,
        password: value.password,
        confirmPassword: value.repeatPassword,
        gender: value.gender as Gender,
        age: value.age,
        heightCm,
        weightKg,
        preferredUnitSystem: this.heightUnit() === 'cm' ? 'Metric' : 'Imperial',
      })
      .subscribe({
        next: () => this.registered.emit(),
        error: (error: HttpErrorResponse) => {
          this.errorText.set(error?.error?.detail ?? this.translate.instant('auth.registerFailed'));
          this.submitting.set(false);
        },
      });
  }
}
