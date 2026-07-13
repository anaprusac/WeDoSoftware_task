import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  readonly step = signal<1 | 2>(1);

  readonly heightUnit = signal<'cm' | 'in'>('cm');
  readonly weightUnit = signal<'kg' | 'lb'>('kg');

  readonly heightRange = computed(() => (this.heightUnit() === 'cm' ? { min: 80, max: 250 } : { min: 31, max: 98 }));
  readonly weightRange = computed(() => (this.weightUnit() === 'kg' ? { min: 35, max: 220 } : { min: 77, max: 485 }));

  // Age/height/weight start empty (not a fake-looking pre-filled default) so a value only ever
  // reaches the server if the user actually entered one; the range hint is shown as a placeholder.
  readonly form: FormGroup<{
    email: FormControl<string>;
    username: FormControl<string>;
    password: FormControl<string>;
    repeatPassword: FormControl<string>;
    gender: FormControl<string>;
    age: FormControl<number | null>;
    height: FormControl<number | null>;
    weight: FormControl<number | null>;
  }> = new FormGroup(
    {
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      username: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
      password: this.fb.nonNullable.control('', [Validators.required, passwordStrengthValidator()]),
      repeatPassword: this.fb.nonNullable.control('', [Validators.required]),
      gender: this.fb.nonNullable.control('', [Validators.required]),
      age: this.fb.control<number | null>(null, [Validators.required, Validators.min(8), Validators.max(100)]),
      height: this.fb.control<number | null>(null, [Validators.required]),
      weight: this.fb.control<number | null>(null, [Validators.required]),
    },
    { validators: matchValidator('password', 'repeatPassword') },
  );

  get f() {
    return this.form.controls;
  }

  private readonly step1Controls = ['email', 'username', 'password', 'repeatPassword'] as const;

  get step1Valid(): boolean {
    return this.step1Controls.every((name) => this.f[name].valid) && !this.form.hasError('passwordsMismatch');
  }

  next(): void {
    if (!this.step1Valid) {
      this.step1Controls.forEach((name) => this.f[name].markAsTouched());
      return;
    }
    this.step.set(2);
  }

  back(): void {
    this.errorText.set(null);
    this.step.set(1);
  }

  setAge(value: number | null): void {
    this.f.age.setValue(value);
  }

  setHeight(value: number | null): void {
    this.f.height.setValue(value);
  }

  setWeight(value: number | null): void {
    this.f.weight.setValue(value);
  }

  toggleHeightUnit(): void {
    const current = this.f.height.value;
    if (this.heightUnit() === 'cm') {
      this.heightUnit.set('in');
      this.f.height.setValue(current === null ? null : Math.round(current / 2.54));
    } else {
      this.heightUnit.set('cm');
      this.f.height.setValue(current === null ? null : Math.round(current * 2.54));
    }
  }

  toggleWeightUnit(): void {
    const current = this.f.weight.value;
    if (this.weightUnit() === 'kg') {
      this.weightUnit.set('lb');
      this.f.weight.setValue(current === null ? null : Math.round(current * 2.20462));
    } else {
      this.weightUnit.set('kg');
      this.f.weight.setValue(current === null ? null : Math.round(current / 2.20462));
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
    // Guaranteed non-null past the invalid check above (Validators.required on each).
    const age = value.age!;
    const rawHeight = value.height!;
    const rawWeight = value.weight!;
    const heightCm = this.heightUnit() === 'cm' ? rawHeight : Math.round(rawHeight * 2.54);
    const weightKg = this.weightUnit() === 'kg' ? rawWeight : Math.round(rawWeight / 2.20462);

    this.authService
      .register({
        email: value.email,
        username: value.username,
        password: value.password,
        confirmPassword: value.repeatPassword,
        gender: value.gender as Gender,
        age,
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
