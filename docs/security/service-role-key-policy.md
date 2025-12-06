# Service Role Key Security Policy

**Status**: CRITICAL SECURITY REMEDIATION
**Last Updated**: 2025-10-31

## Overview

This document outlines the proper usage of Supabase service role keys and the security constraints that prevent P0 vulnerabilities in the C4C Campus platform.

## What is the Service Role Key?

The service role key is a **privileged Supabase credential** that:
- **Bypasses Row-Level Security (RLS)** policies
- Has admin-level access to all tables and functions
- Can create, read, update, and delete any data
- Should **NEVER** be exposed in client-accessible code

Think of it like an admin password - it should be treated with maximum security.

## Security Vulnerability Summary

### P0 VULNERABILITY: Service Role Key in API Endpoints

Previously, the service role key was used in client-accessible API endpoints:
- `/api/ai/chat.ts` - FIXED
- `/api/ai/usage.ts` - FIXED
- `/api/create-n8n-user.ts` - FIXED
- Library files used by API endpoints (openrouter.ts, ai-context.ts, etc.) - FIXED

This exposed a critical vulnerability: **Any user could bypass authentication and RLS policies**.

### Why This Is Dangerous

```typescript
// VULNERABLE PATTERN (DO NOT USE):
const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY  // EXPOSED!
);

// Any API endpoint with this can:
// 1. Read other users' private data
// 2. Modify other users' records
// 3. Delete data they shouldn't access
// 4. Escalate privileges
```

## Correct Usage Pattern

### In API Routes (CORRECT):

```typescript
export const POST: APIRoute = async ({ request }) => {
  // 1. Extract user's authorization header
  const authHeader = request.headers.get('Authorization');

  // 2. Create client with ANON key and user's auth token
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,  // PUBLIC - safe!
    {
      global: { headers: { Authorization: authHeader } }
    }
  );

  // 3. Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }

  // 4. All database operations now respect RLS!
  // Users can only access their own data
  const { data } = await supabase
    .from('user_data')
    .select('*');
    // RLS automatically filters to authenticated user
};
```

## When Service Role Key IS Appropriate

Service role key usage is **ONLY** appropriate in:

1. **Server-side migrations and setup scripts** (not deployed code)
   ```typescript
   // OK: In a migration script (runs once, not exposed)
   const admin = createClient(url, serviceRoleKey);
   await admin.from('schema').insert(...);
   ```

2. **Admin-only backend operations** (if database-based authentication exists)
   - Must verify user is admin FIRST using auth
   - Then create separate admin client
   - Never pass service role key to frontend or client code

3. **Supabase CLI operations** (local development only)

## Migration Summary

### Fixed Endpoints

#### 1. AI Chat Endpoint
**Before**: Used service role key for all database operations
**After**: Uses authenticated client with RLS
```diff
- const supabaseService = createClient(url, serviceRoleKey);
+ const supabase = createClient(url, anonKey, {
+   global: { headers: { Authorization: authHeader } }
+ });
```

#### 2. AI Usage Endpoint
**Before**: Service role key for reading usage logs
**After**: Authenticated client - RLS ensures users only see their own logs

#### 3. Create N8N User Endpoint
**Before**: No authentication, allowed any user to store credentials for any user_id
**After**:
- Requires authentication
- Validates user can only create account for themselves
- Uses authenticated client for database operations

#### 4. Assignment Submit
**Before**: Declared but unused service role key
**After**: Removed completely

#### 5. Library Files (openrouter.ts, ai-context.ts, ai-prompts.ts)
**Before**: Initialized with service role key in constructor
**After**: Accepts authenticated client as optional parameter
- Singleton instances fall back to anon key if no client provided
- API endpoints pass authenticated client
- Respects RLS policies automatically

## RLS (Row-Level Security) Requirements

All tables used by user-facing endpoints must have RLS policies:

### ai_conversations
```sql
-- Users can only see their own conversations
CREATE POLICY "users_can_view_own_conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### ai_messages
```sql
-- Users can only see messages in their conversations
CREATE POLICY "users_can_view_own_messages" ON ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );
```

### ai_usage_logs
```sql
-- Users can only see their own usage logs
CREATE POLICY "users_can_view_own_usage" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);
```

## Authentication Flow Checklist

When adding a new API endpoint, verify:

- [ ] Endpoint checks for Authorization header
- [ ] Endpoint creates Supabase client with ANON key + auth header
- [ ] Endpoint verifies user with `supabase.auth.getUser()`
- [ ] Returns 401 if authentication fails
- [ ] All database tables have RLS enabled
- [ ] RLS policies restrict access to authenticated user's data
- [ ] No service role key is used
- [ ] No user ID is accepted from client request parameters without verification

## Detection and Prevention

### Code Review Checklist
Every API endpoint review must check:
```bash
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/pages/api/
grep -r "serviceRole\|service_role" src/pages/api/
```
Result should be empty for all `/api` files.

### CI/CD Validation
Add pre-commit hook:
```bash
if grep -r "SUPABASE_SERVICE_ROLE_KEY" src/pages/api/ 2>/dev/null; then
  echo "ERROR: Service role key found in API routes!"
  exit 1
fi
```

## Related Security Documents

- [RLS Policy Guide](./rls-policies.md)
- [Authentication Guide](./authentication.md)
- [API Security](./api-security.md)

## Incident Response

If service role key is suspected to be compromised:

1. **Immediately rotate the key** in Supabase dashboard
2. **Audit access logs** for suspicious activity
3. **Review user data** for unauthorized modifications
4. **Notify affected users** if data was accessed
5. **Update this policy** if new vulnerabilities found

---

**Remember**: If you can see it on the frontend or in an API route, it should NEVER be a service role key.
