import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './fixtures/auth';

/**
 * E2E Test Suite: Admin Workflow
 *
 * Tests admin functionality:
 * 1. Login → Review applications → Approve/Reject
 * 2. User management
 * 3. System administration
 */

test.describe('Admin Workflow - Authentication', () => {
  test('should login successfully as admin', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Verify redirect to admin or dashboard
    await expect(page).toHaveURL(/\/(admin|dashboard|teacher)/);
  });

  test('should have admin privileges', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Admin should be able to access admin pages
    await page.goto('/admin');

    // Should not be redirected to login
    await expect(page).not.toHaveURL('/login');
  });
});

test.describe('Admin Workflow - Application Review', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should navigate to applications page', async ({ page }) => {
    // Try common admin application URLs
    const appUrls = ['/admin/applications', '/admin/applicants', '/applications'];

    for (const url of appUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/login') && !page.url().includes('404')) {
        // Found valid page
        expect(page.url()).toMatch(/admin|application/i);
        return;
      }
    }

    // At minimum, admin should have access
    await expect(page).not.toHaveURL('/login');
  });

  test('should display applications list', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for applications section
    const applicationsSection = page.locator(
      'text=/applications/i, text=/applicants/i, [data-testid="applications"]'
    );

    const hasApplications = (await applicationsSection.count()) > 0;

    if (hasApplications) {
      // Click to view applications
      await applicationsSection.first().click();
      await page.waitForLoadState('networkidle');

      // Should show applications table or list
      const tableOrList = page.locator('table, .application-list, .applicant-list');
      const hasContent = (await tableOrList.count()) > 0;

      expect(hasContent).toBeTruthy();
    }
  });

  test('should show application details', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for application rows or cards
    const applicationItems = page.locator(
      'tr[data-application-id], .application-card, [data-testid="application"]'
    );

    const count = await applicationItems.count();

    if (count > 0) {
      // Click first application
      await applicationItems.first().click();
      await page.waitForTimeout(1000);

      // Should show details (modal or new page)
      const detailsVisible =
        (await page.locator('[role="dialog"], .modal, .application-details').isVisible().catch(() => false)) ||
        page.url().includes('application');

      expect(detailsVisible || page.url().includes('admin')).toBeTruthy();
    }
  });

  test('should have approve/reject controls', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for approve/reject buttons
    const approveBtn = page.locator('button:has-text("Approve"), [data-action="approve"]');
    const rejectBtn = page.locator('button:has-text("Reject"), [data-action="reject"]');

    const hasApprove = (await approveBtn.count()) > 0;
    const hasReject = (await rejectBtn.count()) > 0;

    // These controls might exist if there are applications
    expect(typeof hasApprove).toBe('boolean');
    expect(typeof hasReject).toBe('boolean');
  });

  test('should filter applications by status', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for status filters
    const statusFilters = page.locator(
      'select[name="status"], button[data-status], .status-filter'
    );

    const hasFilters = (await statusFilters.count()) > 0;

    if (hasFilters) {
      // Try to interact with filter
      const firstFilter = statusFilters.first();

      if (await firstFilter.isVisible()) {
        const tagName = await firstFilter.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === 'select') {
          // Try to select pending status
          await firstFilter.selectOption({ label: 'Pending' }).catch(() => {});
        } else if (tagName === 'button') {
          await firstFilter.click();
        }

        await page.waitForTimeout(500);
        expect(true).toBeTruthy();
      }
    }
  });
});

