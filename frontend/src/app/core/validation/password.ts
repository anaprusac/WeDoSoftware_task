import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRule {
  /** i18n key describing the rule. */
  key: string;
  met: boolean;
}

/** Evaluates the password policy (mirrors the backend), returning each rule's state for live UI. */
export function evaluatePasswordRules(value: string): PasswordRule[] {
  const v = value ?? '';
  return [
    { key: 'passwordRules.minLength', met: v.length >= PASSWORD_MIN_LENGTH },
    { key: 'passwordRules.lowercase', met: /[a-z]/.test(v) },
    { key: 'passwordRules.uppercase', met: /[A-Z]/.test(v) },
    { key: 'passwordRules.digit', met: /[0-9]/.test(v) },
    { key: 'passwordRules.symbol', met: /[^a-zA-Z0-9]/.test(v) },
  ];
}

export function isPasswordValid(value: string): boolean {
  return evaluatePasswordRules(value).every((rule) => rule.met);
}

/** Control validator: fails when a non-empty password doesn't meet the policy. */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || isPasswordValid(control.value) ? null : { passwordWeak: true };
}

/** Group validator: fails when two named controls don't match. */
export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(controlName)?.value;
    const matching = group.get(matchingControlName)?.value;
    return value === matching ? null : { passwordsMismatch: true };
  };
}
