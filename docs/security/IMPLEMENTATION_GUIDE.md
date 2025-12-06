# Security Implementation Guide

This guide shows you how to implement security measures in the C4C Campus platform.

## Quick Start

### 1. Apply Security to a New API Endpoint

Use the secure template as a starting point:

```typescript
// src/pages/api/your-endpoint.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { validateRequest, sanitizeHTML, type ValidationRule } from '@/lib/security';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Step 1: Rate Limiting
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.api);
    if (rateLimitResponse) return rateLimitResponse;

    // Step 2: Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL!,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Input Validation
    const body = await request.json();

    const rules: ValidationRule[] = [
      { field: 'title', required: true, type: 'string', maxLength: 200 },
      { field: 'content', required: true, type: 'string', maxLength: 5000 }
    ];

    const validation = validateRequest(body, rules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: XSS Protection
    const safeTitle = sanitizeHTML(body.title, []);
    const safeContent = sanitizeHTML(body.content);

    // Step 5: Database Operation (SQL injection protected via Supabase)
    const { data, error } = await supabase
      .from('your_table')
      .insert([{ user_id: user.id, title: safeTitle, content: safeContent }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 6: Success Response
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## Security Checklist by Feature

### Adding a Public Form

- [ ] Implement rate limiting (use `RateLimitPresets.forms`)
- [ ] Validate all input fields
- [ ] Set maximum length limits
- [ ] Sanitize HTML content
- [ ] Test with XSS payloads
- [ ] Test rate limit enforcement
- [ ] Add error handling

**Example:**
```typescript
// Apply rate limiting
const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
if (rateLimitResponse) return rateLimitResponse;

// Validate input
const rules: ValidationRule[] = [
  { field: 'email', required: true, type: 'email' },
  { field: 'message', required: true, type: 'string', minLength: 10, maxLength: 5000 }
];
const validation = validateRequest(data, rules);
if (!validation.valid) {
  return errorResponse(validation.errors);
}

// Sanitize
const safeMessage = sanitizeHTML(data.message);
```

### Adding User-Generated Content

- [ ] Require authentication
- [ ] Verify user permissions
- [ ] Apply rate limiting
- [ ] Validate input length and format
- [ ] Sanitize HTML (allow only safe tags)
- [ ] Store sanitized version
- [ ] Test XSS attempts
- [ ] Add RLS policies

**Example:**
```typescript
import { sanitizeHTML } from '@/lib/security';

// Allow specific safe tags for rich text
const safeContent = sanitizeHTML(userContent, [
  'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'
]);

// For plain text only
const plainText = sanitizeHTML(userContent, []);
```

### Adding Admin Operations

- [ ] Verify authentication
- [ ] Check admin role from `applications` table
- [ ] Use service role key only when necessary
- [ ] Log admin actions
- [ ] Apply stricter rate limiting
- [ ] Validate all inputs
- [ ] Add audit trail

**Example:**
```typescript
import { checkAdminAccess } from '@/lib/admin-auth';

const { isAdmin, user, error } = await checkAdminAccess(supabase);
if (!isAdmin) {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### Adding File Uploads

- [ ] Validate file type (whitelist allowed extensions)
- [ ] Validate file size (set reasonable limits)
- [ ] Scan for malware (if possible)
- [ ] Generate random filenames (prevent path traversal)
- [ ] Use Supabase Storage (handles security)
- [ ] Apply RLS policies to storage
- [ ] Rate limit uploads aggressively

**Example:**
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
  return errorResponse('Invalid file type');
}

if (file.size > maxSize) {
  return errorResponse('File too large');
}

// Generate secure random filename
const ext = file.name.split('.').pop();
const filename = `${generateSecureToken(16)}.${ext}`;
```

## Rate Limiting Presets

Choose the appropriate preset for your endpoint:

| Preset | Window | Max Requests | Use Case |
|--------|--------|--------------|----------|
| `auth` | 15 min | 5 | Login, registration, password reset |
| `forms` | 1 min | 5 | Contact forms, feedback forms |
| `api` | 1 min | 60 | Standard API operations |
| `read` | 1 min | 120 | GET endpoints, browsing |
| `expensive` | 1 hour | 10 | Video processing, bulk exports |

**Custom Rate Limit:**
```typescript
const customLimit = {
  windowMs: 30 * 60 * 1000, // 30 minutes
  maxRequests: 20
};

const rateLimitResponse = await rateLimit(request, customLimit);
```

## Input Validation Examples

### Email Validation
```typescript
import { isValidEmail } from '@/lib/security';

if (!isValidEmail(email)) {
  return errorResponse('Invalid email address');
}
```

### String Length
```typescript
import { isValidLength } from '@/lib/security';

if (!isValidLength(username, 3, 30)) {
  return errorResponse('Username must be 3-30 characters');
}
```

### Integer Range
```typescript
import { isValidInteger } from '@/lib/security';

if (!isValidInteger(age, 13, 120)) {
  return errorResponse('Age must be between 13 and 120');
}
```

### URL Validation
```typescript
import { isValidURL } from '@/lib/security';

