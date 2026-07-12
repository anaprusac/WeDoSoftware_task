import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

/** Renders the stack of active toasts from the ToastService. */
@Component({
  selector: 'app-toaster',
  imports: [],
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
})
export class Toaster {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
