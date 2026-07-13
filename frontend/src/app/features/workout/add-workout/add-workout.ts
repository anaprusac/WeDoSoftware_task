import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WorkoutType } from '../../../core/models/workout.model';
import { WORKOUT_TYPES, calculateIntensity } from '../../../core/domain/intensity';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { toDateInputValue } from '../../../core/util/format';
import { InfoTooltip } from '../../../shared/components/info-tooltip/info-tooltip';
import { WorkoutTypeIcon } from '../../../shared/components/workout-type-icon/workout-type-icon';

/** Add-workout form (frame 5): live intensity, no-future restriction, confirm dialogs for cancel/save. */
@Component({
  selector: 'app-add-workout',
  imports: [ReactiveFormsModule, TranslatePipe, InfoTooltip, WorkoutTypeIcon],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css',
})
export class AddWorkout {
  private readonly fb = inject(FormBuilder);
  private readonly workoutService = inject(WorkoutService);
  private readonly authService = inject(AuthService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly now = new Date();
  readonly maxDate = toDateInputValue(this.now);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    type: ['', Validators.required],
    date: [toDateInputValue(this.now), Validators.required],
    // Date reasonably defaults to today (it's genuinely "now"), but time and tiredness start empty
    // (placeholder-only) rather than pre-filled with a value the user never actually confirmed.
    time: ['', Validators.required],
    hours: [0],
    minutes: [30],
    calories: [null as number | null],
    tiredness: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10)]],
    notes: [''],
  });

  get f() {
    return this.form.controls;
  }

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly durationMinutes = computed(() => {
    const value = this.formValue();
    return Math.max(0, (Number(value.hours) || 0) * 60 + (Number(value.minutes) || 0));
  });

  /** Live intensity preview (server recomputes authoritatively on save). */
  readonly intensity = computed(() => {
    const value = this.formValue();
    const gender = this.authService.user()?.gender ?? 'Male';
    if (!value.type || this.durationMinutes() <= 0) {
      return null;
    }
    return calculateIntensity(value.type as WorkoutType, this.durationMinutes(), gender);
  });

  /** Live preview icon next to the type select, reflecting whatever is currently chosen. */
  readonly selectedType = computed(() => {
    const type = this.formValue().type;
    return type ? (type as WorkoutType) : null;
  });

  /** Workout types sorted by their localized label, with "Other" always pinned last as a catch-all. */
  readonly types = computed(() => {
    const lang = this.language.lang();
    return WORKOUT_TYPES.map((type) => ({ value: type, label: this.translate.instant(`workoutType.${type}`) })).sort((a, b) => {
      if (a.value === 'Other') return 1;
      if (b.value === 'Other') return -1;
      return a.label.localeCompare(b.label, lang);
    });
  });

  async cancel(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: this.translate.instant('workout.discardTitle'),
      message: this.translate.instant('workout.discardMessage'),
      confirmText: this.translate.instant('common.yes'),
      cancelText: this.translate.instant('common.no'),
      danger: true,
    });
    if (confirmed) {
      this.router.navigate(['/home']);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.durationMinutes() <= 0) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const performedAt = `${value.date}T${value.time}:00`;
    if (new Date(performedAt).getTime() > Date.now() + 60_000) {
      this.toast.error(this.translate.instant('workout.futureError'));
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: this.translate.instant('workout.saveTitle'),
      message: this.translate.instant('workout.saveMessage'),
      confirmText: this.translate.instant('common.yes'),
      cancelText: this.translate.instant('common.no'),
    });
    if (!confirmed) {
      return;
    }

    this.submitting.set(true);
    this.workoutService
      .create({
        type: value.type as WorkoutType,
        performedAt,
        durationMinutes: this.durationMinutes(),
        calories: value.calories ?? null,
        tiredness: value.tiredness!, // guaranteed non-null: Validators.required passed the invalid check above
        notes: value.notes.trim() || null,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('workout.saved'));
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.toast.error(error?.error?.detail ?? this.translate.instant('common.error'));
          this.submitting.set(false);
        },
      });
  }
}
