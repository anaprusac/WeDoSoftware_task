import { Component, computed, input, model } from '@angular/core';

/**
 * Compact numeric picker for age/height/weight. The value can be typed, changed with the mouse wheel
 * (while focused), the arrow keys, or the +/- steppers.
 *
 * The bound value can be `null` (empty, showing `placeholder`) so a field a user hasn't actually
 * touched never gets submitted as if it were a real, confirmed number. Typing is never silently
 * corrected, an out-of-range value stays exactly as typed and is flagged (red border + message) so
 * the user can fix it themselves, rather than having it quietly rewritten to the nearest bound.
 * Only the assisted interactions (mouse wheel, +/- steppers) clamp to [min, max], since those can
 * only ever move one step at a time and clamping there matches a native slider's behaviour.
 */
@Component({
  selector: 'app-wheel-picker',
  imports: [],
  templateUrl: './wheel-picker.html',
  styleUrl: './wheel-picker.css',
})
export class WheelPicker {
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly step = input(1);
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = model.required<number | null>();

  readonly outOfRange = computed(() => {
    const v = this.value();
    return v !== null && (v < this.min() || v > this.max());
  });

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (raw === '') {
      this.value.set(null);
      return;
    }
    const parsed = Number(raw);
    this.value.set(Number.isNaN(parsed) ? null : parsed);
  }

  increment(): void {
    this.value.set(this.clamp(this.currentOrMin() + this.step()));
  }

  decrement(): void {
    this.value.set(this.clamp(this.currentOrMin() - this.step()));
  }

  onWheel(event: WheelEvent): void {
    // Only hijack the wheel while the field is focused, so it never blocks page/modal scrolling.
    if (document.activeElement !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    if (event.deltaY < 0) {
      this.increment();
    } else {
      this.decrement();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  private currentOrMin(): number {
    const v = this.value();
    return v === null || Number.isNaN(v) ? this.min() : v;
  }

  private clamp(value: number): number {
    return Math.min(this.max(), Math.max(this.min(), value));
  }
}
