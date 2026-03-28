# Progress Tracking Integration Tests - Quick Reference

## Running the Tests

### Run All Progress Tracking Tests
```bash
npm run test:integration -- progress-tracking.test.ts
```

### Run with Coverage Report
```bash
npm run test:integration -- progress-tracking.test.ts --coverage
```

### Run Specific Test Category
```bash
# Run only cohort progress tests
npm run test:integration -- progress-tracking.test.ts -t "Cohort Progress"

# Run only video resume tests
npm run test:integration -- progress-tracking.test.ts -t "Video Resume"

# Run only performance benchmarks
npm run test:integration -- progress-tracking.test.ts -t "Performance"
```

### Run Single Test
```bash
npm run test:integration -- progress-tracking.test.ts -t "1.1 should track lesson completion"
```

---

## Test Categories

### 1. Cohort Progress Tracking (5 tests)
Tests cohort-scoped progress tracking with isolation between students.

**Key Files:**
- `lesson_progress` table with `cohort_id` column
- `cohort_enrollments` table with `progress` JSONB

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "1."`

---

### 2. Video Resume Functionality (4 tests)
Tests Netflix-style video resume (save position, auto-save every 10s).

**Key Fields:**
- `video_position_seconds` - Resume position
- `time_spent_seconds` - Total watch time
- `watch_count` - Number of times started

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "2."`

---

### 3. Materialized View (5 tests)
Tests `student_roster_view` for fast teacher dashboard queries.

**Performance Target:** <3 seconds refresh time

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "3."`

---

### 4. Progress Triggers (3 tests)
Tests auto-updating triggers (last_activity_at, completed_lessons).

**Triggers:**
- `trigger_update_activity` - Updates timestamp
- `trigger_increment_lessons` - Increments count

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "4."`

---

### 5. Aggregation Queries (4 tests)
Tests cohort analytics (averages, leaderboards, struggling students).

**Use Cases:**
- Teacher dashboards
- Student engagement reports
- Intervention alerts

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "5."`

---

### 6. Performance Benchmarks (4 tests)
Tests query performance with 500+ students per cohort.

**Targets:**
- Query time: <200ms
- View refresh: <3s
- Index usage: Verified
- Load test: <500ms

**Run:** `npm run test:integration -- progress-tracking.test.ts -t "6."`

---

## Expected Test Status

### Before Implementation
```
✗ All 29 tests FAILING (expected - TDD approach)
```

### After Schema Implementation
```
✓ All 29 tests PASSING
✓ Coverage: 95%+
✓ Performance: All benchmarks met
```

---

## Debugging Failed Tests

### Common Errors

#### 1. Table Not Found
```
relation "cohorts" does not exist
```
**Solution:** Run schema migrations from `TEST_REPORT_PROGRESS_TRACKING.md`

#### 2. Column Not Found
```
column "cohort_id" does not exist in table "lesson_progress"
```
**Solution:** Add `cohort_id` column:
```sql
ALTER TABLE lesson_progress
ADD COLUMN cohort_id UUID REFERENCES cohorts(id);
```

#### 3. Materialized View Not Found
```
relation "student_roster_view" does not exist
```
**Solution:** Create materialized view (see checklist in report)

#### 4. Function Not Found
```
function refresh_student_roster_view() does not exist
```
**Solution:** Create RPC function for view refresh

#### 5. Trigger Not Firing
```
last_activity_at not updated
```
**Solution:** Verify trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_activity';
```

---

## Test Data Setup

### Before Each Test
1. Authenticate test users (STUDENT_1, STUDENT_2)
2. Create test course with 5 lessons
3. Create test cohort (Fall 2025)
4. Clean state (no existing data)

### After Each Test
1. Delete test data in reverse dependency order
2. Refresh materialized view (if exists)

### Manual Cleanup (if needed)
```bash
npm run test:integration -- progress-tracking.test.ts --bail
```

---

## Performance Monitoring

### Measure Query Time
```typescript
const startTime = Date.now();
await supabaseAdmin.from('cohort_enrollments').select('*');
const queryTime = Date.now() - startTime;
console.log(`Query time: ${queryTime}ms`);
```

### Check Index Usage
```sql
EXPLAIN ANALYZE
SELECT * FROM cohort_enrollments WHERE cohort_id = 'xxx';
```

**Expected Output:**
```
Index Scan using idx_cohort_enrollments_cohort on cohort_enrollments
```

### Monitor View Refresh
```sql
SELECT schemaname, matviewname, last_refresh
FROM pg_matviews
WHERE matviewname = 'student_roster_view';
```

---

## Quick Verification Checklist

After implementing schema, verify:

- [ ] All tables exist
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('cohorts', 'cohort_enrollments', 'lesson_discussions', 'course_forums');
```

- [ ] All indexes exist
```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('cohort_enrollments', 'lesson_progress')
AND indexname LIKE 'idx_%cohort%';
```

- [ ] Materialized view exists
```sql
SELECT matviewname FROM pg_matviews WHERE matviewname = 'student_roster_view';
```

- [ ] Triggers exist
```sql
SELECT tgname FROM pg_trigger
WHERE tgname IN ('trigger_update_activity', 'trigger_increment_lessons');
```

- [ ] RLS policies active
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('cohorts', 'cohort_enrollments')
AND rowsecurity = true;
```

---

## Integration with CI/CD

### GitHub Actions (Example)
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

---

## Documentation References

- **Full Test Report:** `TEST_REPORT_PROGRESS_TRACKING.md`
- **Roadmap Task:** `ROADMAP.md` lines 107-133
- **Schema Design:** `docs/C4C_CAMPUS_PLATFORM_VISION.md` lines 209-236
- **Current Schema:** `schema.sql` lines 197-216

---

## Support

If tests are failing unexpectedly:

1. Check test output for specific error messages
2. Verify schema migrations were applied
3. Check test user accounts exist (`create-test-users.ts`)
4. Review `TEST_REPORT_PROGRESS_TRACKING.md` for implementation checklist
5. Check Supabase logs for database errors

---

**Last Updated:** October 29, 2025
**Test Suite Version:** 1.0.0
**Total Tests:** 25
**Expected Duration:** ~38 seconds
