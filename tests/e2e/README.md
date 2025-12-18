# E2E Tests - C4C Campus Platform

Comprehensive end-to-end tests for the C4C Campus Platform using Playwright.

## Overview

This test suite covers critical user workflows across multiple browsers and devices:

- **Student Journey**: Sign up → Browse → Enroll → Watch → Complete
- **Teacher Workflow**: Login → Create course → Manage cohorts → Monitor progress
- **Admin Workflow**: Login → Review applications → Approve → Manage users
- **Cross-Browser**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: iPhone, Android, Tablet responsive testing
- **Performance**: 3G network simulation, load times
- **Accessibility**: WCAG 2.1 AA compliance
- **Error Handling**: Network failures, invalid inputs, edge cases

## Test Structure

```
tests/e2e/
├── fixtures/
│   ├── auth.ts              # Authentication helpers
│   └── test-data.ts         # Test data fixtures
├── helpers/
│   └── db-setup.ts          # Database setup utilities
├── student-journey.spec.ts  # Student workflow tests
├── teacher-workflow.spec.ts # Teacher workflow tests
├── admin-workflow.spec.ts   # Admin workflow tests
├── cross-browser.spec.ts    # Browser compatibility tests
├── mobile-responsive.spec.ts # Mobile responsive tests
├── performance.spec.ts      # Performance & network tests
├── error-scenarios.spec.ts  # Error handling tests
└── accessibility.spec.ts    # Accessibility tests
```

## Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests only
npm run test:e2e:mobile

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Run Specific Test File

```bash
# Run student journey tests only
npx playwright test student-journey

# Run with specific browser
npx playwright test student-journey --project=chromium

# Run specific test
npx playwright test -g "should login successfully"
```

## Test Configuration

Configuration is in `/playwright.config.ts`:

- **Base URL**: http://localhost:4321 (configurable via `PLAYWRIGHT_BASE_URL`)
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Screenshots**: On failure
- **Videos**: Retained on failure
- **Traces**: On first retry

## Environment Variables

Tests require the following environment variables:

```bash
# Supabase (required for auth & data)
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Base URL (optional, defaults to localhost:4321)
PLAYWRIGHT_BASE_URL=http://localhost:4321
```

Create a `.env.test` file or set these in your CI/CD environment.

## Test Users

Tests use predefined test users (see `fixtures/auth.ts`):

- **Student**: `e2e-student@test.c4c.dev`
- **Teacher**: `e2e-teacher@test.c4c.dev`
- **Admin**: `e2e-admin@test.c4c.dev`

**Setup Required**: Create these users in your test database before running tests.

## Test Coverage

### Critical Paths (20+ Tests)

#### Student Journey
- ✓ Authentication (login, logout, session)
- ✓ Course browsing and filtering
- ✓ Course enrollment
- ✓ Course navigation
- ✓ Video playback
- ✓ Progress tracking

#### Teacher Workflow
- ✓ Authentication and access control
- ✓ Course management
- ✓ Course creation and builder
- ✓ Cohort management
- ✓ Student roster
- ✓ Analytics and progress monitoring

#### Admin Workflow
- ✓ Admin authentication
- ✓ Application review and approval
- ✓ User management
- ✓ Course management
- ✓ Statistics dashboard
- ✓ Bulk operations

#### Cross-Browser Compatibility
- ✓ Core functionality (Chromium, Firefox, WebKit)
- ✓ CSS and layout rendering
- ✓ Forms and inputs
- ✓ JavaScript features
- ✓ Video playback support
- ✓ API requests
- ✓ Session management

#### Mobile Responsive
- ✓ Mobile-optimized layout
- ✓ Touch interactions and target sizes
- ✓ Mobile navigation
- ✓ Form handling on mobile
- ✓ Course browsing on mobile
- ✓ Tablet layout
- ✓ Orientation changes

#### Performance
- ✓ Page load times (< 3s target)
- ✓ 3G network simulation (40% of users)
- ✓ Resource optimization
- ✓ JavaScript bundle size
- ✓ Memory usage (leak detection during navigation)
- ✓ API response times
- ✓ Offline handling

#### Error Scenarios
- ✓ Network failures
- ✓ Invalid authentication
- ✓ Form validation
- ✓ 404 pages
- ✓ API errors (500, malformed responses)
- ✓ Browser errors and console logs
- ✓ Storage limits

