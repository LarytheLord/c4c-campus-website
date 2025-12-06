import { Page } from '@playwright/test';

/**
 * Authentication helpers for E2E tests
 * Provides reusable functions for login, logout, and session management
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  name?: string;
}

/**
 * Test user credentials
 * Note: These should be created in the test database before running E2E tests
 */
export const TEST_USERS = {
  student: {
    email: 'e2e-student@test.c4c.dev',
    password: 'TestStudent123!',
    role: 'student' as const,
    name: 'Test Student',
  },
  teacher: {
    email: 'e2e-teacher@test.c4c.dev',
    password: 'TestTeacher123!',
    role: 'teacher' as const,
    name: 'Test Teacher',
  },
  admin: {
    email: 'e2e-admin@test.c4c.dev',
    password: 'TestAdmin123!',
    role: 'admin' as const,
    name: 'Test Admin',
  },
};

/**
 * Login to the application
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Fill login form
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|admin|teacher)/, { timeout: 10000 });
}

/**
 * Logout from the application
 */
export async function logout(page: Page): Promise<void> {
  // Look for logout button
  const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');

  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL('/login', { timeout: 5000 });
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for presence of logout button
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    return await logoutBtn.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Navigate to a protected page and verify authentication
 */
export async function navigateAuthenticated(page: Page, url: string): Promise<void> {
  await page.goto(url);

  // If redirected to login, we're not authenticated
  if (page.url().includes('/login')) {
    throw new Error('Not authenticated - redirected to login page');
  }
}
