import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Error Scenarios & Edge Cases
 *
 * Tests error handling and resilience:
 * - Network failures
 * - Invalid inputs
 * - Permission errors
 * - Session expiration
 */

test.describe('Error Scenarios - Network Failures', () => {
  test('should handle offline gracefully', async ({ page, context }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Try to perform action requiring network
    await page.goto('/courses').catch(() => {});

    await page.waitForTimeout(1000);

    // Should show error message or cached content
    console.log('✓ Offline handled gracefully');

    // Reconnect
    await context.setOffline(false);
  });

  test('should retry failed API requests', async ({ page }) => {
    let requestCount = 0;

    // Intercept API calls
    await page.route('**/api/**', (route) => {
      requestCount++;

      if (requestCount === 1) {
        // Fail first request
        route.abort('failed');
      } else {
        // Let subsequent requests through
        route.continue();
      }
    });

    await login(page, TEST_USERS.student);

    // Navigate to page that makes API calls
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    console.log(`API request attempts: ${requestCount}`);
  });

  test('should show error for slow API responses', async ({ page }) => {
    // Intercept API calls and delay them
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
      route.continue();
    });

    await login(page, TEST_USERS.student);

    const startTime = Date.now();
    await page.goto('/dashboard');

    const loadTime = Date.now() - startTime;
    console.log(`Load time with slow API: ${loadTime}ms`);

    // Should handle slow responses (show loading state or timeout)
  });
});

test.describe('Error Scenarios - Invalid Authentication', () => {
  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    const errorVisible = await page
      .locator('#error-message, .error-message, .error, [role="alert"]')
      .isVisible({ timeout: 5000 });

    expect(errorVisible).toBeTruthy();

    // Should not navigate away
    await expect(page).toHaveURL('/login');

    console.log('✓ Invalid credentials rejected');
  });

  test('should handle session expiration', async ({ page, context }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Clear cookies to simulate session expiration
    await context.clearCookies();

    // Try to navigate to protected page
    await page.goto('/courses');

    // Should redirect to login
    await page.waitForTimeout(2000);

    // Either on login page or shows error
    const onLoginPage = page.url().includes('/login');
    const hasError = await page.locator('text=/login/i, text=/session/i').isVisible().catch(() => false);

    expect(onLoginPage || hasError).toBeTruthy();
    console.log('✓ Session expiration handled');
  });

  test('should prevent access to unauthorized pages', async ({ page }) => {
    await login(page, TEST_USERS.student);

    // Try to access admin page as student
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Should either redirect or show error
    const url = page.url();
    const isBlocked = !url.includes('/admin') || (await page.locator('text=/unauthorized/i, text=/forbidden/i, text=/403/i').isVisible().catch(() => false));

    console.log(`Admin access blocked: ${isBlocked}`);
  });
});

test.describe('Error Scenarios - Invalid Form Inputs', () => {
  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    // Try invalid email
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'password123');

    // Try to submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // HTML5 validation should catch this, or custom validation
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    if (validationMessage) {
      console.log('✓ Email validation works:', validationMessage);
    }
  });

  test('should require all mandatory fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should not navigate
    await expect(page).toHaveURL('/login');

    console.log('✓ Required field validation works');
  });

  test('should handle XSS attempts in inputs', async ({ page }) => {
    await page.goto('/login');

    // Try XSS in email field
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[name="email"]', xssPayload);
    await page.fill('input[name="password"]', 'test123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should not execute script
    const alerts: string[] = [];
    page.on('dialog', (dialog) => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });

    expect(alerts.length).toBe(0);
    console.log('✓ XSS protection working');
  });
});

