# E2E Test Plan - Playwright Implementation (Phase 8)

**Status:** PLAN ONLY - Implementation deferred to Phase 8
**Framework:** Playwright
**Created:** 2025-01-29

---

## Test Workflows (from PRD)

### Workflow 1: Student Learning Journey

**From PRD W1:** Approved → Auto-enroll → Browse → Watch 7min → Pause → Return → Resume 7:00 → Complete → Progress 8% → Next lesson → 100% complete

**Playwright Test:**
```typescript
test('complete student learning journey', async ({ page }) => {
  // Setup: Student account approved and enrolled
  const studentEmail = 'student@e2etest.com';
  
  // Step 1: Login
  await page.goto('/login');
  await page.fill('[name="email"]', studentEmail);
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
  
  // Step 2: Browse course catalog
  await page.goto('/courses');
  await expect(page.locator('h1')).toContainText('Course Catalog');
  
  // Step 3: Filter by track
  await page.selectOption('[name="track"]', 'animal-advocacy');
  await expect(page.locator('.course-card')).toHaveCount(2); // Filtered
  
  // Step 4: Open course detail
  await page.click('text=n8n Workflow Automation Basics');
  await expect(page).toHaveURL(/\/courses\/n8n-basics/);
  await expect(page.locator('.progress-indicator')).toContainText('0%');
  
  // Step 5: Start first lesson
  await page.click('text=Start Course');
  await expect(page).toHaveURL(/\/courses\/n8n-basics\/lessons\/what-is-n8n/);
  
  // Step 6: Video loads and plays
  const video = page.locator('video');
  await video.waitFor({ state: 'visible', timeout: 5000 }); // <5s per PRD
  
  // Step 7: Watch for 7 minutes (simulate)
  await video.click(); // Play
  await page.waitForTimeout(7 * 60 * 1000); // 7min
  
  // Step 8: Pause video
  await video.click(); // Pause
  await expect(video).not.toHaveAttribute('playing');
  
  // Step 9: Leave page (browser closes, progress saved via auto-save every 10s)
  await page.close();
  
  // Step 10: Return and verify resume
  await page.goto('/login');
  await page.fill('[name="email"]', studentEmail);
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Verify video resumes at 7:00 (420 seconds)
  const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  expect(currentTime).toBeCloseTo(420, -1); // Within 10s
  
  // Step 11: Complete lesson
  await video.click(); // Resume
  await page.waitForFunction(() => {
    const v = document.querySelector('video') as HTMLVideoElement;
    return v.currentTime >= v.duration;
  }, { timeout: 60000 });
  
  // Step 12: Mark complete
  await page.click('button:has-text("Mark Complete")');
  await expect(page.locator('.lesson-status')).toContainText('Complete');
  
  // Step 13: Verify progress updated to 8% (1 of 12 lessons)
  await page.goto('/dashboard');
  await expect(page.locator('.course-progress')).toContainText('8%');
  
  // Step 14: Navigate to next lesson
  await page.click('text=Continue Course');
  await expect(page).toHaveURL(/\/courses\/n8n-basics\/lessons\/installing-n8n/);
  
  // Step 15: Complete all remaining lessons (loop)
  // ... (complete lessons 2-12)
  
  // Step 16: Verify 100% completion
  await page.goto('/dashboard');
  await expect(page.locator('.course-progress')).toContainText('100%');
  await expect(page.locator('.course-status')).toContainText('Completed');
  
  // Screenshot final state
  await page.screenshot({ path: 'tests/e2e/screenshots/student-journey-complete.png' });
});
```

---

### Workflow 2: Teacher Content Creation

**From PRD W2:** Login admin → Create course → Upload thumbnail → Create module → Add lesson → Upload video → Add markdown → Add resource → Reorder → Preview → Publish

