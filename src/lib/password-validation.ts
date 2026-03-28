import { isStrongPassword } from './security';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const result = isStrongPassword(password);
  return {
    isValid: result.valid,
    errors: result.errors
  };
}
