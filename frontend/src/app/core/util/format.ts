const pad = (value: number): string => String(value).padStart(2, '0');

/** Local Date -> "yyyy-MM-dd" for date inputs and route params. */
export const toDateInputValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Local Date -> "HH:mm" for time inputs. */
export const toTimeInputValue = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Naive ISO datetime -> "dd.mm.yyyy." (parsed as local wall-clock). */
export const formatDateFromIso = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`;
};

/** Naive ISO datetime -> "HH:mm". */
export const formatClockFromIso = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "yyyy-MM-dd" -> "dd.mm.yyyy." (string split to avoid UTC parsing of date-only strings). */
export const formatDateOnly = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}.`;
};

/** Naive ISO datetime -> "yyyy-MM-dd" (the local date it falls on). */
export const dateOnlyFromIso = (iso: string): string => toDateInputValue(new Date(iso));

/** Minutes -> "Xh YYmin". */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${pad(mins)}min`;
};
