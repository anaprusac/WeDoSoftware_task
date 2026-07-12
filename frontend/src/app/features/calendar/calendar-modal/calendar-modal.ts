import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { toDateInputValue } from '../../../core/util/format';
import { toIntlLocale } from '../../../core/util/locale';
import { Modal } from '../../../shared/components/modal/modal';

const pad = (value: number): string => String(value).padStart(2, '0');

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
  readonly year = signal(this.today.getFullYear());
  readonly month = signal(this.today.getMonth() + 1); // 1-12
  private readonly workoutDays = signal<Set<string>>(new Set());

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { month: 'long' }).format(
      new Date(this.year(), this.month() - 1, 1),
    ),
  );

  readonly weekdays = computed(() => {
    // 2024-01-01 is a Monday — build Monday-first localized short names.
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 1 + i)));
  });

  readonly cells = computed<(DayCell | null)[]>(() => {
    const year = this.year();
    const month = this.month();
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Monday = 0
    const days = this.workoutDays();
    const todayStr = toDateInputValue(this.today);

    const cells: (DayCell | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${pad(month)}-${pad(day)}`;
      const hasWorkout = days.has(date);
      cells.push({ date, day, hasWorkout, clickable: hasWorkout && date <= todayStr, isToday: date === todayStr });
    }
    return cells;
  });

  readonly canGoNext = computed(() => {
    const currentYear = this.today.getFullYear();
    const currentMonth = this.today.getMonth() + 1;
    return this.year() < currentYear || (this.year() === currentYear && this.month() < currentMonth);
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
