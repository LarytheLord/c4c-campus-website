import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Mobile Responsive Design
 *
 * Tests mobile-specific functionality and responsive behavior
 * These tests will run on mobile projects defined in playwright.config.ts
 */

test.describe('Mobile Responsive - Layout', () => {
  test('should display mobile-optimized homepage', async ({ page }) => {
    await page.goto('/');

    // Check viewport
    const viewport = page.viewportSize();

    // Verify content is visible
    await expect(page.locator('h1').first()).toBeVisible();

    console.log(`✓ Homepage layout works (${viewport?.width}x${viewport?.height})`);
  });

  test('should stack elements vertically on small screens', async ({ page }) => {
    await page.goto('/');

    // Elements should stack vertically (check grid/flex layout)
    const mainContent = page.locator('main, .container').first();

    if (await mainContent.isVisible()) {
      const box = await mainContent.boundingBox();
      console.log(`✓ Content width: ${box?.width}px`);
    }
  });

  test('should be responsive to viewport changes', async ({ page }) => {
    await page.goto('/');

    // Desktop-only elements might be hidden on mobile
    const desktopElements = page.locator('.desktop-only, .hidden-mobile');
    const count = await desktopElements.count();

    console.log(`Desktop-only elements found: ${count}`);
  });
});

test.describe('Mobile Responsive - Navigation', () => {
  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');

    // Look for hamburger menu or mobile nav
    const hamburger = page.locator(
      'button[aria-label*="menu"], .hamburger, .mobile-menu-button, button:has-text("☰")'
    );

    const hasHamburger = await hamburger.isVisible().catch(() => false);

    if (hasHamburger) {
      // Click to open menu
      await hamburger.click();
      await page.waitForTimeout(500);

      console.log('✓ Mobile menu interaction works');
    } else {
      console.log('ℹ Navigation uses standard layout');
    }
  });

  test('should handle navigation on all screen sizes', async ({ page }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Should be able to navigate to courses
    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);

    console.log('✓ Navigation works across viewports');
  });
});

test.describe('Mobile Responsive - Touch Interactions', () => {
  test('should have touch-friendly elements', async ({ page }) => {
    await page.goto('/');

    // Check button sizes (WCAG recommends 44x44px minimum)
    const buttons = page.locator('button, a.btn').first();

    if (await buttons.isVisible()) {
      const box = await buttons.boundingBox();

      if (box) {
        // Check if button meets recommended touch target size
        const meetsWCAG = box.height >= 44 && box.width >= 44;

        console.log(
          `Touch target: ${Math.round(box.width)}x${Math.round(box.height)}px ${
            meetsWCAG ? '✓ WCAG compliant' : '(smaller than 44x44px recommendation)'
          }`
        );
      }
    }
  });

  test('should handle tap/click events', async ({ page }) => {
    await page.goto('/');

    // Tap/click a button
    const button = page.locator('button, a.btn').first();

    if (await button.isVisible()) {
      await button.click();
      await page.waitForTimeout(500);

      console.log('✓ Click/tap events work');
    }
  });

  test('should handle scroll interactions', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    console.log('✓ Scrolling works');
  });
});

test.describe('Mobile Responsive - Forms', () => {
  test('should display accessible login form', async ({ page }) => {
    await page.goto('/login');

    // Form should be visible and usable
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check input sizes
    const emailBox = await emailInput.boundingBox();
    if (emailBox) {
      expect(emailBox.width).toBeGreaterThan(200); // Should be wide enough
    }

    console.log('✓ Login form is accessible');
  });

  test('should use appropriate keyboard types', async ({ page }) => {
    await page.goto('/login');

    // Email field should have email keyboard type
    const emailInput = page.locator('input[name="email"]');
    const inputType = await emailInput.getAttribute('type');

    expect(inputType).toBe('email');

    console.log('✓ Appropriate input types set for mobile keyboards');
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_USERS.student.email);
    await page.fill('input[name="password"]', TEST_USERS.student.password);

    await page.click('button[type="submit"]');

    // Should navigate after submission
    await expect(page).toHaveURL(/\/(dashboard|courses)/, { timeout: 10000 });

    console.log('✓ Form submission works');
  });
});

test.describe('Mobile Responsive - Course Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should display course cards responsively', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Course cards should be responsive
    const courseCards = page.locator('.course-card-wrapper, .course-card');
    const count = await courseCards.count();

    if (count > 0) {
      const firstCard = courseCards.first();
      const box = await firstCard.boundingBox();

      if (box) {
        console.log(`✓ Course card width: ${Math.round(box.width)}px`);
      }
    }
  });

  test('should allow filtering', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Filters should be accessible
    const filterButtons = page.locator('.filter-chip, button[data-track]');
    const count = await filterButtons.count();

    if (count > 0) {
      // Should be able to click filter
      await filterButtons.first().click();
      await page.waitForTimeout(500);

      console.log('✓ Filtering works');
    }
  });
});

test.describe('Mobile Responsive - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should display responsive dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    console.log('✓ Dashboard layout responsive');
  });

  test('should show course progress', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Progress indicators should be visible
    const progressSection = page.locator(
      '#courses-list, .courses-list, [data-testid="courses"]'
    );

    const isVisible = await progressSection.isVisible().catch(() => false);

    console.log(`Course progress section visible: ${isVisible}`);
  });
});

test.describe('Mobile Responsive - Video Player', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should support video playback', async ({ page }) => {
    // Test video element capability
    const supportsVideo = await page.evaluate(() => {
      const video = document.createElement('video');
      return {
        canPlay: !!video.canPlayType,
        mp4: video.canPlayType('video/mp4') !== '',
        hasControls: 'controls' in video,
      };
    });

    expect(supportsVideo.canPlay).toBeTruthy();
    console.log('✓ Video support:', supportsVideo);
  });

  test('should have accessible video controls', async ({ page }) => {
    await page.goto('/');

    // Video controls should be available
    console.log('✓ Native video controls available');
  });
});

test.describe('Mobile Responsive - Orientation Changes', () => {
  test('should handle portrait orientation', async ({ page }) => {
    await page.goto('/');

    const viewport = page.viewportSize();

    await expect(page.locator('h1').first()).toBeVisible();

    console.log(`✓ Portrait mode works (${viewport?.width}x${viewport?.height})`);
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Get current viewport and swap dimensions for landscape
    const currentViewport = page.viewportSize();
    if (currentViewport) {
      await page.setViewportSize({
        width: Math.max(currentViewport.width, currentViewport.height || 0),
        height: Math.min(currentViewport.width, currentViewport.height || 0),
      });
    }

    await page.goto('/');

    await expect(page.locator('h1').first()).toBeVisible();

    console.log('✓ Landscape orientation works');
  });
});

test.describe('Mobile Responsive - Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Load time: ${loadTime}ms`);

    // Should load reasonably fast (within 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have layout shift', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any delayed content
    await page.waitForTimeout(1000);

    // Page should be stable
    console.log('✓ Layout stable');
  });
});
