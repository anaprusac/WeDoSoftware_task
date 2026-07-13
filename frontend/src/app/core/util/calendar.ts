const pad = (value: number): string => String(value).padStart(2, '0');

export interface MonthDayCell {
  date: string; // yyyy-MM-dd
  day: number;
}

/** Monday-first day grid for a given month (1-12): leading `null`s pad out to the first weekday. */
export function buildMonthCells(year: number, month: number): (MonthDayCell | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Monday = 0

  const cells: (MonthDayCell | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: `${year}-${pad(month)}-${pad(day)}`, day });
  }
  return cells;
}
