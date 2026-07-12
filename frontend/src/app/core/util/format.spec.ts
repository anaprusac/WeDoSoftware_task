import { describe, expect, it } from 'vitest';
import {
  dateOnlyFromIso,
  formatClockFromIso,
  formatDateFromIso,
  formatDateOnly,
  formatDuration,
  toDateInputValue,
  toTimeInputValue,
} from './format';

describe('format', () => {
  it('toDateInputValue pads month/day to two digits', () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('toTimeInputValue pads hours/minutes to two digits', () => {
    expect(toTimeInputValue(new Date(2026, 0, 5, 9, 5))).toBe('09:05');
  });

  it('formatDateFromIso renders dd.mm.yyyy. from a naive ISO datetime', () => {
    expect(formatDateFromIso('2026-07-08T18:30:00')).toBe('08.07.2026.');
  });

  it('formatClockFromIso renders HH:mm', () => {
    expect(formatClockFromIso('2026-07-08T06:05:00')).toBe('06:05');
  });

  it('formatDateOnly renders dd.mm.yyyy. from a date-only string without UTC drift', () => {
    expect(formatDateOnly('2026-01-01')).toBe('01.01.2026.');
  });

  it('dateOnlyFromIso extracts the local calendar date', () => {
    expect(dateOnlyFromIso('2026-07-08T23:59:00')).toBe('2026-07-08');
  });

  it.each([
    [0, '0h 00min'],
    [45, '0h 45min'],
    [60, '1h 00min'],
    [125, '2h 05min'],
  ])('formatDuration(%i) === %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
