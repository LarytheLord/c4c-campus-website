import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for C4C Campus E2E Tests
 *
 * This configuration supports:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Mobile responsive testing (iPhone SE)
 * - CI/CD integration with retries
 * - Screenshot and trace capture on failures
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000, // 60 seconds

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit parallelism in CI

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4321',

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Default timeout for actions
    actionTimeout: 15 * 1000, // 15 seconds

    // Default navigation timeout
    navigationTimeout: 30 * 1000, // 30 seconds
  },

  // Configure projects for different browsers and devices
  projects: [
    // Desktop Browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile Browsers (40% of users per context.md)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Tablet
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Start local dev server before tests (if not already running)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI, // Reuse existing server in local dev
    timeout: 120 * 1000, // 2 minutes to start
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',
});
