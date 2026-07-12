import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { MonthlyStatistics } from '../../core/models/statistics.model';
import { formatDateOnly, formatDuration } from '../../core/util/format';
import { toIntlLocale } from '../../core/util/locale';

const YEARS_BACK = 5;

/** Monthly statistics page (frame 10): weekly breakdown, month/year restricted to the past. */
@Component({
  selector: 'app-statistics',
  imports: [TranslatePipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics {
  private readonly statisticsService = inject(StatisticsService);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  private readonly today = new Date();
  private readonly currentYear = this.today.getFullYear();
  private readonly currentMonth = this.today.getMonth() + 1;

  readonly year = signal(this.currentYear);
  readonly month = signal(this.currentMonth);
  readonly data = signal<MonthlyStatistics | null>(null);
  readonly loaded = signal(false);

  readonly years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => this.currentYear - i);

  readonly months = computed(() => {
    const maxMonth = this.year() === this.currentYear ? this.currentMonth : 12;
    const format = new Intl.DateTimeFormat(toIntlLocale(this.language.lang()), { month: 'long' });
    return Array.from({ length: maxMonth }, (_, i) => ({ value: i + 1, label: format.format(new Date(2024, i, 1)) }));
  });

  constructor() {
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

  private load(): void {
    this.loaded.set(false);
    this.statisticsService.getMonthly(this.year(), this.month()).subscribe((data) => {
      this.data.set(data);
      this.loaded.set(true);
    });
  }
}