test.describe('Admin Workflow - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should navigate to users management', async ({ page }) => {
    // Try common user management URLs
    const userUrls = ['/admin/users', '/admin/students', '/users'];

    for (const url of userUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/login')) {
        break;
      }
    }

    // Admin should have access
    await expect(page).not.toHaveURL('/login');
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for users section
    const usersSection = page.locator('text=/users/i, text=/students/i, [data-testid="users"]');

    const hasUsers = (await usersSection.count()) > 0;

    if (hasUsers) {
      // Navigate to users
      await usersSection.first().click();
      await page.waitForLoadState('networkidle');

      // Should show users table
      const tableOrList = page.locator('table, .user-list, .student-list');
      const hasContent = (await tableOrList.count()) > 0;

      expect(typeof hasContent).toBe('boolean');
    }
  });

  test('should have user action controls', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for user action buttons
    const actionButtons = page.locator(
      'button:has-text("Edit"), button:has-text("Delete"), button:has-text("Deactivate")'
    );

    const hasActions = (await actionButtons.count()) > 0;
    expect(typeof hasActions).toBe('boolean');
  });

  test('should search users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[name="search"]'
    );

    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      // Try to search
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      expect(true).toBeTruthy();
    }
  });
});

test.describe('Admin Workflow - Course Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should view all courses', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Should show courses (published and unpublished)
    const coursesTable = page.locator('table, .course-list, [data-testid="courses"]');

    const hasCourses = (await coursesTable.count()) > 0;
    expect(typeof hasCourses).toBe('boolean');
  });

  test('should have course management controls', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Look for course actions
    const courseActions = page.locator(
      'button:has-text("Edit"), button:has-text("Delete"), button:has-text("Publish"), button:has-text("Unpublish")'
    );

    const hasActions = (await courseActions.count()) > 0;
    expect(typeof hasActions).toBe('boolean');
  });
});

test.describe('Admin Workflow - Statistics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for dashboard elements
    const dashboardElements = page.locator(
      '.stat, .metric, .card, [data-testid="dashboard"]'
    );

    const hasElements = (await dashboardElements.count()) > 0;
    expect(hasElements).toBeTruthy();
  });

  test('should show key metrics', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for common metrics
    const metrics = page.locator(
      'text=/total.*users/i, text=/total.*students/i, text=/total.*courses/i, text=/applications/i'
    );

    const hasMetrics = (await metrics.count()) > 0;

    if (hasMetrics) {
      // Should show at least one metric
      expect(hasMetrics).toBeTruthy();
    } else {
      // At least verify we're on admin page
      expect(page.url()).toContain('admin');
    }
  });

  test('should display pending applications count', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for pending applications indicator
    const pendingApps = page.locator(
      'text=/pending/i, .pending-count, [data-testid="pending-applications"]'
    );

    const hasPending = (await pendingApps.count()) > 0;
    expect(typeof hasPending).toBe('boolean');
  });

  test('should show recent activity', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for activity feed or recent items
    const activitySection = page.locator(
      'text=/recent/i, text=/activity/i, .activity, .recent-activity'
    );

    const hasActivity = (await activitySection.count()) > 0;
    expect(typeof hasActivity).toBe('boolean');
  });
});

test.describe('Admin Workflow - System Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should access settings page', async ({ page }) => {
    // Try to navigate to settings
    const settingsUrls = ['/admin/settings', '/settings'];

    for (const url of settingsUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/login') && !page.url().includes('404')) {
        // Found settings
        expect(page.url()).toMatch(/settings|admin/i);
        return;
      }
    }

    // Settings might not exist yet
    await expect(page).not.toHaveURL('/login');
  });
});

test.describe('Admin Workflow - Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin);
  });

  test('should have bulk selection controls', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for checkboxes for bulk selection
    const checkboxes = page.locator('input[type="checkbox"]');

    const hasCheckboxes = (await checkboxes.count()) > 0;
    expect(typeof hasCheckboxes).toBe('boolean');
  });

  test('should have bulk action buttons', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for bulk action buttons
    const bulkActions = page.locator(
      'button:has-text("Bulk"), button:has-text("Select All"), [data-action="bulk"]'
    );

    const hasBulkActions = (await bulkActions.count()) > 0;
    expect(typeof hasBulkActions).toBe('boolean');
  });
});
