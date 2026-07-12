import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { InfoTooltip } from '../../shared/components/info-tooltip/info-tooltip';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { ToggleSwitch } from '../../shared/components/toggle-switch/toggle-switch';
import { ChangePasswordModal } from './change-password-modal/change-password-modal';

/** Profile page (frame 8): auto-saving height/weight (+ live BMI), language and dark-mode controls. */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TranslatePipe, DecimalPipe, InfoTooltip, LanguageSwitcher, ToggleSwitch, ChangePasswordModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly user = this.authService.user;
  readonly isDark = this.themeService.isDark;
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
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
    this.persist({ themePreference: this.isDark() ? 'Dark' : 'Light' });
  }

  toggleHeightUnit(): void {
    const current = this.form.getRawValue().height;
    if (this.heightUnit() === 'cm') {
      this.heightUnit.set('in');
      this.form.patchValue({ height: Math.round(current / 2.54) }, { emitEvent: false });
    } else {
      this.heightUnit.set('cm');
      this.form.patchValue({ height: Math.round(current * 2.54) }, { emitEvent: false });
    }
    this.saveMeasurements();
  }

  toggleWeightUnit(): void {
    const current = this.form.getRawValue().weight;
    if (this.weightUnit() === 'kg') {
      this.weightUnit.set('lb');
      this.form.patchValue({ weight: Math.round(current * 2.20462) }, { emitEvent: false });
    } else {
      this.weightUnit.set('kg');
      this.form.patchValue({ weight: Math.round(current / 2.20462) }, { emitEvent: false });
    }
    this.saveMeasurements();
  }

  private saveMeasurements(): void {
    const value = this.form.getRawValue();
    const heightCm = this.heightUnit() === 'cm' ? value.height : Math.round(value.height * 2.54);
    const weightKg = this.weightUnit() === 'kg' ? value.weight : Math.round(value.weight / 2.20462);
    this.persist({
      heightCm,
      weightKg,
      preferredUnitSystem: this.heightUnit() === 'cm' ? 'Metric' : 'Imperial',
    });
  }

  private persist(change: Partial<{
    heightCm: number;
    weightKg: number;
    preferredUnitSystem: 'Metric' | 'Imperial';
    themePreference: 'Light' | 'Dark';
  }>): void {
    const user = this.user();
    if (!user) {
      return;
    }

    this.profileService
      .update({
        heightCm: change.heightCm ?? user.heightCm,
        weightKg: change.weightKg ?? user.weightKg,
        preferredLanguage: user.preferredLanguage,
        themePreference: change.themePreference ?? user.themePreference,
        preferredUnitSystem: change.preferredUnitSystem ?? user.preferredUnitSystem,
      })
      .subscribe((updated) => {
        this.authService.setUser(updated);
        this.toast.success(this.translate.instant('profile.saved'));
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