**Playwright Test:**
```typescript
test('teacher creates and publishes course', async ({ page }) => {
  // Setup: Teacher account
  const teacherEmail = 'teacher@e2etest.com';
  
  // Step 1: Login as teacher
  await page.goto('/login');
  await page.fill('[name="email"]', teacherEmail);
  await page.fill('[name="password"]', 'TeacherPass123!');
  await page.click('button[type="submit"]');
  
  // Step 2: Navigate to course builder
  await page.goto('/admin/courses/builder');
  await expect(page.locator('h1')).toContainText('Create Course');
  
  // Step 3: Fill course metadata
  await page.fill('[name="name"]', 'E2E Test Course');
  await page.fill('[name="description"]', 'Test course created via E2E');
  await page.selectOption('[name="track"]', 'animal-advocacy');
  await page.selectOption('[name="difficulty"]', 'beginner');
  await page.fill('[name="estimated_hours"]', '5');
  
  // Step 4: Upload thumbnail
  const thumbnailInput = page.locator('input[type="file"][accept="image/*"]');
  await thumbnailInput.setInputFiles('tests/fixtures/images/test-thumbnail.jpg');
  await expect(page.locator('.thumbnail-preview')).toBeVisible();
  
  // Step 5: Create course
  await page.click('button:has-text("Create Course")');
  await expect(page.locator('.success-message')).toContainText('Course created');
  
  // Step 6: Add module
  await page.click('button:has-text("Add Module")');
  await page.fill('[name="module_name"]', 'Introduction');
  await page.fill('[name="module_description"]', 'Getting started');
  await page.click('button:has-text("Save Module")');
  
  // Step 7: Add lesson to module
  await page.click('button:has-text("Add Lesson")');
  await page.fill('[name="lesson_name"]', 'What is Activism?');
  
  // Step 8: Upload video (< 500MB per BOOTCAMP_ARCHITECTURE)
  const videoInput = page.locator('input[type="file"][accept="video/*"]');
  await videoInput.setInputFiles('tests/fixtures/videos/test-lesson.mp4');
  
  // Wait for upload to complete
  await expect(page.locator('.upload-progress')).toContainText('100%');
  await expect(page.locator('.upload-status')).toContainText('Upload complete');
  
  // Step 9: Add markdown content
  await page.fill('textarea[name="text_content"]', '# Lesson Content\n\nThis is test content.');
  
  // Step 10: Add downloadable resource
  await page.click('button:has-text("Add Resource")');
  const resourceInput = page.locator('input[type="file"][name="resource"]');
  await resourceInput.setInputFiles('tests/fixtures/resources/workflow-template.json');
  await expect(page.locator('.resource-item')).toContainText('workflow-template.json');
  
  // Step 11: Save lesson
  await page.click('button:has-text("Save Lesson")');
  
  // Step 12: Reorder lessons (if multiple exist)
  // Drag-drop or up/down buttons
  await page.click('button[aria-label="Move lesson up"]');
  
  // Step 13: Preview course (student view)
  await page.click('button:has-text("Preview")');
  
  // Opens in new tab
  const [previewPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('button:has-text("Preview")'),
  ]);
  
  await expect(previewPage.locator('h1')).toContainText('E2E Test Course');
  await expect(previewPage.locator('.lesson-list')).toContainText('What is Activism?');
  await previewPage.close();
  
  // Step 14: Publish course
  await page.click('button:has-text("Publish")');
  await expect(page.locator('.publish-status')).toContainText('Published');
  
  // Step 15: Verify appears in catalog
  await page.goto('/courses');
  await expect(page.locator('.course-card')).toContainText('E2E Test Course');
  
  // Screenshot final state
  await page.screenshot({ path: 'tests/e2e/screenshots/teacher-course-published.png' });
});
```

---

### Workflow 3: Progress Monitoring (Teacher Analytics)

**From PRD W3:** View analytics → 50 enrolled 30 completed (60%) → Identify 10 stuck Lesson 5 → Improve content → Send encouragement

