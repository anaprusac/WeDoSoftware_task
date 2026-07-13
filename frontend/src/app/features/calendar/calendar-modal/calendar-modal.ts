import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { buildMonthCells } from '../../../core/util/calendar';
import { toDateInputValue } from '../../../core/util/format';
import { toIntlLocale } from '../../../core/util/locale';
import { Modal } from '../../../shared/components/modal/modal';

const YEARS_BACK = 5;

interface DayCell {
  date: string;
  day: number;
  hasWorkout: boolean;
  clickable: boolean;
  isToday: boolean;
}

/** Calendar popup (frame 6): only days with workouts are selectable; no future; previous months only. */
@Component({
  selector: 'app-calendar-modal',
  imports: [TranslatePipe, Modal],
  templateUrl: './calendar-modal.html',
  styleUrl: './calendar-modal.css',
})
export class CalendarModal {
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  readonly close = output<void>();

  /** Guards against overlapping requests if prev/next is clicked rapidly. */
  readonly loading = signal(false);

  private readonly today = new Date();
  private readonly currentYear = this.today.getFullYear();
  private readonly currentMonth = this.today.getMonth() + 1;

  readonly year = signal(this.currentYear);
  readonly month = signal(this.currentMonth); // 1-12
  private readonly workoutDays = signal<Set<string>>(new Set());

  readonly years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => this.currentYear - i);

  readonly months = computed(() => {
    const maxMonth = this.year() === this.currentYear ? this.currentMonth : 12;
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { month: 'long' });
    return Array.from({ length: maxMonth }, (_, i) => ({ value: i + 1, label: format.format(new Date(2024, i, 1)) }));
  });

  readonly weekdays = computed(() => {
    // 2024-01-01 is a Monday, build Monday-first localized short names.
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 1 + i)));
  });

  readonly cells = computed<(DayCell | null)[]>(() => {
    const days = this.workoutDays();
    const todayStr = toDateInputValue(this.today);

    return buildMonthCells(this.year(), this.month()).map((cell) => {
      if (!cell) return null;
      const hasWorkout = days.has(cell.date);
      return { ...cell, hasWorkout, clickable: hasWorkout && cell.date <= todayStr, isToday: cell.date === todayStr };
    });
  });

  readonly canGoNext = computed(() => {
    return this.year() < this.currentYear || (this.year() === this.currentYear && this.month() < this.currentMonth);
  });

  constructor() {
    this.loadMonth();
  }

  prevMonth(): void {
    if (this.loading()) {
      return;
    }
    if (this.month() === 1) {
      this.month.set(12);
      this.year.update((y) => y - 1);
    } else {
      this.month.update((m) => m - 1);
    }
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.loading() || !this.canGoNext()) {
      return;
    }
    if (this.month() === 12) {
      this.month.set(1);
      this.year.update((y) => y + 1);
    } else {
      this.month.update((m) => m + 1);
    }
    this.loadMonth();
  }

  onMonthChange(value: string): void {
    if (this.loading()) {
      return;
    }
    this.month.set(Number(value));
    this.loadMonth();
  }

  onYearChange(value: string): void {
    if (this.loading()) {
      return;
    }
    const newYear = Number(value);
    this.year.set(newYear);
    if (newYear === this.currentYear && this.month() > this.currentMonth) {
      this.month.set(this.currentMonth);
    }
    this.loadMonth();
  }

  select(cell: DayCell): void {
    if (!cell.clickable) {
      return;
    }
    this.router.navigate(['/workouts/date', cell.date]);
    this.close.emit();
  }

  private loadMonth(): void {
    this.loading.set(true);
    this.workoutService.getCalendarDays(this.year(), this.month()).subscribe((days) => {
      this.workoutDays.set(new Set(days));
      this.loading.set(false);
    });
  }
}
