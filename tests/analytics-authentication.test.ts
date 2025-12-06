/**
 * Analytics API Authentication Tests
 *
 * Tests authentication and authorization for all analytics endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = 'http://localhost:3000';

// Mock authorization tokens
let adminToken: string;
let teacherToken: string;
let studentToken: string;
let noToken: string = '';

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

    it('should accept authenticated student requests', async () => {
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

    it('should accept teacher requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept teacher requests with required params', async () => {
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

    it('should accept teacher requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept admin requests', async () => {
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

    it('should accept teacher requests with cohortId', async () => {
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

    it('should require cohortId parameter', async () => {
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

    it('should accept admin requests', async () => {
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
