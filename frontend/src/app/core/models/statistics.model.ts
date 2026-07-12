export interface WeeklyStat {
  weekStart: string;
  weekEnd: string;
  workoutCount: number;
  totalDurationMinutes: number;
  averageIntensity: number;
  averageTiredness: number;
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  weeks: WeeklyStat[];
}
