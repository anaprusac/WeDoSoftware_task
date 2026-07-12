import { Component, input, model } from '@angular/core';

/**
 * Compact numeric picker for age/height/weight. The value can be typed, changed with the mouse wheel
 * (while focused), the arrow keys, or the +/- steppers — all clamped to [min, max].
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
  readonly value = model.required<number>();

  onInput(event: Event): void {
    const parsed = parseInt((event.target as HTMLInputElement).value, 10);
    if (!Number.isNaN(parsed)) {
      this.value.set(parsed);
    }
  }

  onBlur(event: Event): void {
    const clamped = this.clamp(this.value());
    this.value.set(clamped);
    (event.target as HTMLInputElement).value = String(clamped);
  }

  increment(): void {
    this.value.set(this.clamp(this.value() + this.step()));
  }

  decrement(): void {
    this.value.set(this.clamp(this.value() - this.step()));
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

  private clamp(value: number): number {
    if (Number.isNaN(value)) {
      return this.min();
    }
    return Math.min(this.max(), Math.max(this.min(), value));
  }
}
