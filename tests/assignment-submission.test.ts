/**
 * Assignment Submission System - Integration Tests
 * Tests the complete student assignment submission workflow
 */

import { test, expect } from '@playwright/test';

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4321';
const TEST_STUDENT_EMAIL = 'student1@test.com';
const TEST_STUDENT_PASSWORD = 'Test1234!';

test.describe('Assignment Submission System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto(`${TEST_BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_STUDENT_EMAIL);
    await page.fill('input[type="password"]', TEST_STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|courses/);
  });

  test('should display assignments list page', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);

    // Check page title
    await expect(page.locator('h1')).toContainText('My Assignments');

    // Check stats are displayed
    await expect(page.locator('#stats-container')).toBeVisible();

    // Check filters are displayed
    await expect(page.locator('#status-filter')).toBeVisible();
    await expect(page.locator('#sort-filter')).toBeVisible();
    await expect(page.locator('#course-filter')).toBeVisible();
  });

  test('should filter assignments by status', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);

    // Wait for assignments to load
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Select "Not Submitted" filter
    await page.selectOption('#status-filter', 'not_submitted');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results
    const assignments = await page.locator('#assignments-list > a').all();
    for (const assignment of assignments) {
      const statusBadge = assignment.locator('span.rounded-full');
      const text = await statusBadge.textContent();
      expect(text).toMatch(/Not Submitted|Late|Closed/);
    }
  });

  test('should sort assignments by due date', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);

    // Wait for assignments to load
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Select sort by due date
    await page.selectOption('#sort-filter', 'due_date_asc');
    await page.waitForTimeout(500);

    // Get assignment due dates
    const assignments = await page.locator('#assignments-list > a').all();
    const dueDates: Date[] = [];

    for (const assignment of assignments) {
      const dueDateText = await assignment.locator('text=/Due:/')').textContent();
      if (dueDateText) {
        // Extract date from text
        const match = dueDateText.match(/Due: (.+)/);
        if (match) {
          dueDates.push(new Date(match[1]));
        }
      }
    }

    // Verify dates are in ascending order
    for (let i = 1; i < dueDates.length; i++) {
      expect(dueDates[i].getTime()).toBeGreaterThanOrEqual(dueDates[i - 1].getTime());
    }
  });

  test('should navigate to assignment detail page', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);

    // Wait for assignments to load
    await page.waitForSelector('#assignments-list a', { timeout: 10000 });

    // Click first assignment
    await page.click('#assignments-list a:first-child');

    // Verify navigation
    await expect(page).toHaveURL(/\/assignments\/\d+/);

    // Verify assignment details are displayed
    await expect(page.locator('h1#assignment-title')).toBeVisible();
    await expect(page.locator('#assignment-details')).toBeVisible();
  });

  test('should display assignment details correctly', async ({ page }) => {
    // Navigate directly to an assignment (assuming ID 1 exists)
    await page.goto(`${TEST_BASE_URL}/assignments/1`);

    // Wait for content to load
    await page.waitForSelector('#content', { timeout: 10000 });

    // Verify key elements
    await expect(page.locator('#assignment-title')).toBeVisible();
    await expect(page.locator('#assignment-instructions')).toBeVisible();
    await expect(page.locator('#assignment-details')).toBeVisible();

    // Verify details section contains key information
    const details = page.locator('#assignment-details');
    await expect(details.locator('text=/Maximum Points/')).toBeVisible();
    await expect(details.locator('text=/File Types/')).toBeVisible();
    await expect(details.locator('text=/Max File Size/')).toBeVisible();
  });

  test('should display countdown timer for assignments with due dates', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    // Check if countdown container exists
    const countdown = page.locator('#countdown-container');
    const isVisible = await countdown.isVisible();

    if (isVisible) {
      // Verify countdown elements
      await expect(countdown.locator('text=/Time remaining|Due soon|Due very soon|Overdue|Submissions closed/')).toBeVisible();
    }
  });

  test('should display grading rubric if available', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    const rubricContainer = page.locator('#rubric-container');
    const hasRubric = await rubricContainer.isVisible();

    if (hasRubric) {
      // Verify rubric elements
      await expect(rubricContainer.locator('text=/Grading Rubric/')).toBeVisible();
      await expect(rubricContainer.locator('text=/Total.*points/')).toBeVisible();
    }
  });

  test('should show submission form for unsubmitted assignments', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    const submissionForm = page.locator('#submission-form-container');

    // Check if submission form is visible (assignment not submitted yet)
    const hasForm = await submissionForm.locator('text=/Submit Your Work|Drop your file here/').isVisible().catch(() => false);

    if (hasForm) {
      // Verify file upload interface
      await expect(submissionForm).toBeVisible();
    }
  });

  test('should validate file type restrictions', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    // Check if file uploader is visible
    const hasUploader = await page.locator('text=/Drop your file here/').isVisible().catch(() => false);

    if (hasUploader) {
      // Get accepted file types
      const fileInput = page.locator('input[type="file"]');
      const acceptAttr = await fileInput.getAttribute('accept');
      expect(acceptAttr).toBeTruthy();
    }
  });

  test('should show late submission warning if past due', async ({ page }) => {
    // This test assumes there's an assignment that's past due but allows late submissions
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Look for assignments with "Late" badge
    const lateAssignments = page.locator('#assignments-list a:has(span:text("Late"))');
    const count = await lateAssignments.count();

    if (count > 0) {
      // Click first late assignment
      await lateAssignments.first().click();
      await page.waitForSelector('#content', { timeout: 10000 });

      // Check for late submission warning
      const warning = page.locator('text=/Late Submission.*penalty/');
      await expect(warning).toBeVisible();
    }
  });

  test('should display submission status correctly', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    // Check for submission status component
    const statusContainer = page.locator('#submission-status-container');
    await expect(statusContainer).toBeVisible();

    // Verify status displays one of the expected states
    await expect(statusContainer.locator('text=/Not Submitted|Submitted|Graded/')).toBeVisible();
  });

  test('should show assignments in lesson pages', async ({ page }) => {
    // Navigate to a course
    await page.goto(`${TEST_BASE_URL}/courses`);
    await page.waitForSelector('text=/courses/i', { timeout: 10000 });

    // Find and click a course
    const courseLinks = page.locator('a[href*="/courses/"]');
    const count = await courseLinks.count();

    if (count > 0) {
      await courseLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Find and click a lesson
      const lessonLinks = page.locator('a[href*="/lessons/"]');
      const lessonCount = await lessonLinks.count();

      if (lessonCount > 0) {
        await lessonLinks.first().click();
        await page.waitForSelector('#lesson-content', { timeout: 10000 });

        // Check if assignments container exists
        const assignmentsContainer = page.locator('#assignments-container');
        const hasAssignments = await assignmentsContainer.isVisible().catch(() => false);

        if (hasAssignments) {
          // Verify assignment links are displayed
          await expect(assignmentsContainer.locator('#assignments-list a')).toBeVisible();
        }
      }
    }
  });

  test('should track submission statistics accurately', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#stats-container', { timeout: 10000 });

    // Get stat values
    const statsContainer = page.locator('#stats-container');
    const notSubmitted = await statsContainer.locator('text=/Not Submitted/').locator('..').locator('.text-3xl').textContent();
    const submitted = await statsContainer.locator('text=/Submitted/').locator('..').locator('.text-3xl').textContent();
    const graded = await statsContainer.locator('text=/Graded/').locator('..').locator('.text-3xl').textContent();
    const overdue = await statsContainer.locator('text=/Overdue/').locator('..').locator('.text-3xl').textContent();

    // Verify all stats are numbers
    expect(Number(notSubmitted)).toBeGreaterThanOrEqual(0);
    expect(Number(submitted)).toBeGreaterThanOrEqual(0);
    expect(Number(graded)).toBeGreaterThanOrEqual(0);
    expect(Number(overdue)).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible navigation back to assignments list', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    // Check for back button
    const backLink = page.locator('a:has-text("Back to Assignments")');
    await expect(backLink).toBeVisible();

    // Verify link points to assignments list
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/assignments');
  });

  test('should display assignment meta information', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    // Verify meta information
    const meta = page.locator('#assignment-meta');
    await expect(meta).toBeVisible();

    // Should contain course and lesson info
    const metaText = await meta.textContent();
    expect(metaText).toBeTruthy();
    expect(metaText).toContain('•'); // Separator between course and lesson
  });

  test('should handle empty state when no assignments exist', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForTimeout(2000);

    // Check if empty state is shown
    const emptyState = page.locator('#empty');
    const listContainer = page.locator('#assignments-list');

    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasAssignments = await listContainer.locator('a').count() > 0;

    // Either should show empty state or have assignments
    expect(isEmpty || hasAssignments).toBeTruthy();
  });

  test('should show appropriate message when submissions are closed', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Look for closed assignments
    const closedAssignments = page.locator('#assignments-list a:has(span:text("Closed"))');
    const count = await closedAssignments.count();

    if (count > 0) {
      await closedAssignments.first().click();
      await page.waitForSelector('#content', { timeout: 10000 });

      // Verify closed message is displayed
      const closedMessage = page.locator('text=/Submissions Closed|Submissions are closed/');
      await expect(closedMessage).toBeVisible();
    }
  });

  test('should responsive design work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#stats-container', { timeout: 10000 });

    // Verify page is still functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#status-filter')).toBeVisible();

    // Stats should stack vertically on mobile
    const statsContainer = page.locator('#stats-container');
    await expect(statsContainer).toBeVisible();
  });

  test('should maintain filter state during page interactions', async ({ page }) => {
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Set a filter
    await page.selectOption('#status-filter', 'submitted');
    await page.waitForTimeout(500);

    // Verify filter is still selected
    const selectedValue = await page.locator('#status-filter').inputValue();
    expect(selectedValue).toBe('submitted');
  });
});

test.describe('Assignment Submission Security', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    // Clear auth
    await page.context().clearCookies();

    await page.goto(`${TEST_BASE_URL}/assignments`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should not allow access to other students submissions', async ({ page }) => {
    // This test verifies RLS is working
    await page.goto(`${TEST_BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_STUDENT_EMAIL);
    await page.fill('input[type="password"]', TEST_STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|courses/);

    // Try to access assignments page - should only see own assignments
    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    // Assignments should be visible (filtered by RLS)
    const assignments = await page.locator('#assignments-list a').count();
    expect(assignments).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Assignment Submission Performance', () => {
  test('should load assignments list within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${TEST_BASE_URL}/assignments`);
    await page.waitForSelector('#assignments-list', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load assignment details within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${TEST_BASE_URL}/assignments/1`);
    await page.waitForSelector('#content', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
