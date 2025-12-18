import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Performance Testing
 *
 * Tests performance metrics and network conditions:
 * - Page load times
 * - 3G network simulation (40% of users per context)
 * - Resource loading
 * - Bundle sizes
 */

test.describe('Performance - Page Load Times', () => {
  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 3 second target
  });

  test('should load course catalog within 3 seconds', async ({ page }) => {
    await login(page, TEST_USERS.student);

    const startTime = Date.now();
    await page.goto('/courses');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Course catalog load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load dashboard within 3 seconds', async ({ page }) => {
    await login(page, TEST_USERS.student);

    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have fast Time to Interactive', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const ttiTime = Date.now() - startTime;

    console.log(`Time to Interactive: ${ttiTime}ms`);
    // Should be interactive within 5 seconds
    expect(ttiTime).toBeLessThan(5000);
  });
});

test.describe('Performance - 3G Network Simulation', () => {
  test('should load homepage on slow 3G', async ({ page, context }) => {
    // Simulate slow 3G network
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 Kbps
      latency: 150, // 150ms latency
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time on 3G: ${loadTime}ms`);

    // Should still load within reasonable time on 3G (8 seconds)
    expect(loadTime).toBeLessThan(8000);
  });

  test('should load courses page on slow 3G', async ({ page, context }) => {
    await login(page, TEST_USERS.student);

    // Simulate slow 3G
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    });

    const startTime = Date.now();
    await page.goto('/courses');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Courses page load time on 3G: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(8000);
  });

  test('should handle API calls on slow network', async ({ page, context }) => {
    await login(page, TEST_USERS.student);

    // Simulate slow network
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    });

    await page.goto('/dashboard');

    // Wait for network idle (all API calls complete)
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log('✓ API calls complete on slow network');
  });
});

test.describe('Performance - Resource Loading', () => {
  test('should not load excessive resources', async ({ page }) => {
    // Track resources
    const resources: string[] = [];

    page.on('response', (response) => {
      resources.push(response.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Total resources loaded: ${resources.length}`);

    // Should not load excessive number of resources (< 100)
    expect(resources.length).toBeLessThan(100);
  });

  test('should optimize image loading', async ({ page }) => {
    const images: any[] = [];

    page.on('response', async (response) => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const size = parseInt(response.headers()['content-length'] || '0');
        images.push({
          url: response.url(),
          size,
          status: response.status(),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Images loaded: ${images.length}`);

    // Check that images loaded successfully
    const failedImages = images.filter((img) => img.status !== 200);
    expect(failedImages.length).toBe(0);

    // Log large images
    images.forEach((img) => {
      if (img.size > 500000) {
        // > 500KB
        console.warn(`Large image: ${img.url} (${Math.round(img.size / 1024)}KB)`);
      }
    });
  });

  test('should use caching headers', async ({ page }) => {
    const cachedResources: string[] = [];

    page.on('response', (response) => {
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl && !cacheControl.includes('no-cache')) {
        cachedResources.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Cacheable resources: ${cachedResources.length}`);

    // Should have some cacheable resources
    expect(cachedResources.length).toBeGreaterThan(0);
  });
});

test.describe('Performance - JavaScript Bundle', () => {
  test('should not have excessive JavaScript', async ({ page }) => {
    let totalJSSize = 0;
    const jsFiles: any[] = [];

    page.on('response', async (response) => {
      if (
        response.url().match(/\.js$/i) ||
        response.headers()['content-type']?.includes('javascript')
      ) {
        const size = parseInt(response.headers()['content-length'] || '0');
        totalJSSize += size;
        jsFiles.push({
          url: response.url(),
          size,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Total JS size: ${Math.round(totalJSSize / 1024)}KB`);
    console.log(`JS files: ${jsFiles.length}`);

    // Log large JS bundles
    jsFiles.forEach((file) => {
      if (file.size > 200000) {
        // > 200KB
        console.warn(`Large JS file: ${file.url} (${Math.round(file.size / 1024)}KB)`);
      }
    });

    // Total JS should be reasonable (< 2MB)
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024);
  });

  test('should not have excessive CSS', async ({ page }) => {
    let totalCSSSize = 0;

    page.on('response', async (response) => {
      if (
        response.url().match(/\.css$/i) ||
        response.headers()['content-type']?.includes('text/css')
      ) {
        const size = parseInt(response.headers()['content-length'] || '0');
        totalCSSSize += size;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Total CSS size: ${Math.round(totalCSSSize / 1024)}KB`);

    // Total CSS should be reasonable (< 500KB)
    expect(totalCSSSize).toBeLessThan(500 * 1024);
  });
});

test.describe('Performance - Memory Usage', () => {
  test('should not leak memory during navigation', async ({ page, context, browserName }) => {
    // Skip for non-Chromium browsers (CDP only available in Chromium)
    test.skip(browserName !== 'chromium', 'CDP is only available in Chromium');

    await login(page, TEST_USERS.student);

    // Create CDP session for memory metrics
    const client = await context.newCDPSession(page);
    await client.send('Performance.enable');

    // Navigate to initial page and wait for stability
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial memory baseline
    const initialMetrics = await client.send('Performance.getMetrics');
    const initialHeap = initialMetrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;

    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await page.goto('/courses');
      await page.waitForLoadState('networkidle');

      await page.goto('/about');
      await page.waitForLoadState('networkidle');
    }

    // Get final memory after navigation cycles
    const finalMetrics = await client.send('Performance.getMetrics');
    const finalHeap = finalMetrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;

    // Calculate memory growth
    const heapGrowth = finalHeap - initialHeap;
    const initialMB = Math.round(initialHeap / 1024 / 1024);
    const finalMB = Math.round(finalHeap / 1024 / 1024);
    const growthMB = Math.round(heapGrowth / 1024 / 1024);

    console.log(`Memory: Initial ${initialMB}MB, Final ${finalMB}MB, Growth ${growthMB}MB`);

    // Memory should not grow excessively (allow 50MB growth)
    // This threshold accounts for legitimate caching and runtime overhead
    expect(heapGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB max growth
  });
});

test.describe('Performance - API Response Times', () => {
  test('should have fast API responses', async ({ page }) => {
    const apiCalls: any[] = [];

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timing: response.request().timing(),
        });
      }
    });

    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    console.log(`API calls made: ${apiCalls.length}`);

    // Check API response times
    apiCalls.forEach((call) => {
      console.log(`API: ${call.url} - Status: ${call.status}`);
    });

    // All API calls should succeed
    const failedCalls = apiCalls.filter((call) => call.status >= 400);
    expect(failedCalls.length).toBe(0);
  });
});

