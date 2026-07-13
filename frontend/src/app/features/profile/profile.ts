import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkoutService } from '../../core/services/workout.service';
import { formatDuration } from '../../core/util/format';
import { InfoTooltip } from '../../shared/components/info-tooltip/info-tooltip';
import { MonthCalendar } from '../../shared/components/month-calendar/month-calendar';
import { ChangePasswordModal } from './change-password-modal/change-password-modal';

/** Profile page (frame 8): auto-saving height/weight (+ live BMI) and a snapshot of this month's activity. */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TranslatePipe, DecimalPipe, RouterLink, InfoTooltip, ChangePasswordModal, MonthCalendar],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly workoutService = inject(WorkoutService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly changePasswordOpen = signal(false);

  readonly heightUnit = signal<'cm' | 'in'>('cm');
  readonly weightUnit = signal<'kg' | 'lb'>('kg');

  readonly form = this.fb.nonNullable.group({
    height: [this.initialHeight()],
    weight: [this.initialWeight()],
  });

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly heightForDisplay = computed(() => this.formValue().height);
  readonly weightForDisplay = computed(() => this.formValue().weight);

  readonly monthSummary = signal<{ count: number; durationLabel: string } | null>(null);
  readonly monthWorkoutDays = signal<ReadonlySet<string>>(new Set());
  readonly currentYear = new Date().getFullYear();
  readonly currentMonth = new Date().getMonth() + 1;

  // Tracks what was last confirmed saved so the debounced watcher below can tell which of the two
  // fields actually changed (to fire the right one of the four distinct toasts the user asked for,
  // instead of one blanket "profile updated").
  private lastSaved = { height: this.initialHeight(), weight: this.initialWeight() };

  constructor() {
    const user = this.user();
    if (user?.preferredUnitSystem === 'Imperial') {
      this.heightUnit.set('in');
      this.weightUnit.set('lb');
    }

    this.form.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged((a, b) => a.height === b.height && a.weight === b.weight),
      )
      .subscribe(() => this.saveMeasurements());

    this.loadMonthSummary();
  }

  toggleHeightUnit(): void {
    const current = this.form.getRawValue().height;
    const converted = this.heightUnit() === 'cm' ? Math.round(current / 2.54) : Math.round(current * 2.54);
    this.heightUnit.set(this.heightUnit() === 'cm' ? 'in' : 'cm');
    this.form.patchValue({ height: converted }, { emitEvent: false });
    this.persist(['profile.heightUnitUpdated']);
  }

  toggleWeightUnit(): void {
    const current = this.form.getRawValue().weight;
    const converted = this.weightUnit() === 'kg' ? Math.round(current * 2.20462) : Math.round(current / 2.20462);
    this.weightUnit.set(this.weightUnit() === 'kg' ? 'lb' : 'kg');
    this.form.patchValue({ weight: converted }, { emitEvent: false });
    this.persist(['profile.weightUnitUpdated']);
  }

  private saveMeasurements(): void {
    const value = this.form.getRawValue();
    const toastKeys: string[] = [];
    if (value.height !== this.lastSaved.height) toastKeys.push('profile.heightUpdated');
    if (value.weight !== this.lastSaved.weight) toastKeys.push('profile.weightUpdated');
    if (toastKeys.length > 0) {
      this.persist(toastKeys);
    }
  }

  private persist(toastKeys: string[]): void {
    const user = this.user();
    if (!user) {
      return;
    }

    const value = this.form.getRawValue();
    const heightCm = this.heightUnit() === 'cm' ? value.height : Math.round(value.height * 2.54);
    const weightKg = this.weightUnit() === 'kg' ? value.weight : Math.round(value.weight / 2.20462);

    this.profileService
      .update({
        heightCm,
        weightKg,
        preferredLanguage: user.preferredLanguage,
        themePreference: user.themePreference,
        preferredUnitSystem: this.heightUnit() === 'cm' ? 'Metric' : 'Imperial',
      })
      .subscribe((updated) => {
        this.authService.setUser(updated);
        this.lastSaved = { height: value.height, weight: value.weight };
        for (const key of toastKeys) {
          this.toast.success(this.translate.instant(key));
        }
      });
  }

  goToDay(date: string): void {
    this.router.navigate(['/workouts/date', date]);
  }

  private loadMonthSummary(): void {
    this.statisticsService.getMonthly(this.currentYear, this.currentMonth).subscribe((data) => {
      const count = data.weeks.reduce((sum, week) => sum + week.workoutCount, 0);
      const minutes = data.weeks.reduce((sum, week) => sum + week.totalDurationMinutes, 0);
      this.monthSummary.set({ count, durationLabel: formatDuration(minutes) });
    });
    this.workoutService.getCalendarDays(this.currentYear, this.currentMonth).subscribe((days) => {
      this.monthWorkoutDays.set(new Set(days));
    });
  }

  private initialHeight(): number {
    const user = this.user();
    if (!user) return 175;
    return user.preferredUnitSystem === 'Imperial' ? Math.round(user.heightCm / 2.54) : user.heightCm;
  }

  private initialWeight(): number {
    const user = this.user();
    if (!user) return 75;
    return user.preferredUnitSystem === 'Imperial' ? Math.round(user.weightKg * 2.20462) : user.weightKg;
  }
}
