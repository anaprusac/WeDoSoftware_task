import { Component, HostListener, input, output } from '@angular/core';

/** Reusable modal shell: dimmed/blurred backdrop + centered panel with projected content. */
@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly title = input<string>();
  readonly showClose = input(true);
  readonly variant = input<'default' | 'auth'>('default');
  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
