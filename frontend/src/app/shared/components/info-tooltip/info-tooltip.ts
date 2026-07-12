import { Component, input } from '@angular/core';

/** An (i) icon that reveals an explanatory tooltip on hover/focus. */
@Component({
  selector: 'app-info-tooltip',
  imports: [],
  templateUrl: './info-tooltip.html',
  styleUrl: './info-tooltip.css',
})
export class InfoTooltip {
  readonly text = input.required<string>();
}
