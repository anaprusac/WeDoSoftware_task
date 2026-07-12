import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Placeholder — the monthly statistics view is built in M8. */
@Component({
  selector: 'app-statistics',
  imports: [TranslatePipe],
  template: `<h1 class="page-title">{{ 'nav.statistics' | translate }}</h1>`,
})
export class Statistics {}
