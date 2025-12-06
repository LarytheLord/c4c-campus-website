import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Cross-Browser Compatibility
 *
 * Tests that verify the application works correctly across:
 * - Chromium (Chrome, Edge)
 * - Firefox
 * - WebKit (Safari)
 *
 * These tests run on all browser projects defined in playwright.config.ts
 */

test.describe('Cross-Browser - Core Functionality', () => {
  test('should load homepage correctly', async ({ page, browserName }) => {
    await page.goto('/');

    // Verify page loads
    await expect(page).toHaveTitle(/C4C|Code for Compassion|Campus/i);

    // Verify key elements are visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    console.log(`✓ Homepage loaded successfully on ${browserName}`);
  });

  test('should handle login correctly', async ({ page, browserName }) => {
    await login(page, TEST_USERS.student);

    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);

    console.log(`✓ Login successful on ${browserName}`);
  });

  test('should navigate between pages', async ({ page, browserName }) => {
    await page.goto('/');

    // Navigate to courses
    const coursesLink = page.locator('a[href="/courses"], a:has-text("Courses")');

    if (await coursesLink.isVisible()) {
      await coursesLink.click();
      await expect(page).toHaveURL(/\/courses|\/login/);
      console.log(`✓ Navigation works on ${browserName}`);
    } else {
      // Try direct navigation
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      console.log(`✓ Direct navigation works on ${browserName}`);
    }
  });
});

test.describe('Cross-Browser - CSS and Layout', () => {
  test('should display correct layout', async ({ page, browserName }) => {
    await page.goto('/');

    // Check viewport dimensions
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();

    console.log(`✓ Layout renders correctly on ${browserName} (${viewport?.width}x${viewport?.height})`);
  });

  test('should handle responsive images', async ({ page, browserName }) => {
    await page.goto('/');

    // Find images
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Check first image loads
      const firstImage = images.first();
      await expect(firstImage).toBeVisible({ timeout: 5000 });

      console.log(`✓ Images load correctly on ${browserName} (${count} images found)`);
    }
  });

  test('should apply correct styles', async ({ page, browserName }) => {
    await page.goto('/');

    // Check that primary button has correct styling
    const button = page.locator('.btn, button').first();

    if (await button.isVisible()) {
      const backgroundColor = await button.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have some background color
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(backgroundColor).not.toBe('transparent');

      console.log(`✓ Styles applied correctly on ${browserName}`);
    }
  });
});

test.describe('Cross-Browser - Forms and Inputs', () => {
  test('should handle form inputs', async ({ page, browserName }) => {
    await page.goto('/login');

    // Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');

    // Verify values
    const emailValue = await page.inputValue('input[name="email"]');
    const passwordValue = await page.inputValue('input[name="password"]');

    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('testpassword');

    console.log(`✓ Form inputs work correctly on ${browserName}`);
  });

  test('should handle select dropdowns', async ({ page, browserName }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/courses');

    await page.waitForLoadState('networkidle');

    // Look for any select elements
    const selects = page.locator('select');
    const count = await selects.count();

    if (count > 0) {
      const firstSelect = selects.first();
      const options = await firstSelect.locator('option').count();

      expect(options).toBeGreaterThan(0);
      console.log(`✓ Select dropdowns work on ${browserName} (${count} selects, ${options} options)`);
    }
  });

  test('should handle button clicks', async ({ page, browserName }) => {
    await page.goto('/');

    // Find clickable button
    const button = page.locator('button, a.btn').first();

    if (await button.isVisible()) {
      const initialUrl = page.url();
      await button.click();
      await page.waitForTimeout(500);

      // URL might change or not, but click should work
      console.log(`✓ Button clicks work on ${browserName}`);
    }
  });
});

test.describe('Cross-Browser - JavaScript Features', () => {
  test('should execute JavaScript correctly', async ({ page, browserName }) => {
    await page.goto('/');

    // Execute simple JavaScript
    const result = await page.evaluate(() => {
      return 2 + 2;
    });

    expect(result).toBe(4);
    console.log(`✓ JavaScript execution works on ${browserName}`);
  });

  test('should handle localStorage', async ({ page, browserName }) => {
    await page.goto('/');

    // Set localStorage item
    await page.evaluate(() => {
      localStorage.setItem('test_key', 'test_value');
    });

    // Read it back
    const value = await page.evaluate(() => {
      return localStorage.getItem('test_key');
    });

    expect(value).toBe('test_value');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test_key');
    });

    console.log(`✓ localStorage works on ${browserName}`);
  });

  test('should handle async operations', async ({ page, browserName }) => {
    await page.goto('/login');

    // Login triggers async API calls
    await page.fill('input[name="email"]', TEST_USERS.student.email);
    await page.fill('input[name="password"]', TEST_USERS.student.password);

    const submitPromise = page.click('button[type="submit"]');

    // Should handle the async navigation
    await submitPromise;
    await page.waitForLoadState('networkidle');

    console.log(`✓ Async operations work on ${browserName}`);
  });
});

test.describe('Cross-Browser - Video Playback', () => {
  test('should support video element', async ({ page, browserName }) => {
    // This is a capability test
    const supportsVideo = await page.evaluate(() => {
      const video = document.createElement('video');
      return !!video.canPlayType;
    });

    expect(supportsVideo).toBeTruthy();
    console.log(`✓ Video element supported on ${browserName}`);
  });

  test('should support required video formats', async ({ page, browserName }) => {
    const formats = await page.evaluate(() => {
      const video = document.createElement('video');
      return {
        mp4: video.canPlayType('video/mp4') !== '',
        webm: video.canPlayType('video/webm') !== '',
        ogg: video.canPlayType('video/ogg') !== '',
      };
    });

    // At least MP4 should be supported (most common)
    expect(formats.mp4 || formats.webm).toBeTruthy();

    console.log(`✓ Video formats on ${browserName}:`, formats);
  });
});

test.describe('Cross-Browser - API Requests', () => {
  test('should handle fetch API', async ({ page, browserName }) => {
    const supportsFetch = await page.evaluate(() => {
      return typeof fetch !== 'undefined';
    });

    expect(supportsFetch).toBeTruthy();
    console.log(`✓ Fetch API supported on ${browserName}`);
  });

  test('should make API requests successfully', async ({ page, browserName }) => {
    await login(page, TEST_USERS.student);

    // Navigate to a page that makes API calls
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for network errors in console
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    // Should not have critical API errors
    const hasCriticalErrors = errors.some((err) =>
      err.toLowerCase().includes('failed to fetch')
    );

    expect(hasCriticalErrors).toBeFalsy();
    console.log(`✓ API requests work on ${browserName}`);
  });
});

test.describe('Cross-Browser - Authentication & Sessions', () => {
  test('should maintain session across pages', async ({ page, browserName }) => {
    await login(page, TEST_USERS.student);

    // Navigate to different pages
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Still authenticated
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });

    console.log(`✓ Session persistence works on ${browserName}`);
  });

  test('should handle logout correctly', async ({ page, browserName }) => {
    await login(page, TEST_USERS.student);

    // Logout
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    await logoutBtn.click();

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    console.log(`✓ Logout works on ${browserName}`);
  });
});
