import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { WorkoutService } from '../../core/services/workout.service';
import { MonthlyStatistics } from '../../core/models/statistics.model';
import { formatDateOnly, formatDuration } from '../../core/util/format';
import { toIntlLocale } from '../../core/util/locale';
import { MonthCalendar } from '../../shared/components/month-calendar/month-calendar';

const YEARS_BACK = 5;

/** Monthly statistics page (frame 10): weekly breakdown, month/year restricted to the past. */
@Component({
  selector: 'app-statistics',
  imports: [TranslatePipe, MonthCalendar],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  private readonly statisticsService = inject(StatisticsService);
  private readonly workoutService = inject(WorkoutService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly today = new Date();
  private readonly currentYear = this.today.getFullYear();
  private readonly currentMonth = this.today.getMonth() + 1;

  readonly year = signal(this.currentYear);
  readonly month = signal(this.currentMonth);
  readonly data = signal<MonthlyStatistics | null>(null);
  readonly loaded = signal(false);
  readonly workoutDays = signal<ReadonlySet<string>>(new Set());

  readonly years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => this.currentYear - i);

  readonly months = computed(() => {
    const maxMonth = this.year() === this.currentYear ? this.currentMonth : 12;
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { month: 'long' });
    return Array.from({ length: maxMonth }, (_, i) => ({ value: i + 1, label: format.format(new Date(2024, i, 1)) }));
  });

  /** Matches the year select's range — paging further back than that would land somewhere the
   * dropdown itself can't reach. */
  readonly canGoPrev = computed(() => this.year() > this.currentYear - YEARS_BACK);
  readonly canGoNext = computed(
    () => this.year() < this.currentYear || (this.year() === this.currentYear && this.month() < this.currentMonth),
  );

  constructor() {
    this.load();
  }

  prevMonth(): void {
    if (!this.canGoPrev()) {
      return;
    }
    if (this.month() === 1) {
      this.month.set(12);
      this.year.update((y) => y - 1);
    } else {
      this.month.update((m) => m - 1);
    }
    this.load();
  }

  nextMonth(): void {
    if (!this.canGoNext()) {
      return;
    }
    if (this.month() === 12) {
      this.month.set(1);
      this.year.update((y) => y + 1);
    } else {
      this.month.update((m) => m + 1);
    }
    this.load();
  }

  onYearChange(value: string): void {
    const newYear = Number(value);
    this.year.set(newYear);
    if (newYear === this.currentYear && this.month() > this.currentMonth) {
      this.month.set(this.currentMonth);
    }
    this.load();
  }

  onMonthChange(value: string): void {
    this.month.set(Number(value));
    this.load();
  }

  weekRangeLabel(weekStart: string, weekEnd: string): string {
    return `${this.translate.instant('statistics.weekFrom')} ${formatDateOnly(weekStart)} ${this.translate.instant('statistics.to')} ${formatDateOnly(weekEnd)}`;
  }

  duration(minutes: number): string {
    return formatDuration(minutes);
  }

  goToDay(date: string): void {
    this.router.navigate(['/workouts/date', date]);
  }

  /** Scopes the month's workout days down to just this one week, so a card's mini calendar only
   * distinguishes "workout day" vs "no workout" within the week it's actually about. */
  workoutDaysInWeek(start: string, end: string): ReadonlySet<string> {
    const inWeek = new Set<string>();
    for (const date of this.workoutDays()) {
      if (date >= start && date <= end) {
        inWeek.add(date);
      }
    }
    return inWeek;
  }

  private load(): void {
    this.loaded.set(false);
    this.statisticsService.getMonthly(this.year(), this.month()).subscribe((data) => {
      this.data.set(data);
      this.loaded.set(true);
    });
    this.workoutService.getCalendarDays(this.year(), this.month()).subscribe((days) => {
      this.workoutDays.set(new Set(days));
    });
  }
}
