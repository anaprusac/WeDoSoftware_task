import { Component, input, model } from '@angular/core';

/** Boolean pill switch (frame 8's "Dark mode" control), distinct from the header's icon-button toggle. */
@Component({
  selector: 'app-toggle-switch',
  imports: [],
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.css',
})
export class ToggleSwitch {
  readonly ariaLabel = input<string>('');
  readonly checked = model.required<boolean>();

  toggle(): void {
    this.checked.set(!this.checked());
  }
}
