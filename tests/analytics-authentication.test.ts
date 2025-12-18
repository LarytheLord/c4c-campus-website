/**
 * Analytics API Authentication Tests
 *
 * Tests authentication and authorization for all analytics endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:3000';

/**
 * Token Configuration
 *
 * IMPORTANT: This test file requires real authentication tokens to test
 * both positive and negative authentication scenarios. The tests below
 * include both:
 * 1. Rejection tests (unauthenticated, wrong role) - work with invalid tokens
 * 2. Acceptance tests (correct role) - require valid tokens
 *
 * To run acceptance tests properly, set these environment variables:
 * - TEST_ADMIN_TOKEN: JWT for a user with admin role
 * - TEST_TEACHER_TOKEN: JWT for a user with teacher role
 * - TEST_STUDENT_TOKEN: JWT for a user with student role
 *
 * If tokens are not provided, acceptance tests will be skipped.
 */
const adminToken: string = process.env.TEST_ADMIN_TOKEN || '';
const teacherToken: string = process.env.TEST_TEACHER_TOKEN || '';
const studentToken: string = process.env.TEST_STUDENT_TOKEN || '';
const noToken: string = '';

// Helper to conditionally run tests that require valid tokens
const itWithToken = (token: string) => token ? it : it.skip;

// Track and warn about missing tokens before tests run
beforeAll(() => {
  const missingTokens = [];
  if (!adminToken) missingTokens.push('TEST_ADMIN_TOKEN');
  if (!teacherToken) missingTokens.push('TEST_TEACHER_TOKEN');
  if (!studentToken) missingTokens.push('TEST_STUDENT_TOKEN');

  if (missingTokens.length > 0) {
    console.warn('\n========================================');
    console.warn('WARNING: Missing Authentication Tokens');
    console.warn('========================================');
    console.warn(`Missing tokens: ${missingTokens.join(', ')}`);
    console.warn('\nIMPACT: Acceptance tests will be SKIPPED.');
    console.warn('Only rejection tests (unauthenticated/wrong role) will run.\n');
    console.warn('REJECTION TESTS verify that:');
    console.warn('  - Unauthenticated requests are rejected');
    console.warn('  - Users with wrong roles cannot access endpoints\n');
    console.warn('ACCEPTANCE TESTS verify that:');
    console.warn('  - Users with correct roles CAN access endpoints');
    console.warn('  - Properly authenticated requests succeed\n');
    console.warn('To run full test suite, set these environment variables:');
    missingTokens.forEach(token => {
      console.warn(`  - ${token}: JWT token for respective role`);
    });
    console.warn('\nFor CI configuration, see .github/workflows/schema-types-check.yml');
    console.warn('========================================\n');
  } else {
    console.log('\nAll authentication tokens configured. Running full test suite.\n');
  }
});

describe('Analytics API Authentication - Public Endpoints', () => {
  describe('POST /api/analytics/track', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: 'page_view',
          metadata: {}
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject requests with invalid auth header', async () => {
      const response = await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_token'
        },
        body: JSON.stringify({
          event_type: 'page_view',
          metadata: {}
        })
      });

      expect(response.status).toBe(401);
    });

    itWithToken(studentToken)('should accept authenticated student requests', async () => {
      const response = await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          event_type: 'page_view',
          metadata: { page: '/courses' }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});

describe('Analytics API Authentication - Teacher Analytics', () => {
  describe('GET /api/analytics/engagement-heatmap', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/engagement-heatmap?cohortId=1`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject student requests (non-teacher role)', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/engagement-heatmap?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${studentToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(teacherToken)('should accept teacher requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/engagement-heatmap?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect([200, 404]).toContain(response.status);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/engagement-heatmap?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/dropout-predictions', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/dropout-predictions?cohortId=1&courseId=1`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require teacher/admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/dropout-predictions?cohortId=1&courseId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${studentToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(teacherToken)('should accept teacher requests with required params', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/dropout-predictions?cohortId=1&courseId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/lesson-effectiveness', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/lesson-effectiveness/1`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require teacher/admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/lesson-effectiveness/1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${studentToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(teacherToken)('should accept teacher requests', async () => {
      const response = await fetch(
        `${API_URL}/api/analytics/lesson-effectiveness/1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect([200, 404, 500]).toContain(response.status);
    });
  });
});

describe('Analytics API Authentication - Admin Analytics', () => {
  describe('GET /api/admin/analytics', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        method: 'GET'
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject teacher requests (non-admin)', async () => {
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${teacherToken}`
        }
      });

      expect(response.status).toBe(401);
    });

    it('should reject student requests', async () => {
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      });

      expect(response.status).toBe(401);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/analytics/user-growth', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/user-growth?range=30d`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/user-growth?range=30d`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/user-growth?range=30d`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/analytics/geographic', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/geographic`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/geographic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/geographic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/analytics/device-analytics', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/device-analytics`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/device-analytics`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/device-analytics`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/analytics/platform-health', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/platform-health`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/platform-health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect(response.status).toBe(401);
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/platform-health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 500]).toContain(response.status);
    });
  });
});

describe('Analytics API Authentication - Teacher Analytics', () => {
  describe('GET /api/teacher/cohort-analytics', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(
        `${API_URL}/api/teacher/cohort-analytics?cohortId=1`,
        { method: 'GET' }
      );

      expect(response.status).toBe(401);
    });

    it('should require teacher/admin role', async () => {
      const response = await fetch(
        `${API_URL}/api/teacher/cohort-analytics?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${studentToken}`
          }
        }
      );

      expect(response.status).toBe(403);
    });

    itWithToken(teacherToken)('should accept teacher requests with cohortId', async () => {
      const response = await fetch(
        `${API_URL}/api/teacher/cohort-analytics?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect([200, 404, 500]).toContain(response.status);
    });

    itWithToken(teacherToken)('should require cohortId parameter', async () => {
      const response = await fetch(
        `${API_URL}/api/teacher/cohort-analytics`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`
          }
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('cohortId');
    });

    itWithToken(adminToken)('should accept admin requests', async () => {
      const response = await fetch(
        `${API_URL}/api/teacher/cohort-analytics?cohortId=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      expect([200, 404, 500]).toContain(response.status);
    });
  });
});

describe('Analytics Authentication - Error Handling', () => {
  it('should return proper error messages for invalid auth', async () => {
    const response = await fetch(`${API_URL}/api/admin/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token_xyz'
      }
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });

  it('should not expose sensitive error information', async () => {
    const response = await fetch(`${API_URL}/api/admin/analytics`, {
      method: 'GET'
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).not.toContain('Supabase');
    expect(data.error).not.toContain('API key');
  });
});
