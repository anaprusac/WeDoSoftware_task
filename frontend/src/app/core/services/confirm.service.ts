import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/** Promise-based confirmation dialog (replaces native confirm). Rendered by ConfirmDialogComponent. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => this.state.set({ ...options, resolve }));
  }

  respond(confirmed: boolean): void {
    const current = this.state();
    if (current) {
      current.resolve(confirmed);
      this.state.set(null);
    }
  }
}
