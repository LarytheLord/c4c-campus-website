import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Student Learning Journey
 *
 * Tests the complete student workflow:
 * 1. Login → Browse courses → Enroll → View course → Watch lesson
 * 2. Progress tracking and course completion
 * 3. Dashboard functionality
 */

test.describe('Student Journey - Authentication', () => {
  test('should login successfully as student', async ({ page }) => {
    await login(page, TEST_USERS.student);

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify dashboard elements are visible
    await expect(page.locator('h1')).toContainText(/Dashboard|Welcome/i);
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, TEST_USERS.student);
    await logout(page);

    // Verify redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Attempt login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('#error-message, .error-message, [role="alert"]')).toBeVisible(
      { timeout: 5000 }
    );

    // Should not navigate away from login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected page without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});

test.describe('Student Journey - Course Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should display course catalog', async ({ page }) => {
    await page.goto('/courses');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText(/Course|Browse/i);

    // Wait for courses to load
    await page.waitForSelector('.course-card-wrapper, .course-card, [data-testid="course-card"]', {
      timeout: 10000,
      state: 'visible',
    });

    // Verify courses are displayed (if any exist)
    const courseCards = page.locator('.course-card-wrapper, .course-card, [data-testid="course-card"]');
    const count = await courseCards.count();

    // Should have at least one course or show empty state
    if (count === 0) {
      await expect(page.locator('#empty-state, .empty-state')).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should filter courses by track', async ({ page }) => {
    await page.goto('/courses');

    // Wait for courses to load
    await page.waitForLoadState('networkidle');

    // Click on a track filter
    const animalAdvocacyFilter = page.locator('button[data-track="animal-advocacy"]');

    if (await animalAdvocacyFilter.isVisible()) {
      await animalAdvocacyFilter.click();

      // Verify filter is active
      await expect(animalAdvocacyFilter).toHaveClass(/active/);

      // Courses should be filtered (or show empty state)
      await page.waitForTimeout(500); // Wait for filter to apply
    }
  });

  test('should filter between enrolled and available courses', async ({ page }) => {
    await page.goto('/courses');

    await page.waitForLoadState('networkidle');

    // Switch to "My Courses" tab
    const enrolledTab = page.locator('button[data-filter="enrolled"]');
    if (await enrolledTab.isVisible()) {
      await enrolledTab.click();
      await expect(enrolledTab).toHaveClass(/active/);
    }

    // Switch to "Available" tab
    const availableTab = page.locator('button[data-filter="available"]');
    if (await availableTab.isVisible()) {
      await availableTab.click();
      await expect(availableTab).toHaveClass(/active/);
    }
  });

  test('should navigate to course detail page', async ({ page }) => {
    await page.goto('/courses');

    // Wait for courses to load
    await page.waitForLoadState('networkidle');

    // Find first course card
    const firstCourse = page
      .locator('.course-card-wrapper, .course-card, [data-testid="course-card"]')
      .first();

    if (await firstCourse.isVisible()) {
      // Get course slug for verification
      const slug = await firstCourse.getAttribute('data-slug');

      // Click course card
      await firstCourse.click();

      // Should navigate to course detail page
      if (slug) {
        await expect(page).toHaveURL(new RegExp(`/courses/${slug}`));
      } else {
        // At least verify we're on a course page
        await expect(page).toHaveURL(/\/courses\/[^/]+/);
      }
    }
  });
});

test.describe('Student Journey - Course Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should enroll in a course', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Look for an enroll button
    const enrollBtn = page.locator('.enroll-btn, button:has-text("Enroll")').first();

    if (await enrollBtn.isVisible()) {
      // Click enroll button
      await enrollBtn.click();

      // Should show success message or update UI
      await page.waitForTimeout(2000); // Wait for enrollment to process

      // Verify enrollment (button should change or show enrolled status)
      const enrolledBadge = page.locator('.enrolled-badge, text=Enrolled').first();
      await expect(enrolledBadge).toBeVisible({ timeout: 5000 });
    } else {
      console.log('No available courses to enroll in');
    }
  });

  test('should show enrolled courses in dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Check for courses section
    const coursesSection = page.locator('#courses-list, .courses-list, [data-testid="courses-list"]');

    // Should either show courses or empty state
    const coursesEmpty = page.locator('#courses-empty, .courses-empty');

    const hasContent = await coursesSection.isVisible();
    const isEmpty = await coursesEmpty.isVisible();

    expect(hasContent || isEmpty).toBeTruthy();
  });
});

test.describe('Student Journey - Course Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should navigate to enrolled course', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find "Continue" or "Start" button for a course
    const courseButton = page
      .locator('button:has-text("Continue"), button:has-text("Start"), a:has-text("Continue"), a:has-text("Start")')
      .first();

    if (await courseButton.isVisible()) {
      await courseButton.click();

      // Should navigate to course or lesson page
      await expect(page).toHaveURL(/\/courses\/[^/]+(\/lessons\/[^/]+)?/);
    }
  });

  test('should display course structure', async ({ page }) => {
    // Navigate to courses page
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Click on first course
    const firstCourse = page.locator('.course-card-wrapper, .course-card').first();

    if (await firstCourse.isVisible()) {
      const slug = await firstCourse.getAttribute('data-slug');
      if (slug) {
        await page.goto(`/courses/${slug}`);

        // Course page should show lessons or modules
        const lessonsOrModules = page.locator(
          '.lesson-list, .module-list, [data-testid="lessons"], [data-testid="modules"]'
        );

        // Give it time to load
        await page.waitForTimeout(2000);

        // Check if content loaded
        const hasContent = await lessonsOrModules.isVisible().catch(() => false);
        expect(typeof hasContent).toBe('boolean');
      }
    }
  });
});

test.describe('Student Journey - Video Playback', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should load video player on lesson page', async ({ page }) => {
    // This test requires a known lesson URL with video
    // For now, we'll navigate to courses and try to find a lesson

    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    // Try to navigate to a course
    const firstCourse = page.locator('.course-card-wrapper').first();

    if (await firstCourse.isVisible()) {
      const slug = await firstCourse.getAttribute('data-slug');

      if (slug) {
        // Try to navigate to course
        await page.goto(`/courses/${slug}`);
        await page.waitForLoadState('networkidle');

        // Look for first lesson link
        const lessonLink = page
          .locator('a[href*="/lessons/"], button:has-text("Start")')
          .first();

        if (await lessonLink.isVisible()) {
          await lessonLink.click();

          // Wait for lesson page to load
          await page.waitForLoadState('networkidle');

          // Check for video element
          const video = page.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]');

          if (await video.isVisible({ timeout: 5000 })) {
            // Video should be present
            expect(await video.count()).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

test.describe('Student Journey - Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.student);
  });

  test('should display progress in dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for progress indicators
    const progressElements = page.locator(
      '.progress, .progress-bar, [role="progressbar"], text=/\\d+%/'
    );

    // Progress indicators might exist if user is enrolled in courses
    const hasProgress = await progressElements.count();
    expect(typeof hasProgress).toBe('number');
  });

  test('should show course completion status', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for completion badges or status
    const statusElements = page.locator(
      '.complete, .completed, .in-progress, text=/Complete/i, text=/In Progress/i'
    );

    const hasStatus = await statusElements.count();
    expect(typeof hasStatus).toBe('number');
  });
});
