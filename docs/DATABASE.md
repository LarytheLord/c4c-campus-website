# Database Management (Single-File Schema)

**schema.sql is the SINGLE SOURCE OF TRUTH.** One file defines everything: 34 tables, functions, views, RLS, indexes, triggers.

## Quick Start
1. Set `DATABASE_URL` in `.env` (from Supabase: Settings > Database > Connection String).
2. `npm run db:schema-apply` (backup + reset + validate).

## Workflow (All Envs)
```
flowchart TD
  A[Backup: npm run db:backup] --> B[Reset: npm run db:reset<br/>Applies schema.sql w/ DROPs]
  B --> C[Validate: npm run db:validate]
  C --> D[Types: npm run db:types<br/>+ npm run db:types:check]
  D --> E[Ready: Run tests]
```
- **db:reset**: DROPs everything (CASCADE, safe order), recreates clean schema. **DESTRUCTIVE—data lost!**
- No migrations needed—`schema.sql` handles all.

## Schema.sql Breakdown
- **Lines 1-112**: Warnings + DROP hierarchy (7 levels, children first).
- **Lines 113-2088**: Extensions, functions, tables, views (`student_roster_view`), RLS, indexes.
- **Run safely**: Always backup first. Use transactions for partial applies:
  ```sql
  BEGIN; \i schema.sql; COMMIT; -- or ROLLBACK;
  ```

## Schema-Code Synchronization

### Overview
The codebase uses `schema.sql` as the single source of truth for database structure. TypeScript types in `src/types/generated.ts` are auto-generated from the database schema using Supabase CLI.

### When to Regenerate Types

Regenerate types after ANY schema change:
- Adding/removing tables
- Adding/removing columns
- Changing column types
- Modifying constraints

### How to Regenerate Types

1. **Apply schema changes to database:**
   ```bash
   npm run db:schema-apply
   ```
   This backs up the database, applies schema.sql, and validates the result.

2. **Regenerate TypeScript types:**
   ```bash
   npm run db:types
   ```
   This generates `src/types/generated.ts` from the live database schema.

3. **Validate synchronization:**
   ```bash
   npm run db:validate:all
   ```
   This runs all validation checks:
   - Type definitions match schema
   - Field names in code match schema
   - Case conventions are consistent

4. **Run tests:**
   ```bash
   npm run test:integration
   ```
   Integration tests validate schema compliance.

### Validation Tools

| Tool | Purpose | When to Run | Exit on Error |
|------|---------|-------------|---------------|
| `npm run db:types` | Generate TypeScript types from database | After schema changes | No |
| `npm run db:types:check` | Validate generated.ts structure | Before commit, in CI | Yes |
| `npm run db:types:check:full` | Types check + field name scan | Comprehensive check | Yes |
| `npm run db:field-names:check` | Scan code for field name mismatches and schema-types alignment | Before commit, in CI | Yes |
| `npm run db:case:check` | Detect camelCase/snake_case issues | Before commit, in CI | Yes |
| `npm run db:validate` | Validate live DB against schema.sql | After schema apply | Yes |
| `npm run db:validate:all` | Run all validation checks | Before commit, in CI | Yes |
| `npm run test:integration` | Test schema compliance | After changes, in CI | Yes |

### Field Name Scanner Details

The `db:field-names:check` script performs three types of validation:

1. **camelCase → snake_case Issues**: Detects known camelCase field names (like `userId`) that should use snake_case (`user_id`).

2. **Field Not in Schema Issues**: Validates that field names used in Supabase queries exist in `schema.sql`. Uses Levenshtein distance to suggest possible corrections.

3. **Schema-Types Alignment**: Compares column names between `schema.sql` and `generated.ts` to ensure they're in sync. Reports discrepancies if generated types are out of date.

### CI/CD Integration

The CI workflow automatically validates schema-code synchronization on:
- Changes to `schema.sql`
- Changes to `src/types/**`
- Changes to API endpoints or components

**CI runs these checks as separate steps for clear reporting:**
1. `npm run db:types:check` - Validates generated.ts structure
2. `npm run db:field-names:check` - Scans code for field name issues
3. `npm run db:case:check` - Detects case convention mismatches

All checks must pass for the CI job to succeed. Failed validation blocks PR merges.

**Local development convenience:**
Use `npm run db:types:check:full` (or `npm run db:validate:all`) to run all checks with a single command.

### Field Naming Conventions

**Database Fields (schema.sql):**
- Use snake_case: `user_id`, `created_at`, `max_students`
- Match PostgreSQL conventions

**TypeScript Types (generated.ts):**
- Auto-generated, use snake_case to match database
- Import from `src/types/generated.ts`

**Code Usage:**
- Use snake_case in Supabase queries: `.eq('user_id', ...)`
- Use snake_case in object literals: `{ user_id: x, course_id: y }`
- TypeScript will enforce correct field names via generated types

### Common Pitfalls

**Don't use camelCase in database queries:**
```typescript
// WRONG
.select('userId, courseId')
.eq('createdAt', date)

// CORRECT
.select('user_id, course_id')
.eq('created_at', date)
```

**Don't manually edit generated.ts:**
```typescript
// WRONG - manual edits will be overwritten
// Edit src/types/generated.ts

// CORRECT - extend types in separate files
// Create src/types/custom.ts
```

**Don't skip validation after schema changes:**
```bash
# WRONG - skip validation
npm run db:types

# CORRECT - validate after regeneration
npm run db:types && npm run db:validate:all
```

## Verification Checklist
| Step | Command/Query | Expected |
|------|---------------|----------|
| Tables | `npm run db:validate` | 0 errors |
| Types | `npm run db:types:check` | Passed |
| Field Names | `npm run db:field-names:check` | Passed |
| Case Conventions | `npm run db:case:check` | Passed |
| All Validation | `npm run db:validate:all` | All passed |
| Tables exist | `SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';` | ~34 |
| Cohort_id | `SELECT column_name FROM information_schema.columns WHERE column_name='cohort_id';` | 7 rows (lesson_progress, etc.) |
| View | `SELECT * FROM pg_matviews WHERE matviewname='student_roster_view';` | 1 row |
| RLS | `SELECT tablename FROM pg_tables WHERE rowsecurity=true;` | All main tables |

## Troubleshooting
| Error | Cause | Fix |
|-------|-------|-----|
| `column "cohort_id" does not exist` (42703) | Schema not applied | `npm run db:reset` |
| `relation "X" does not exist` (42P01) | Table/view missing | `npm run db:schema-apply` |
| `permission denied` (RLS) | Policy block | Check role funcs (`is_admin()`), disable RLS temp: `ALTER TABLE X DISABLE ROW LEVEL SECURITY;` |
| `connection refused` | Wrong DATABASE_URL | Verify Supabase connection string, SSL: `{ rejectUnauthorized: false }` |
| Types mismatch | Manual edits | `npm run db:types` (never edit `generated.ts`) |
| Field not found | Misspelled or wrong case | Use snake_case, check schema.sql |
| Case convention error | camelCase in query | Change `userId` to `user_id` |

## Best Practices
- **Always**: Backup -> Reset -> Validate -> Types.
- **Changes**: Edit `schema.sql` -> Commit -> `db:schema-apply` -> Test.
- **Validation**: Run `npm run db:validate:all` before committing schema/type changes.
- **Field Names**: Always use snake_case for database fields in queries.
- **Prod/Staging**: Same as dev (no data yet). Later: Add targeted ALTER scripts if needed.
- **Supabase CLI**: `supabase db reset` for local dev.

See `schema.sql` header for dependency diagram.