**Playwright Test:**
```typescript
test('teacher monitors student progress', async ({ page }) => {
  // Login as teacher
  await page.goto('/login');
  await page.fill('[name="email"]', 'teacher@e2etest.com');
  await page.fill('[name="password"]', 'TeacherPass123!');
  await page.click('button[type="submit"]');
  
  // Navigate to analytics dashboard
  await page.goto('/admin/analytics');
  
  // View course completion rates
  await expect(page.locator('.metric-enrolled')).toContainText('50');
  await expect(page.locator('.metric-completed')).toContainText('30');
  await expect(page.locator('.completion-rate')).toContainText('60%');
  
  // Identify dropout points
  await page.click('text=View Dropout Analysis');
  
  // Lesson 5 shows 10 students stuck
  const lesson5Row = page.locator('tr:has-text("Lesson 5")');
  await expect(lesson5Row.locator('.stuck-students')).toContainText('10');
  await expect(lesson5Row.locator('.completion-rate')).toContainText('50%'); // Low
  
  // Click to see stuck students
  await lesson5Row.click();
  await expect(page.locator('.student-list')).toHaveCount(10);
  
  // Send encouragement email
  await page.click('button:has-text("Send Encouragement")');
  await expect(page.locator('.email-sent')).toContainText('Email sent to 10 students');
  
  // Screenshot analytics
  await page.screenshot({ path: 'tests/e2e/screenshots/teacher-analytics.png' });
});
```

---

## Cross-Browser Testing

**Browsers per custom instructions:**

### Chromium (Chrome/Edge)
```typescript
import { chromium } from '@playwright/test';

test.describe('Chromium-specific tests', () => {
  test('video playback on Chrome', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    // ... test video player
    await browser.close();
  });
});
```

### Firefox
```typescript
import { firefox } from '@playwright/test';

test.describe('Firefox-specific tests', () => {
  test('video playback on Firefox', async () => {
    const browser = await firefox.launch();
    const page = await browser.newPage();
    // ... test video player
    await browser.close();
  });
});
```

### WebKit (Safari)
```typescript
import { webkit } from '@playwright/test';

test.describe('WebKit-specific tests', () => {
  test('video playback on Safari', async () => {
    const browser = await webkit.launch();
    const page = await browser.newPage();
    // ... test video player
    await browser.close();
  });
});
```

---

## Mobile Testing (40% students per context.md)

**Mobile viewport (iPhone SE):**
```typescript
test('mobile responsive course catalog', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/courses');
  
  // Course cards stack vertically
  const courseCards = page.locator('.course-card');
  const firstCard = courseCards.first();
  const box = await firstCard.boundingBox();
  
  expect(box?.width).toBeGreaterThan(300); // Full width on mobile
  
  // Touch targets 44×44px minimum (WCAG)
  const button = page.locator('button:has-text("Start Course")');
  const buttonBox = await button.boundingBox();
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
  
  // Screenshot mobile view
  await page.screenshot({ path: 'tests/e2e/screenshots/mobile-catalog.png' });
});

test('mobile video player controls', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Video player responsive
  const video = page.locator('video');
  const videoBox = await video.boundingBox();
  expect(videoBox?.width).toBeLessThanOrEqual(375); // Fits viewport
  
  // Native controls accessible
  await video.click(); // Play
  await expect(video).toHaveAttribute('controls');
  
  // Progress saves on mobile (same 10s interval)
  await page.waitForTimeout(11000);
  await expect(page.locator('.save-indicator')).toContainText('Saved');
});
```

---

## Performance Testing (3G Network)

**From TEST_PLAN.md section 2.4 + BOOTCAMP_ARCHITECTURE lines 96-100:**

**3G Simulation:**
```typescript
test('page loads under 3s on 3G', async ({ page }) => {
  // Throttle network to 3G
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
    latency: 150, // 150ms
  });
  
  const startTime = Date.now();
  await page.goto('/courses');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // <3s per performance target
});

test('video starts under 5s on 3G', async ({ page }) => {
  // 3G throttling
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });
  
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  const video = page.locator('video');
  const startTime = Date.now();
  
  // Wait for video to be playable
  await video.evaluate((v: HTMLVideoElement) => {
    return new Promise((resolve) => {
      v.addEventListener('canplay', resolve, { once: true });
    });
  });
  
  const timeToPlay = Date.now() - startTime;
  expect(timeToPlay).toBeLessThan(5000); // <5s per PRD
});
```

---

## Error Scenario Testing

### Network Failures
```typescript
test('handles offline gracefully', async ({ page }) => {
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Go offline
  await page.context().setOffline(true);
  
  // Progress save fails but doesn't block playback
  const video = page.locator('video');
  await video.click(); // Play
  
  // Error shown but video continues
  await expect(page.locator('.save-error')).toContainText('Connection lost');
  await expect(video).toHaveAttribute('playing');
  
  // Reconnect
  await page.context().setOffline(false);
  
  // Progress resumes saving
  await page.waitForTimeout(11000);
  await expect(page.locator('.save-indicator')).toContainText('Saved');
});
```