if (!isValidURL(website)) {
  return errorResponse('Invalid URL');
}
```

### Comprehensive Validation
```typescript
import { validateRequest, type ValidationRule } from '@/lib/security';

const rules: ValidationRule[] = [
  { field: 'email', required: true, type: 'email' },
  { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 30 },
  { field: 'age', required: true, type: 'number', min: 13, max: 120 },
  { field: 'website', required: false, type: 'url' },
  {
    field: 'bio',
    required: false,
    type: 'string',
    maxLength: 500,
    custom: (value) => !containsSQLInjectionPatterns(value)
  }
];

const validation = validateRequest(formData, rules);
if (!validation.valid) {
  return new Response(
    JSON.stringify({ error: 'Validation failed', details: validation.errors }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

## XSS Protection Examples

### Allow Safe HTML Tags (for rich text)
```typescript
import { sanitizeHTML } from '@/lib/security';

const safeHTML = sanitizeHTML(userInput, [
  'p', 'br', 'strong', 'em', 'u',
  'h1', 'h2', 'h3',
  'ul', 'ol', 'li',
  'a', 'code', 'pre'
]);
```

### Strip All HTML (plain text only)
```typescript
import { stripHTML } from '@/lib/security';

const plainText = stripHTML(userInput);
```

### Escape for Display
```typescript
import { escapeHTML } from '@/lib/security';

const safe = escapeHTML(userInput);
```

### Test XSS Protection
```typescript
// Test these payloads - all should be sanitized
const xssTests = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<a href="javascript:alert(\'XSS\')">Click</a>',
  '<div onclick="alert(\'XSS\')">Click</div>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>'
];

xssTests.forEach(payload => {
  const safe = sanitizeHTML(payload);
  console.assert(!safe.includes('<script>'), 'XSS blocked');
});
```

## Security Testing

### Run Security Tests
```bash
# All security tests
npm test -- tests/security.test.ts

# Watch mode for development
npm run test:watch

# With coverage
npm run test:coverage
```

### Add Tests for New Features
```typescript
// tests/your-feature.security.test.ts
import { describe, it, expect } from 'vitest';

describe('Your Feature Security', () => {
  it('should block XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>';
    const result = yourSanitizeFunction(malicious);
    expect(result).not.toContain('<script>');
  });

  it('should validate email format', () => {
    expect(yourValidator('invalid-email')).toBe(false);
    expect(yourValidator('valid@email.com')).toBe(true);
  });

  it('should enforce rate limits', async () => {
    // Make multiple requests
    for (let i = 0; i < 6; i++) {
      const response = await yourEndpoint(request);
      if (i < 5) {
        expect(response.status).not.toBe(429);
      } else {
        expect(response.status).toBe(429); // Rate limited
      }
    }
  });
});
```

## Common Pitfalls to Avoid

### ❌ DON'T: String concatenation in queries
```typescript
// DANGEROUS - SQL injection risk
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### ✅ DO: Use Supabase (parameterized queries)
```typescript
// SAFE - parameterized via Supabase
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

### ❌ DON'T: Trust user input
```typescript
// DANGEROUS - XSS risk
element.innerHTML = userInput;
```

### ✅ DO: Sanitize before display
```typescript
// SAFE - sanitized
element.innerHTML = sanitizeHTML(userInput);
// OR
element.textContent = userInput; // Even safer - no HTML
```

### ❌ DON'T: Expose detailed errors
```typescript
// DANGEROUS - information disclosure
return new Response(
  JSON.stringify({ error: error.message, stack: error.stack }),
  { status: 500 }
);
```

### ✅ DO: Log details server-side, return generic message
```typescript
// SAFE
console.error('Detailed error for logs:', error);
return new Response(
  JSON.stringify({ error: 'Internal server error' }),
  { status: 500 }
);
```

### ❌ DON'T: Use service role key on client
```typescript
// DANGEROUS - exposes admin access
const supabase = createClient(url, serviceRoleKey); // In client code
```

### ✅ DO: Use anon key with RLS
```typescript
// SAFE - RLS enforces permissions
const supabase = createClient(url, anonKey);
```

## Production Checklist

Before deploying to production:

- [ ] All API endpoints have rate limiting
- [ ] All user inputs are validated
- [ ] All user content is sanitized
- [ ] Security tests are passing
- [ ] Environment variables are secured
- [ ] Security headers are enabled
- [ ] HTTPS is enforced
- [ ] RLS policies are tested
- [ ] Error messages don't leak information
- [ ] Logging doesn't expose sensitive data
- [ ] Dependencies are up to date
- [ ] Security audit review is complete

## Getting Help

**Security Issues:**
- Email: security@codeforcompassion.com
- DO NOT open public GitHub issues for security vulnerabilities

**Questions:**
- Check [Security Audit Report](./security-audit.md)
- Review [Secure API Template](../../src/pages/api/secure-template.ts)
- See [Security Utilities](../../src/lib/security.ts)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
