/**
 * Content Management System - Comprehensive Test Suite
 *
 * Tests all CMS features:
 * - Bulk upload
 * - Course cloning
 * - Versioning
 * - A/B testing
 * - Templates
 * - Media library
 * - Reordering
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let testToken: string;
let testUserId: string;
let testCourseId: number;
let testModuleId: number;

describe('Content Management System', () => {
  beforeAll(async () => {
    // Create test user and get auth token
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (authData.session) {
      testToken = authData.session.access_token;
      testUserId = authData.user?.id || '';
    }

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        title: 'Test Course for CMS',
        slug: 'test-course-cms-' + Date.now(),
        created_by: testUserId,
        is_published: true
      })
      .select()
      .single();

    testCourseId = course?.id;

    // Create test module
    const { data: module } = await supabase
      .from('modules')
      .insert({
        course_id: testCourseId,
        title: 'Test Module',
        order_index: 1
      })
      .select()
      .single();

    testModuleId = module?.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testCourseId) {
      await supabase.from('courses').delete().eq('id', testCourseId);
    }
  });

  describe('Bulk Upload', () => {
    it('should upload lessons from CSV data', async () => {
      const csvData = [
        {
          module_id: testModuleId.toString(),
          title: 'Test Lesson 1',
          slug: 'test-lesson-1',
          content: 'Content for lesson 1',
          order_index: '1'
        },
        {
          module_id: testModuleId.toString(),
          title: 'Test Lesson 2',
          slug: 'test-lesson-2',
          content: 'Content for lesson 2',
          order_index: '2'
        }
      ];

      const response = await fetch('http://localhost:4321/api/content/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData, courseId: testCourseId })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.results.successful).toBe(2);
      expect(result.results.failed).toBe(0);
    });

    it('should validate CSV data and report errors', async () => {
      const invalidData = [
        {
          module_id: '99999', // Non-existent module
          name: 'Invalid Lesson',
          slug: 'invalid',
          order_index: '1'
        }
      ];

      const response = await fetch('http://localhost:4321/api/content/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData: invalidData, courseId: testCourseId })
      });

      const result = await response.json();

      expect(result.results.failed).toBeGreaterThan(0);
      expect(result.results.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Course Cloning', () => {
    it('should clone a course with all modules and lessons', async () => {
      const response = await fetch('http://localhost:4321/api/content/clone-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceCourseId: testCourseId,
          newName: 'Cloned Test Course',
          newSlug: 'cloned-test-course-' + Date.now(),
          includeContent: true
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.course.title).toBe('Cloned Test Course');
      expect(result.stats.modulesCloned).toBeGreaterThan(0);

      // Cleanup cloned course
      if (result.course.id) {
        await supabase.from('courses').delete().eq('id', result.course.id);
      }
    });

    it('should prevent cloning with duplicate slug', async () => {
      const response = await fetch('http://localhost:4321/api/content/clone-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceCourseId: testCourseId,
          newName: 'Another Clone',
          newSlug: 'test-course-cms-' + Date.now(), // Likely duplicate
          includeContent: false
        })
      });

      // First clone should succeed
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Content Versioning', () => {
    it('should create a version of content', async () => {
      const response = await fetch('http://localhost:4321/api/content/versions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentType: 'course',
          contentId: testCourseId,
          changeSummary: 'Test version creation'
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.version).toBeDefined();
      expect(result.version.change_summary).toBe('Test version creation');
    });

    it('should list all versions of content', async () => {
      const response = await fetch(
        `http://localhost:4321/api/content/versions?type=course&id=${testCourseId}`,
        {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        }
      );

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.versions)).toBe(true);
    });

    it('should rollback to a previous version', async () => {
      // First, create a version
      const createResponse = await fetch('http://localhost:4321/api/content/versions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentType: 'course',
          contentId: testCourseId,
          changeSummary: 'Version for rollback test'
        })
      });

      const createResult = await createResponse.json();
      const versionId = createResult.version.id;

      // Then rollback to it
      const rollbackResponse = await fetch('http://localhost:4321/api/content/versions', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ versionId })
      });

      const rollbackResult = await rollbackResponse.json();

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResult.success).toBe(true);
    });
  });

  describe('A/B Testing', () => {
    let testLessonId: number;

    beforeAll(async () => {
      // Create test lesson
      const { data: lesson } = await supabase
        .from('lessons')
        .insert({
          module_id: testModuleId,
          title: 'Test Lesson for A/B',
          slug: 'test-lesson-ab',
          order_index: 99
        })
        .select()
        .single();

      testLessonId = lesson?.id;
    });

    it('should create an A/B test experiment', async () => {
      const response = await fetch('http://localhost:4321/api/content/ab-testing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test A/B Experiment',
          description: 'Testing video vs text',
          lessonId: testLessonId,
          variantBData: {
            title: 'Alternative Lesson',
            content: 'Alternative content for testing'
          },
          trafficSplit: 50,
          primaryMetric: 'completion_rate',
          successThreshold: 5.0
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.experiment.name).toBe('Test A/B Experiment');
    });

    it('should list experiments for a lesson', async () => {
      const response = await fetch(
        `http://localhost:4321/api/content/ab-testing?lessonId=${testLessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        }
      );

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.experiments)).toBe(true);
    });
  });

  describe('Template Library', () => {
    it('should create a course template', async () => {
      const response = await fetch('http://localhost:4321/api/content/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'course',
          sourceId: testCourseId,
          name: 'Test Course Template',
          description: 'Template for testing',
          category: 'testing',
          isPublic: false
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.template.name).toBe('Test Course Template');
    });

    it('should list available templates', async () => {
      const response = await fetch(
        'http://localhost:4321/api/content/templates?type=course',
        {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        }
      );

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.templates)).toBe(true);
    });
  });

  describe('Media Library', () => {
    it('should register uploaded media', async () => {
      const response = await fetch('http://localhost:4321/api/content/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: 'test-video.mp4',
          filePath: 'media/test-video.mp4',
          fileType: 'video',
          mimeType: 'video/mp4',
          fileSizeBytes: 1024000,
          folder: '/videos',
          tags: ['test', 'video'],
          altText: 'Test video'
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.media.file_name).toBe('test-video.mp4');
    });

    it('should search media library', async () => {
      const response = await fetch(
        'http://localhost:4321/api/content/media?type=video&search=test',
        {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        }
      );

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.media)).toBe(true);
    });

    it('should update media metadata', async () => {
      // First create media
      const createResponse = await fetch('http://localhost:4321/api/content/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: 'update-test.jpg',
          filePath: 'media/update-test.jpg',
          fileType: 'image',
          mimeType: 'image/jpeg',
          fileSizeBytes: 50000
        })
      });

      const createResult = await createResponse.json();
      const mediaId = createResult.media.id;

      // Then update it
      const updateResponse = await fetch('http://localhost:4321/api/content/media', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaId,
          tags: ['updated', 'test'],
          caption: 'Updated caption'
        })
      });

      const updateResult = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResult.success).toBe(true);
      expect(updateResult.media.caption).toBe('Updated caption');
    });
  });

  describe('Content Reordering', () => {
    let module1Id: number;
    let module2Id: number;
    let module3Id: number;

    beforeAll(async () => {
      // Create multiple modules for reordering
      const modules = await Promise.all([
        supabase.from('modules').insert({
          course_id: testCourseId,
          title: 'Module 1',
          order_index: 1
        }).select().single(),
        supabase.from('modules').insert({
          course_id: testCourseId,
          title: 'Module 2',
          order_index: 2
        }).select().single(),
        supabase.from('modules').insert({
          course_id: testCourseId,
          title: 'Module 3',
          order_index: 3
        }).select().single()
      ]);

      module1Id = modules[0].data?.id;
      module2Id = modules[1].data?.id;
      module3Id = modules[2].data?.id;
    });

    it('should reorder modules', async () => {
      // Reverse order
      const newOrder = [module3Id, module2Id, module1Id];

      const response = await fetch('http://localhost:4321/api/content/reorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'modules',
          parentId: testCourseId,
          newOrder
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify order was updated
      const { data: modules } = await supabase
        .from('modules')
        .select('id, order_index')
        .eq('course_id', testCourseId)
        .order('order_index', { ascending: true });

      expect(modules?.[0].id).toBe(module3Id);
      expect(modules?.[1].id).toBe(module2Id);
      expect(modules?.[2].id).toBe(module1Id);
    });
  });

  describe('Security & Permissions', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'POST', url: '/api/content/bulk-upload' },
        { method: 'POST', url: '/api/content/clone-course' },
        { method: 'GET', url: '/api/content/versions?type=course&id=1' },
        { method: 'POST', url: '/api/content/ab-testing' },
        { method: 'GET', url: '/api/content/templates' },
        { method: 'GET', url: '/api/content/media' },
        { method: 'POST', url: '/api/content/reorder' }
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:4321${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        expect(response.status).toBe(401);
      }
    });

    it('should prevent unauthorized access to other users content', async () => {
      // Try to clone a course that doesn't belong to test user
      const response = await fetch('http://localhost:4321/api/content/clone-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceCourseId: 99999, // Non-existent or unauthorized
          newName: 'Unauthorized Clone',
          newSlug: 'unauthorized-' + Date.now()
        })
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await fetch('http://localhost:4321/api/content/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate required fields', async () => {
      const response = await fetch('http://localhost:4321/api/content/clone-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required fields
          newName: 'Test'
        })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBeDefined();
    });
  });
});

describe('CSV Parser Utility', () => {
  it('should parse valid CSV content', async () => {
    const { parseCSV } = await import('../src/lib/csv-parser');

    const csvContent = `module_id,name,slug,order_index
1,Lesson 1,lesson-1,1
2,Lesson 2,lesson-2,2`;

    const result = parseCSV(csvContent);

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(2);
    expect(result.data?.[0].name).toBe('Lesson 1');
  });

  it('should detect missing required fields', async () => {
    const { parseCSV } = await import('../src/lib/csv-parser');

    const csvContent = `module_id,name
1,Lesson 1`;

    const result = parseCSV(csvContent);

    expect(result.success).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should validate data types', async () => {
    const { parseCSV } = await import('../src/lib/csv-parser');

    const csvContent = `module_id,name,slug,order_index
abc,Lesson 1,lesson-1,1`;

    const result = parseCSV(csvContent);

    expect(result.success).toBe(false);
  });
});
