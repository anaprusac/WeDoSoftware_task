import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { evaluatePasswordRules } from '../../../core/validation/password';

/** Live checklist of the password policy, updating as the user types. */
@Component({
  selector: 'app-password-rules',
  imports: [TranslatePipe],
  templateUrl: './password-rules.html',
  styleUrl: './password-rules.css',
})
export class PasswordRules {
  readonly value = input<string>('');
  readonly rules = computed(() => evaluatePasswordRules(this.value()));
}
