/**
 * Security Tests
 *
 * Tests for security utilities, rate limiting, input validation,
 * and protection against common vulnerabilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidEmail,
  isValidUUID,
  isValidSlug,
  isValidInteger,
  isValidLength,
  isValidURL,
  sanitizeHTML,
  stripHTML,
  escapeHTML,
  containsSQLInjectionPatterns,
  isStrongPassword,
  validateRequest,
  generateSecureToken,
  maskSensitiveData,
  type ValidationRule
} from '../src/lib/security';

describe('Security: Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Security: UUID Validation', () => {
  it('should validate correct UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isValidUUID('')).toBe(false);
  });
});

describe('Security: Slug Validation', () => {
  it('should validate correct slugs', () => {
    expect(isValidSlug('my-course')).toBe(true);
    expect(isValidSlug('intro-to-programming')).toBe(true);
    expect(isValidSlug('course123')).toBe(true);
  });

  it('should reject invalid slugs', () => {
    expect(isValidSlug('My Course')).toBe(false);
    expect(isValidSlug('course_name')).toBe(false);
    expect(isValidSlug('UPPERCASE')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });
});

describe('Security: Integer Validation', () => {
  it('should validate integers within range', () => {
    expect(isValidInteger(5, 0, 10)).toBe(true);
    expect(isValidInteger(0, 0, 10)).toBe(true);
    expect(isValidInteger(10, 0, 10)).toBe(true);
  });

  it('should reject non-integers', () => {
    expect(isValidInteger(5.5)).toBe(false);
    expect(isValidInteger('5')).toBe(false);
    expect(isValidInteger(null)).toBe(false);
  });

  it('should enforce min/max bounds', () => {
    expect(isValidInteger(-1, 0, 10)).toBe(false);
    expect(isValidInteger(11, 0, 10)).toBe(false);
  });
});

describe('Security: XSS Protection', () => {
  it('should sanitize malicious HTML', () => {
    const malicious = '<script>alert("XSS")</script>';
    expect(sanitizeHTML(malicious)).not.toContain('<script>');
  });

  it('should allow safe HTML tags', () => {
    const safe = '<p>Hello <strong>world</strong></p>';
    const sanitized = sanitizeHTML(safe);
    expect(sanitized).toContain('<p>');
    expect(sanitized).toContain('<strong>');
  });

  it('should strip all HTML when requested', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(stripHTML(html)).toBe('Hello world');
  });

  it('should escape HTML entities', () => {
    const escaped = escapeHTML('<script>');
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');

    // Test ampersand escaping
    const withAmpersand = escapeHTML('Tom & Jerry');
    expect(withAmpersand).toContain('&amp;');

    // Test less than/greater than
    expect(escapeHTML('<div>')).not.toContain('<div>');
  });
});

describe('Security: SQL Injection Detection', () => {
  it('should detect SQL injection patterns', () => {
    expect(containsSQLInjectionPatterns("'; DROP TABLE users;--")).toBe(true);
    expect(containsSQLInjectionPatterns("admin' OR '1'='1")).toBe(true);
    expect(containsSQLInjectionPatterns("UNION SELECT * FROM users")).toBe(true);
  });

  it('should not flag normal input', () => {
    expect(containsSQLInjectionPatterns('normal text')).toBe(false);
    expect(containsSQLInjectionPatterns('test@example.com')).toBe(false);
  });
});

describe('Security: Password Strength', () => {
  it('should validate strong passwords', () => {
    const result = isStrongPassword('MyP@ssw0rd123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject weak passwords', () => {
    const result = isStrongPassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should require minimum length', () => {
    const result = isStrongPassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('8 characters'))).toBe(true);
  });

  it('should require lowercase letters', () => {
    const result = isStrongPassword('NOLOWER123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
  });

  it('should require uppercase letters', () => {
    const result = isStrongPassword('noupper123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  it('should require numbers', () => {
    const result = isStrongPassword('NoNumbers!');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('number'))).toBe(true);
  });

  it('should require special characters', () => {
    const result = isStrongPassword('NoSpecial123');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('special character'))).toBe(true);
  });
});

describe('Security: Request Validation', () => {
  it('should validate required fields', () => {
    const rules: ValidationRule[] = [
      { field: 'email', required: true, type: 'email' },
      { field: 'name', required: true, type: 'string', minLength: 2 }
    ];

    const validData = { email: 'test@example.com', name: 'John Doe' };
    const result = validateRequest(validData, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const rules: ValidationRule[] = [
      { field: 'email', required: true, type: 'email' }
    ];

    const invalidData = {};
    const result = validateRequest(invalidData, rules);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('email is required');
  });

  it('should validate string length', () => {
    const rules: ValidationRule[] = [
      { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 50 }
    ];

    const tooShort = { name: 'A' };
    const resultShort = validateRequest(tooShort, rules);
    expect(resultShort.valid).toBe(false);

    const tooLong = { name: 'A'.repeat(51) };
    const resultLong = validateRequest(tooLong, rules);
    expect(resultLong.valid).toBe(false);
  });

  it('should validate number ranges', () => {
    const rules: ValidationRule[] = [
      { field: 'age', required: true, type: 'number', min: 18, max: 100 }
    ];

    const tooYoung = { age: 17 };
    const resultYoung = validateRequest(tooYoung, rules);
    expect(resultYoung.valid).toBe(false);

    const tooOld = { age: 101 };
    const resultOld = validateRequest(tooOld, rules);
    expect(resultOld.valid).toBe(false);

    const valid = { age: 25 };
    const resultValid = validateRequest(valid, rules);
    expect(resultValid.valid).toBe(true);
  });

  it('should validate patterns', () => {
    const rules: ValidationRule[] = [
      { field: 'username', required: true, type: 'string', pattern: /^[a-z0-9_]+$/ }
    ];

    const invalid = { username: 'Invalid-Username!' };
    const resultInvalid = validateRequest(invalid, rules);
    expect(resultInvalid.valid).toBe(false);

    const valid = { username: 'valid_username123' };
    const resultValid = validateRequest(valid, rules);
    expect(resultValid.valid).toBe(true);
  });
});

describe('Security: Token Generation', () => {
  it('should generate secure tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2); // Should be unique
  });

  it('should generate tokens of specified length', () => {
    const token = generateSecureToken(16);
    expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
  });
});

describe('Security: Sensitive Data Masking', () => {
  it('should mask API keys', () => {
    const apiKey = 'sk_test_1234567890abcdef';
    const masked = maskSensitiveData(apiKey);
    expect(masked).toContain('****');
    expect(masked).not.toContain('1234567890');
  });

  it('should mask short strings completely', () => {
    const short = 'secret';
    expect(maskSensitiveData(short)).toBe('****');
  });
});

describe('Security: URL Validation', () => {
  it('should validate HTTPS URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('https://sub.example.com/path')).toBe(true);
  });

  it('should validate HTTP URLs', () => {
    expect(isValidURL('http://localhost:3000')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidURL('not-a-url')).toBe(false);
    expect(isValidURL('ftp://example.com')).toBe(false);
    expect(isValidURL('')).toBe(false);
  });
});

describe('Security: Length Validation', () => {
  it('should validate string length within bounds', () => {
    expect(isValidLength('test', 2, 10)).toBe(true);
    expect(isValidLength('a', 1, 5)).toBe(true);
  });

  it('should reject strings outside bounds', () => {
    expect(isValidLength('a', 2, 10)).toBe(false);
    expect(isValidLength('too long string', 1, 5)).toBe(false);
  });
});
