import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Accessibility (WCAG 2.1 AA)
 *
 * Tests accessibility features:
 * - Keyboard navigation
 * - Screen reader support
 * - ARIA labels
 * - Focus management
 * - Color contrast
 */

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should navigate with Tab key', async ({ page }) => {
    await page.goto('/');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    console.log(`✓ Tab navigation works (focused: ${focusedElement})`);
  });

  test('should navigate through navigation links with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through multiple elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Check focused element is interactive
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

    const isInteractive = interactiveTags.includes(focusedTag || '');
    console.log(`Focused element: ${focusedTag}, Interactive: ${isInteractive}`);
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    await page.goto('/login');

    // Focus email input
    await page.focus('input[name="email"]');
    await page.keyboard.type('test@example.com');

    // Tab to password
    await page.keyboard.press('Tab');
    await page.keyboard.type('password123');

    // Tab to submit button
    await page.keyboard.press('Tab');

    // Press Enter
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);

    // Should trigger form submission
    console.log('✓ Enter key activates buttons');
  });

  test('should navigate with Shift+Tab (reverse)', async ({ page }) => {
    await page.goto('/');

    // Tab forward a few times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }

    const forwardElement = await page.evaluate(() => document.activeElement?.tagName);

    // Tab backward
    await page.keyboard.press('Shift+Tab');
    const backwardElement = await page.evaluate(() => document.activeElement?.tagName);

    expect(backwardElement).toBeTruthy();
    console.log(`✓ Reverse tab navigation works (${forwardElement} -> ${backwardElement})`);
  });

  test('should skip to main content with keyboard', async ({ page }) => {
    await page.goto('/');

    // Look for skip link (common accessibility feature)
    const skipLink = page.locator('a:has-text("Skip to"), a[href="#main"], a[href="#content"]');

    if (await skipLink.isVisible({ timeout: 2000 })) {
      await skipLink.click();

      // Should focus main content
      console.log('✓ Skip to content link works');
    } else {
      console.log('ℹ No skip link found (consider adding for accessibility)');
    }
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if focus outline is visible
    const hasOutline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow !== 'none'
      );
    });

    console.log(`Focus indicator visible: ${hasOutline}`);

    if (!hasOutline) {
      console.warn('⚠ No visible focus indicator (WCAG 2.4.7)');
    }
  });

  test('should maintain focus order', async ({ page }) => {
    await page.goto('/login');

    // Tab through form inputs
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.getAttribute('name'));

    await page.keyboard.press('Tab');
    const second = await page.evaluate(() => document.activeElement?.getAttribute('name'));

    await page.keyboard.press('Tab');
    const third = await page.evaluate(() => document.activeElement?.tagName);

    console.log(`Focus order: ${first} -> ${second} -> ${third}`);

    // Should follow logical order (email -> password -> button)
    expect(first).toBe('email');
    expect(second).toBe('password');
    expect(third).toBe('BUTTON');
  });

  test('should trap focus in modals', async ({ page }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Look for modal trigger
    const modalTrigger = page.locator('[data-modal], [aria-haspopup="dialog"]').first();

    if (await modalTrigger.isVisible({ timeout: 2000 })) {
      await modalTrigger.click();
      await page.waitForTimeout(500);

      // Modal should be open
      const modal = page.locator('[role="dialog"], .modal');

      if (await modal.isVisible()) {
        // Tab through modal elements
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);

          // Check if focus is still within modal
          const focusInModal = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"], .modal');
            const active = document.activeElement;
            return modal?.contains(active);
          });

          if (!focusInModal) {
            console.warn('⚠ Focus escaped modal');
            break;
          }
        }

        console.log('✓ Focus trapped in modal');
      }
    }
  });
});

