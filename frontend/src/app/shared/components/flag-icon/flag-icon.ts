import { Component, input } from '@angular/core';

/** Small inline SVG flag for the language switcher (reliable across platforms, unlike emoji flags). */
@Component({
  selector: 'app-flag',
  imports: [],
  templateUrl: './flag-icon.html',
  styleUrl: './flag-icon.css',
})
export class FlagIcon {
  readonly lang = input.required<string>();
}
