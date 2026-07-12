import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Placeholder — the dashboard (add/find workout + cards) is built in M7. */
@Component({
  selector: 'app-home',
  imports: [TranslatePipe],
  template: `<h1 class="page-title">{{ 'nav.home' | translate }}</h1>`,
})
export class Home {}
