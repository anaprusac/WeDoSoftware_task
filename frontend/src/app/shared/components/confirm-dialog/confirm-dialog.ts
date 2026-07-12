import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Modal } from '../modal/modal';

/** Renders the active confirmation request from ConfirmService. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, TranslatePipe],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  private readonly confirmService = inject(ConfirmService);
  readonly state = this.confirmService.state;

  respond(confirmed: boolean): void {
    this.confirmService.respond(confirmed);
  }
}
