import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Placeholder — the full profile page is built in M8. */
@Component({
  selector: 'app-profile',
  imports: [TranslatePipe],
  template: `<h1 class="page-title">{{ 'nav.profile' | translate }}</h1>`,
})
export class Profile {}