### Invalid Authentication
```typescript
test('redirects to login when session expired', async ({ page }) => {
  // Access protected page without session
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Redirected to login
  await expect(page).toHaveURL('/login?returnTo=/courses/n8n-basics/lessons/what-is-n8n');
  await expect(page.locator('.error-message')).toContainText('Please log in');
});

test('prevents access to non-enrolled course', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await page.fill('[name="email"]', 'newstudent@e2etest.com');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  
  // Try to access course not enrolled in
  await page.goto('/courses/advanced-n8n/lessons/intro');
  
  // 403 Forbidden or redirect to enrollment page
  await expect(page.locator('.error-message')).toContainText('You must enroll');
  await expect(page.locator('button:has-text("Enroll Now")')).toBeVisible();
});
```

### Server Errors
```typescript
test('shows user-friendly error on API failure', async ({ page, context }) => {
  // Intercept API and force 500 error
  await page.route('/api/progress/lesson', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ data: null, error: { code: 'INTERNAL_ERROR', message: 'Server error' } }),
    });
  });
  
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Video plays but progress save fails
  const video = page.locator('video');
  await video.click();
  await page.waitForTimeout(11000); // Trigger save
  
  // User-friendly error (not technical stack trace)
  await expect(page.locator('.error-toast')).toContainText('Could not save progress');
  await expect(page.locator('.error-toast')).not.toContainText('500'); // No HTTP codes
  await expect(page.locator('.error-toast')).not.toContainText('stack'); // No stack traces
});
```

---

## Accessibility Testing (WCAG 2.1 AA)

```typescript
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/courses');
  
  // Tab through course cards
  await page.keyboard.press('Tab');
  await expect(page.locator('.course-card:first-child')).toBeFocused();
  
  // Enter key opens course
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/courses\/[^/]+$/);
});

test('screen reader labels present', async ({ page }) => {
  await page.goto('/courses/n8n-basics/lessons/what-is-n8n');
  
  // Video has aria-label
  const video = page.locator('video');
  await expect(video).toHaveAttribute('aria-label', expect.stringContaining('lesson video'));
  
  // Progress bar has accessible label
  const progress = page.locator('.progress-bar');
  await expect(progress).toHaveAttribute('role', 'progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow');
  await expect(progress).toHaveAttribute('aria-valuemax', '100');
});

test('color contrast meets 4.5:1 ratio', async ({ page }) => {
  await page.goto('/courses');
  
  // Check text contrast (requires axe-core or manual verification)
  // Implementation: Use @axe-core/playwright
  // await expect(page).toHaveNoViolations();
});
```

---

## Test Data Setup

### Before All Tests
```typescript
import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  // Seed database with test data
  // - Create test teacher account
  // - Create test student account (approved, enrolled)
  // - Create test course with modules/lessons
  // - Create test progress records
  
  // Note: Use Supabase service role key for seeding
});

test.afterAll(async () => {
  // Cleanup test data
  // - Delete test courses
  // - Delete test users
  // - Delete test enrollments/progress
});
```

---

## Playwright Configuration

**File:** `playwright.config.ts` (created in Phase 8)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['iPhone SE'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Success Criteria for Phase 8

**Before E2E implementation:**
- [ ] All unit tests passing (Phase 7 complete)
- [ ] All component tests passing
- [ ] All integration tests passing
- [ ] Application deployed to staging
- [ ] Test data seeded

**E2E Test Requirements:**
- [ ] All 3 PRD workflows tested (W1, W2, W3)
- [ ] Cross-browser (Chromium, Firefox, WebKit)
- [ ] Mobile responsive (iPhone SE viewport)
- [ ] 3G performance validated (<3s load, <5s video)
- [ ] Error scenarios handled gracefully
- [ ] Accessibility compliance (keyboard, screen reader)
- [ ] Screenshots captured for documentation

**Pass Criteria:**
- All E2E tests GREEN
- No console errors during tests
- Screenshots show correct UI states
- Performance within targets

---

**Last Updated:** 2025-01-29
**Status:** Plan Complete - Ready for Phase 8 Implementation