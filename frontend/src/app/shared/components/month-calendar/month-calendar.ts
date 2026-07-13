import { Component, computed, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { buildMonthCells } from '../../../core/util/calendar';
import { toDateInputValue } from '../../../core/util/format';
import { toIntlLocale } from '../../../core/util/locale';

interface Cell {
  date: string;
  day: number;
  hasWorkout: boolean;
  inHighlightRange: boolean;
  clickable: boolean;
  isToday: boolean;
}

/**
 * Monday-first month grid shared by Statistics (one instance per week, with that week's range
 * highlighted) and Profile (one instance for the whole month) — kept as a single component so the
 * two stay visually identical instead of drifting apart as hand-matched copies.
 */
@Component({
  selector: 'app-month-calendar',
  imports: [],
  templateUrl: './month-calendar.html',
  styleUrl: './month-calendar.css',
})
export class MonthCalendar {
  private readonly language = inject(LanguageService);

  readonly year = input.required<number>();
  readonly month = input.required<number>();
  /** Dates ("yyyy-MM-dd") that have a recorded workout — rendered emphasized and clickable. */
  readonly workoutDays = input<ReadonlySet<string>>(new Set());
  /** Optional inclusive date range to give a subtle background wash (e.g. "this week" in Statistics). */
  readonly highlightStart = input<string | null>(null);
  readonly highlightEnd = input<string | null>(null);
  readonly showWeekdays = input(false);

  readonly daySelected = output<string>();

  private readonly todayStr = toDateInputValue(new Date());

  readonly weekdayLabels = computed(() => {
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { weekday: 'narrow' });
    // 2024-01-01 is a Monday — build Monday-first localized single-letter names.
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 1 + i)));
  });

  readonly cells = computed<(Cell | null)[]>(() => {
    const workoutDays = this.workoutDays();
    const start = this.highlightStart();
    const end = this.highlightEnd();

    return buildMonthCells(this.year(), this.month()).map((cell) => {
      if (!cell) return null;
      const hasWorkout = workoutDays.has(cell.date);
      return {
        ...cell,
        hasWorkout,
        inHighlightRange: !!start && !!end && cell.date >= start && cell.date <= end,
        clickable: hasWorkout && cell.date <= this.todayStr,
        isToday: cell.date === this.todayStr,
      };
    });
  });

  select(cell: Cell): void {
    if (cell.clickable) {
      this.daySelected.emit(cell.date);
    }
  }
}