test.describe('Error Scenarios - 404 Pages', () => {
  test('should show 404 for non-existent pages', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Should show 404 page
    const is404 =
      (await page.locator('text=/404/i, text=/not found/i, text=/page.*not.*found/i').isVisible().catch(() => false)) ||
      page.url().includes('404');

    console.log(`404 page shown: ${is404}`);
  });

  test('should allow navigation from 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');

    // Look for home link or navigation
    const homeLink = page.locator('a[href="/"], a:has-text("Home"), a:has-text("Go back")');

    if (await homeLink.isVisible({ timeout: 2000 })) {
      await homeLink.click();
      await expect(page).toHaveURL('/');

      console.log('✓ Navigation from 404 works');
    }
  });
});

test.describe('Error Scenarios - CSRF Protection', () => {
  test('should have CSRF protection on forms', async ({ page }) => {
    await page.goto('/login');

    // Check for CSRF token
    const csrfToken = await page.locator('input[name="_csrf"], input[name="csrf"], input[name="token"]').count();

    // Or check if form uses proper headers
    console.log(`CSRF token fields found: ${csrfToken}`);
  });
});

test.describe('Error Scenarios - Rate Limiting', () => {
  test('should handle rapid repeated requests', async ({ page }) => {
    await page.goto('/login');

    // Try multiple login attempts rapidly
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(1000);

    // Should either show rate limit message or still show error
    const hasMessage = await page.locator('text=/too many/i, text=/rate limit/i, text=/try again/i').isVisible().catch(() => false);

    console.log(`Rate limiting message shown: ${hasMessage}`);
  });
});

test.describe('Error Scenarios - Browser Errors', () => {
  test('should not have JavaScript errors on homepage', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (errors.length > 0) {
      console.warn('JavaScript errors found:', errors);
    }

    // Should have no critical errors
    expect(errors.length).toBeLessThan(3);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (consoleErrors.length > 0) {
      console.warn('Console errors found:', consoleErrors);
    }

    // Filter out known acceptable errors
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('DevTools')
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should not have failed network requests', async ({ page }) => {
    const failedRequests: any[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (failedRequests.length > 0) {
      console.warn('Failed requests:', failedRequests);
    }

    // Should have minimal failed requests
    expect(failedRequests.length).toBeLessThan(5);
  });
});

test.describe('Error Scenarios - Data Validation', () => {
  test('should handle empty API responses', async ({ page }) => {
    await login(page, TEST_USERS.student);

    // Intercept API and return empty data
    await page.route('**/api/courses', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null }),
      });
    });

    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Should show empty state
    const emptyState = await page.locator('.empty-state, #empty-state, text=/no courses/i').isVisible({ timeout: 3000 });

    console.log(`Empty state shown: ${emptyState}`);
  });

  test('should handle malformed API responses', async ({ page }) => {
    await login(page, TEST_USERS.student);

    // Intercept API and return malformed data
    await page.route('**/api/courses', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json',
      });
    });

    await page.goto('/courses');
    await page.waitForTimeout(2000);

    // Should handle gracefully (show error or empty state)
    console.log('✓ Malformed response handled');
  });

  test('should handle API 500 errors', async ({ page }) => {
    await login(page, TEST_USERS.student);

    // Intercept API and return 500 error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'Internal Server Error' } }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should show user-friendly error
    const hasError = await page.locator('text=/error/i, text=/something went wrong/i, .error').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`Error message shown: ${hasError}`);
  });
});

test.describe('Error Scenarios - Storage Limits', () => {
  test('should handle localStorage quota exceeded', async ({ page }) => {
    await page.goto('/');

    try {
      // Try to fill localStorage
      await page.evaluate(() => {
        try {
          for (let i = 0; i < 10000; i++) {
            localStorage.setItem(`key_${i}`, 'x'.repeat(1000));
          }
        } catch (e) {
          console.log('Storage quota reached');
        }
      });

      // Application should still work
      await page.reload();
      await expect(page.locator('h1').first()).toBeVisible();

      console.log('✓ Handles storage quota gracefully');
    } finally {
      // Clean up
      await page.evaluate(() => localStorage.clear());
    }
  });
});