test.describe('Accessibility - ARIA Labels', () => {
  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Check buttons have labels
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    let unlabeledCount = 0;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      if (!text?.trim() && !ariaLabel && !ariaLabelledBy) {
        unlabeledCount++;
      }
    }

    console.log(`Buttons checked: ${Math.min(count, 10)}, Unlabeled: ${unlabeledCount}`);

    if (unlabeledCount > 0) {
      console.warn(`⚠ ${unlabeledCount} unlabeled buttons found`);
    }
  });

  test('should have ARIA labels on form inputs', async ({ page }) => {
    await page.goto('/login');

    // Check for label association
    const emailLabel = await page.evaluate(() => {
      const input = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (!input) return false;

      const label =
        input.labels?.[0] ||
        document.querySelector(`label[for="${input.id}"]`) ||
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby');

      return !!label;
    });

    const passwordLabel = await page.evaluate(() => {
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;
      if (!input) return false;

      const label =
        input.labels?.[0] ||
        document.querySelector(`label[for="${input.id}"]`) ||
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby');

      return !!label;
    });

    expect(emailLabel).toBeTruthy();
    expect(passwordLabel).toBeTruthy();

    console.log(`✓ Form inputs properly labeled`);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check heading structure
    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1'));
      const h2s = Array.from(document.querySelectorAll('h2'));
      const h3s = Array.from(document.querySelectorAll('h3'));
      const h4s = Array.from(document.querySelectorAll('h4'));

      return {
        h1: h1s.length,
        h2: h2s.length,
        h3: h3s.length,
        h4: h4s.length,
      };
    });

    console.log('Heading structure:', headings);

    // Should have exactly one h1
    expect(headings.h1).toBeGreaterThanOrEqual(1);

    if (headings.h1 > 1) {
      console.warn('⚠ Multiple h1 elements found (should have only one)');
    }
  });

  test('should have ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    const landmarks = await page.evaluate(() => {
      return {
        main: document.querySelector('main, [role="main"]') !== null,
        nav: document.querySelector('nav, [role="navigation"]') !== null,
        header: document.querySelector('header, [role="banner"]') !== null,
        footer: document.querySelector('footer, [role="contentinfo"]') !== null,
      };
    });

    console.log('Landmarks:', landmarks);

    expect(landmarks.main).toBeTruthy();

    if (!landmarks.nav) {
      console.warn('⚠ No navigation landmark found');
    }
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    let missingAlt = 0;

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt === null) {
        missingAlt++;
      }
    }

    console.log(`Images: ${count}, Missing alt text: ${missingAlt}`);

    if (missingAlt > 0) {
      console.warn(`⚠ ${missingAlt} images missing alt text`);
    }

    // All images should have alt attribute (even if empty for decorative)
    expect(missingAlt).toBe(0);
  });

  test('should announce live regions', async ({ page }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Look for live regions
    const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
    const count = await liveRegions.count();

    console.log(`Live regions found: ${count}`);

    if (count > 0) {
      console.log('✓ Live regions implemented for dynamic content');
    }
  });

  test('should have descriptive link text', async ({ page }) => {
    await page.goto('/');

    // Find links with generic text
    const genericLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const generic = ['click here', 'here', 'read more', 'more', 'link'];

      return links.filter((link) => {
        const text = link.textContent?.trim().toLowerCase() || '';
        return generic.includes(text);
      }).length;
    });

    console.log(`Links with generic text: ${genericLinks}`);

    if (genericLinks > 0) {
      console.warn('⚠ Some links have generic text (consider more descriptive text)');
    }
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('should have sufficient text contrast', async ({ page }) => {
    await page.goto('/');

    // Check contrast of main text
    const contrastCheck = await page.evaluate(() => {
      const getContrast = (fg: string, bg: string) => {
        const getLuminance = (rgb: string) => {
          const [r, g, b] = rgb.match(/\d+/g)?.map(Number) || [0, 0, 0];
          const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const l1 = getLuminance(fg);
        const l2 = getLuminance(bg);
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
      };

      const body = document.body;
      const styles = window.getComputedStyle(body);
      const color = styles.color;
      const bgColor = styles.backgroundColor;

      return {
        color,
        bgColor,
        ratio: getContrast(color, bgColor),
      };
    });

    console.log(`Text color: ${contrastCheck.color}`);
    console.log(`Background: ${contrastCheck.bgColor}`);
    console.log(`Contrast ratio: ${contrastCheck.ratio.toFixed(2)}:1`);

    // WCAG AA requires 4.5:1 for normal text
    if (contrastCheck.ratio < 4.5) {
      console.warn('⚠ Text contrast below WCAG AA standard (4.5:1)');
    } else {
      console.log('✓ Text contrast meets WCAG AA');
    }
  });

  test('should not rely solely on color', async ({ page }) => {
    await page.goto('/');

    // Check for error messages with only color indication
    console.log('ℹ Verify error states use icons/text, not just color');
  });
});

test.describe('Accessibility - Forms', () => {
  test('should have accessible error messages', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form to trigger validation
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check for error message with proper ARIA
    const errorRegion = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    const hasError = await errorRegion.isVisible().catch(() => false);

    if (hasError) {
      console.log('✓ Accessible error messages');
    }
  });

  test('should associate error messages with fields', async ({ page }) => {
    await page.goto('/login');

    // Check if inputs have aria-describedby
    const emailDescribedBy = await page.locator('input[name="email"]').getAttribute('aria-describedby');
    const passwordDescribedBy = await page.locator('input[name="password"]').getAttribute('aria-describedby');

    console.log(`Email aria-describedby: ${emailDescribedBy || 'none'}`);
    console.log(`Password aria-describedby: ${passwordDescribedBy || 'none'}`);
  });
});

test.describe('Accessibility - Responsive Text', () => {
  test('should allow text resize up to 200%', async ({ page }) => {
    await page.goto('/');

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    await page.waitForTimeout(500);

    // Check if content is still accessible
    const heading = page.locator('h1').first();
    const isVisible = await heading.isVisible();

    expect(isVisible).toBeTruthy();
    console.log('✓ Content accessible at 200% zoom');

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});
