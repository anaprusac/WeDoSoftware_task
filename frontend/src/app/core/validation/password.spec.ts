import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { evaluatePasswordRules, isPasswordValid, matchValidator, passwordStrengthValidator } from './password';

describe('password', () => {
  it('evaluatePasswordRules flags each unmet rule independently', () => {
    const rules = evaluatePasswordRules('short');
    const byKey = Object.fromEntries(rules.map((r) => [r.key, r.met]));
    expect(byKey['passwordRules.minLength']).toBe(false);
    expect(byKey['passwordRules.lowercase']).toBe(true);
    expect(byKey['passwordRules.uppercase']).toBe(false);
    expect(byKey['passwordRules.digit']).toBe(false);
    expect(byKey['passwordRules.symbol']).toBe(false);
  });

  it('isPasswordValid requires every rule to pass', () => {
    expect(isPasswordValid('weak')).toBe(false);
    expect(isPasswordValid('StrongP1!')).toBe(true);
  });

  it('passwordStrengthValidator passes a strong password', () => {
    const control = new FormControl('StrongP1!');
    expect(passwordStrengthValidator()(control)).toBeNull();
  });

  it('passwordStrengthValidator fails a weak password', () => {
    const control = new FormControl('weak');
    expect(passwordStrengthValidator()(control)).toEqual({ passwordWeak: true });
  });

  it('passwordStrengthValidator allows an empty value (let "required" own that case)', () => {
    const control = new FormControl('');
    expect(passwordStrengthValidator()(control)).toBeNull();
  });

  it('matchValidator passes when both controls are equal', () => {
    const group = new FormGroup({
      password: new FormControl('StrongP1!'),
      repeatPassword: new FormControl('StrongP1!'),
    });
    expect(matchValidator('password', 'repeatPassword')(group)).toBeNull();
  });

  it('matchValidator fails when the controls differ', () => {
    const group = new FormGroup({
      password: new FormControl('StrongP1!'),
      repeatPassword: new FormControl('Different1!'),
    });
    expect(matchValidator('password', 'repeatPassword')(group)).toEqual({ passwordsMismatch: true });
  });
});