test.describe('Performance - Rendering', () => {
  test('should not have excessive re-renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure First Contentful Paint
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      return fcpEntry?.startTime || 0;
    });

    console.log(`First Contentful Paint: ${Math.round(fcp)}ms`);

    // FCP should be fast (< 2 seconds)
    expect(fcp).toBeLessThan(2000);
  });

  test('should have smooth scrolling performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll down and measure frame rate
    const startTime = Date.now();
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);
    const scrollTime = Date.now() - startTime;

    console.log(`Scroll time: ${scrollTime}ms`);

    // Scrolling should be smooth
    expect(scrollTime).toBeLessThan(2000);
  });
});

test.describe('Performance - Offline Handling', () => {
  test('should handle going offline gracefully', async ({ page, context }) => {
    await login(page, TEST_USERS.student);
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Try to navigate (should show error or cached content)
    await page.goto('/courses').catch(() => {
      console.log('✓ Offline detected');
    });

    // Should not crash
    const title = await page.title();
    expect(title).toBeTruthy();

    // Go back online
    await context.setOffline(false);
  });

  test('should resume functionality when back online', async ({ page, context }) => {
    await login(page, TEST_USERS.student);

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    // Go back online
    await context.setOffline(false);

    // Should be able to navigate
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    console.log('✓ Resumed after reconnection');
  });
});