#### Accessibility (WCAG 2.1 AA)
- ✓ Keyboard navigation (Tab, Enter, Shift+Tab)
- ✓ Focus management and indicators
- ✓ ARIA labels and landmarks
- ✓ Screen reader support
- ✓ Alt text on images
- ✓ Color contrast (4.5:1 ratio)
- ✓ Form accessibility
- ✓ Text resizing (up to 200%)

## CI/CD Integration

Tests run automatically on:
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop`
- **Manual trigger** via GitHub Actions

### GitHub Actions Workflow

See `.github/workflows/e2e-tests.yml`:

- Runs tests on all browsers in parallel
- Uploads test reports and videos
- Retries failed tests automatically
- Reports results in PR checks

### Viewing CI Results

1. Go to **Actions** tab in GitHub
2. Select **E2E Tests** workflow
3. Click on a specific run
4. Download artifacts for detailed reports

## Best Practices

### Writing New Tests

1. **Use fixtures** for authentication and test data
2. **Wait for load states** (`networkidle`, `domcontentloaded`)
3. **Use timeouts sparingly** - prefer waiting for elements
4. **Handle async operations** properly
5. **Clean up test data** in afterEach/afterAll hooks
6. **Use descriptive test names** that explain what's being tested
7. **Group related tests** in describe blocks

Example:

```typescript
import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should do something specific', async ({ page }) => {
    await page.goto('/some-page');
    await page.waitForLoadState('networkidle');

    // Perform actions
    await page.click('button');

    // Assert expected outcome
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Debugging Tests

```bash
# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run in headed mode (watch browser)
npm run test:e2e:headed

# Run specific test
npx playwright test -g "test name" --headed

# Enable verbose logging
DEBUG=pw:api npx playwright test
```

### Visual Debugging

Playwright provides excellent debugging tools:

- **Playwright Inspector**: Step through tests, inspect selectors
- **Trace Viewer**: Time-travel debugging with full context
- **Screenshots**: Automatically captured on failure
- **Videos**: Recorded for failed tests

```bash
# View trace for failed test
npx playwright show-trace test-results/trace.zip
```

## Performance Benchmarks

### Target Metrics

- **Page Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **3G Load Time**: < 8 seconds
- **JavaScript Bundle**: < 2MB
- **CSS Bundle**: < 500KB
- **API Response**: < 1 second

### Monitoring

Performance tests automatically check these metrics and warn if thresholds are exceeded.

## Accessibility Standards

Tests verify **WCAG 2.1 Level AA** compliance:

- **Perceivable**: Alt text, color contrast, text alternatives
- **Operable**: Keyboard navigation, focus management
- **Understandable**: Readable text, predictable navigation
- **Robust**: Valid HTML, ARIA support

## Troubleshooting

### Common Issues

#### Tests timing out
```bash
# Increase timeout in playwright.config.ts
timeout: 90 * 1000, // 90 seconds
```

#### Flaky tests
- Add explicit waits for network/DOM
- Use `page.waitForLoadState('networkidle')`
- Increase actionTimeout if needed

#### Authentication issues
- Verify test users exist in database
- Check environment variables are set
- Verify Supabase credentials

#### Browser installation
```bash
# Reinstall browsers
npx playwright install --with-deps
```

## Contributing

When adding new features:

1. **Write E2E tests first** (TDD approach)
2. **Test happy path** and error scenarios
3. **Cover all browsers** (tests run on all by default)
4. **Test mobile responsive** behavior
5. **Verify accessibility** standards
6. **Document** complex test scenarios

## Resources

- [Playwright Documentation](https://playwright.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [C4C Campus PRD](../../PRD.md)
- [Architecture Docs](../../ARCHITECTURE.md)

## Test Statistics

- **Total Test Suites**: 8
- **Total Tests**: 90+
- **Browsers Tested**: 6 (Desktop + Mobile)
- **Coverage**: Critical user paths
- **Run Time**: ~15-20 minutes (all browsers)

## Support

For issues or questions:
- Check existing test examples
- Review Playwright documentation
- Ask in team chat
- Open an issue on GitHub

---

**Last Updated**: 2025-10-29
**Playwright Version**: 1.56.1
**Node Version**: 20.x
