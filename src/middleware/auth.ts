/**
 * Server-Side Authentication Middleware
 * 
 * SECURITY: This runs on the SERVER before pages render,
 * preventing client-side bypass of authorization checks.
 * 
 * Protected Routes:
 * - /admin/* - Requires admin role
 * - /teacher/* - Requires teacher or admin role
 * - /dashboard - Requires authenticated user
 */

import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import { logger, logSecurityEvent } from '../lib/logger';

// Protected route patterns
const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const TEACHER_ROUTES = /^\/teacher(\/.*)?$/;
const AUTH_REQUIRED_ROUTES = /^\/dashboard$/;

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, locals } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip middleware for public routes, API, and static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/apply') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname === '/' ||
    pathname.startsWith('/programs') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/framework') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/tracks') ||
    pathname.startsWith('/application-status')
  ) {
    return next();
  }

  // Create Supabase client with cookies from request
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase credentials in middleware');
    return redirect('/login?error=config');
  }

  // Extract auth cookie
  const cookies = request.headers.get('cookie') || '';
  const authTokenMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
  
  if (!authTokenMatch) {
    logger.debug('No auth token found', { pathname });
    return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // Create client with auth token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: cookies
      }
    }
  });

  // Get user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    logger.debug('Invalid session', { pathname, error: sessionError?.message });
    return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  const user = session.user;
  logger.debug('User accessing route', { email: user.email, pathname });

  // Check if route requires admin privileges
  if (ADMIN_ROUTES.test(pathname)) {
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (appError || !application || application.role !== 'admin') {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
        user_id: user.id,
        email: user.email,
        path: pathname,
        role: application?.role || 'none'
      });

      return redirect('/dashboard?error=unauthorized');
    }

    // User is admin - allow access
    logger.info('Admin access granted', { email: user.email, pathname });
    locals.user = user;
    locals.role = 'admin';
    return next();
  }

  // Check if route requires teacher or admin privileges
  if (TEACHER_ROUTES.test(pathname)) {
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const hasAccess = application && (application.role === 'teacher' || application.role === 'admin');

    if (appError || !hasAccess) {
      logSecurityEvent('UNAUTHORIZED_TEACHER_ACCESS', {
        user_id: user.id,
        email: user.email,
        path: pathname,
        role: application?.role || 'none'
      });

      return redirect('/dashboard?error=unauthorized');
    }

    logger.info('Teacher access granted', { email: user.email, pathname, role: application.role });
    locals.user = user;
    locals.role = application.role;
    return next();
  }

  // Check if route requires authentication (but not specific role)
  if (AUTH_REQUIRED_ROUTES.test(pathname)) {
    // User is authenticated, allow access
    logger.debug('Authenticated access granted', { email: user.email, pathname });
    locals.user = user;
    return next();
  }

  // Default: allow access
  return next();
});