import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Add CSS for sr-only class (screen reader only)
// Use clip-path to hide from testing-library queries while keeping accessible
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border-width: 0;
    }
  `;
  document.head.appendChild(style);
}

// Configure testing-library to exclude hidden elements
import { configure } from '@testing-library/react';
configure({ defaultHidden: true });

// Mock Supabase client to prevent real database calls during tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      containedBy: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'videos/test-video.mp4' },
          error: null,
        }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { 
            signedUrl: 'https://test.supabase.co/storage/v1/object/sign/videos/test.mp4?token=abc123',
            expiresIn: 1800,
          },
          error: null,
        }),
        download: vi.fn().mockResolvedValue({
          data: new Blob(),
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        list: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
    },
  })),
}));

// Mock environment variables
process.env.PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

// Mock Astro's import.meta.env global for API routes
// @ts-ignore - Astro global not available in test environment
global.import = {
  meta: {
    env: {
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    },
  },
};