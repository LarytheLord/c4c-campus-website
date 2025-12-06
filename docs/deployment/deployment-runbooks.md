# C4C Campus Deployment Runbooks

**Quick reference guides for common deployment scenarios**

---

## Runbook 1: Standard Production Deployment

### Pre-Deployment (30 minutes before)

**Objective**: Prepare for deployment and notify team

```bash
# 1. Verify prerequisites
npm run test                           # All unit tests pass
npm run test:integration              # All integration tests pass
npm audit                             # No critical vulnerabilities
npm run check                         # TypeScript compilation OK

# 2. Create backup
# Supabase Dashboard → Backups → "Backup Now"
# Wait for confirmation email

# 3. Notify team
# Post to #deployments Slack channel:
# "Production deployment starting in 30 minutes. Version X.Y.Z"

# 4. Prepare rollback script
git tag deployment-pre-$(date +%Y%m%d_%H%M%S) $(git rev-parse HEAD)
echo "Rollback tag: deployment-pre-$(date +%Y%m%d_%H%M%S)"
```

### During Deployment (10 minutes)

**Objective**: Build and deploy to production

```bash
# 1. Build
npm ci
npm run build
# Verify dist/ folder exists and has expected size
du -sh dist/  # Should be 1-5 MB for initial

# 2. Deploy
# Option A: Vercel
vercel --prod --token=$VERCEL_TOKEN

# Option B: Netlify
netlify deploy --prod --dir=dist

# Option C: Self-hosted
docker build -t c4c-campus:$(date +%Y%m%d_%H%M%S) .
docker push your-registry/c4c-campus:latest
kubectl rollout restart deployment/c4c-campus
```

### Immediate Post-Deployment (5 minutes)

**Objective**: Verify deployment succeeded

```bash
#!/bin/bash
# Run smoke tests
set -e

echo "Verifying deployment..."

# Health check
if curl -s https://c4ccampus.org/ | grep -q "C4C Campus"; then
  echo "✓ Application loaded"
else
  echo "✗ Application failed to load"
  exit 1
fi

# Check API
if curl -s https://c4ccampus.org/api/status | grep -q "ok"; then
  echo "✓ API responding"
else
  echo "✗ API failed"
  exit 1
fi

# Check database
if curl -s https://c4ccampus.org/api/db-health | grep -q "connected"; then
  echo "✓ Database connected"
else
  echo "✗ Database not responding"
  exit 1
fi

echo "Deployment successful! ✓"
```

### Extended Monitoring (4 hours post-deployment)

**Objective**: Ensure stability

```
Time | Action
-----|-------------------------------------------
Now  | Check error logs (Sentry dashboard)
+10min | Review performance metrics (Vercel Analytics)
+30min | Check user feedback (Discord, Support email)
+1h  | Full smoke test suite
+2h  | Performance baseline comparison
+4h  | Clear all-clear to team
```

**What to monitor for:**
- Error rate < 1%
- P95 response time < 500ms
- Database query time < 200ms
- No spike in 5xx errors

---

## Runbook 2: Emergency Rollback

### When to Rollback

**Trigger immediately if:**
- Application won't start (can't access any page)
- Error rate > 10% (>100 errors per minute)
- Database queries failing (>50% failure rate)
- Security vulnerability discovered

### Rollback Steps (5 minutes)

```bash
#!/bin/bash
# emergency-rollback.sh

set -e

SLACK_WEBHOOK=$SLACK_WEBHOOK_URL
PREVIOUS_VERSION="main~1"

echo "EMERGENCY ROLLBACK INITIATED"
echo "Rolling back to: $PREVIOUS_VERSION"

# 1. Notify team immediately
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🚨 ROLLBACK STARTED",
    "attachments": [{
      "color": "danger",
      "text": "Rolling back production to previous version"
    }]
  }'

# 2. Checkout previous version
git checkout $PREVIOUS_VERSION
echo "Checked out version: $(git describe --tags)"

# 3. Rebuild
npm ci --production
npm run build

# 4. Verify build succeeded
if [ ! -d "dist" ]; then
  echo "Build failed!"
  exit 1
fi

# 5. Deploy previous version
# Vercel
vercel --prod --token=$VERCEL_TOKEN

# 6. Wait for deployment
sleep 30

# 7. Verify rollback
if curl -s https://c4ccampus.org/ | grep -q "C4C Campus"; then
  echo "✓ Rollback successful"

  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d '{
      "text": "✓ ROLLBACK COMPLETE",
      "attachments": [{
        "color": "good",
        "text": "Production restored to previous version"
      }]
    }'

  exit 0
else
  echo "✗ Rollback verification failed"
  exit 1
fi
```

### Post-Rollback (30 minutes)

```
1. Notify team with status
2. Create incident report
3. Analyze what went wrong
4. Fix issue in development branch
5. Prepare for re-deployment
```

---

## Runbook 3: Database Migration

### Safe Database Migration Steps

```bash
#!/bin/bash
# safe-migration.sh

MIGRATION_FILE="migrations/001-new-feature.sql"
BACKUP_NAME="pre-migration-$(date +%Y%m%d_%H%M%S)"

# Step 1: Create backup
echo "Creating backup: $BACKUP_NAME"
pg_dump -h db.supabase.co -U postgres -d postgres \
  -F c -f "backups/$BACKUP_NAME.dump"

# Step 2: Verify backup
ls -lh "backups/$BACKUP_NAME.dump"

# Step 3: Test migration in staging
echo "Testing migration in staging..."
psql -h staging-db.supabase.co -U postgres -d postgres \
  < $MIGRATION_FILE

if [ $? -ne 0 ]; then
  echo "Migration failed in staging!"
  exit 1
fi

# Step 4: Verify staging still works
curl -I https://staging.c4ccampus.org/

# Step 5: Stop application (prevent writes)
echo "Stopping application..."
kubectl scale deployment c4c-campus --replicas=0

# Wait for graceful shutdown
sleep 5

# Step 6: Apply migration to production
echo "Applying migration to production..."
psql -h db.supabase.co -U postgres -d postgres \
  < $MIGRATION_FILE

if [ $? -ne 0 ]; then
  echo "Migration failed in production!"
  echo "Restoring from backup..."
  pg_restore -h db.supabase.co -U postgres -d postgres \
    "backups/$BACKUP_NAME.dump"
  kubectl scale deployment c4c-campus --replicas=3
  exit 1
fi

# Step 7: Restart application
echo "Restarting application..."
kubectl scale deployment c4c-campus --replicas=3

# Step 8: Verify migration
sleep 10
curl -I https://c4ccampus.org/

echo "Migration successful! ✓"
```

---

## Runbook 4: Scaling Application

### When to Scale

**Scale up if:**
- CPU usage > 80% for 5+ minutes
- Memory usage > 85%
- Request queue > 100 requests
- P95 response time > 1s

### Scale Vercel

Vercel automatically scales, no action needed.

Monitor at: vercel.com → Project Settings → Usage

### Scale Netlify

Netlify automatically scales, no action needed.

Monitor at: netlify.com → Site Analytics

### Scale Self-Hosted (Docker/Kubernetes)

```bash
# Check current resources
kubectl top nodes
kubectl top pods

# Scale deployment
kubectl scale deployment c4c-campus --replicas=5

# Monitor scaling
kubectl rollout status deployment/c4c-campus
watch kubectl get pods

# Set auto-scaling
kubectl autoscale deployment c4c-campus --min=3 --max=10 --cpu-percent=80

# Verify auto-scaling is working
kubectl get hpa
```

---

## Runbook 5: Performance Investigation

### When Performance is Slow

**Check in order:**

```bash
# 1. Check error rate
curl https://c4ccampus.org/api/health
# Should respond in <100ms

# 2. Check database
SELECT AVG(total_exec_time) / AVG(calls) as avg_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC LIMIT 5;

# 3. Check slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- > 1 second
ORDER BY mean_exec_time DESC;

# 4. Check missing indexes
SELECT schemaname, tablename
FROM pg_tables t
WHERE schemaname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_indexes i
  WHERE i.tablename = t.tablename
);

# 5. Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# 6. Check connections
SELECT count(*) FROM pg_stat_activity;
# If > 80 connections, investigate

# 7. Check replication lag (if using replicas)
SELECT * FROM pg_stat_replication;
```

### Fix Performance Issues

```bash
# Add indexes for slow queries
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

# Vacuum unused space
VACUUM ANALYZE;

# Kill long-running queries (if safe)
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - '10 minutes'::interval;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE ...;

# Scale resources
# Vercel: Automatically handles
# Self-hosted: Add more containers/instances
```

---

## Runbook 6: Security Incident Response

### If Credentials are Compromised

```bash
#!/bin/bash
# security-incident.sh

echo "SECURITY INCIDENT: Credentials Compromised"

# Step 1: Rotate Supabase keys
echo "1. Rotating Supabase credentials..."
# Dashboard → Settings → API Keys → Reveal → Regenerate
# This invalidates old keys, new keys start working immediately

# Step 2: Rotate n8n API key
echo "2. Rotating n8n API key..."
# n8n UI → Account → API Keys → Delete old → Create new

# Step 3: Update in deployment platform
echo "3. Updating deployment platform secrets..."
vercel env rm PUBLIC_SUPABASE_ANON_KEY
vercel env add PUBLIC_SUPABASE_ANON_KEY

# Step 4: Force re-authentication
echo "4. Invalidating user sessions..."
# This forces all users to log back in
UPDATE auth.sessions SET revoked = true WHERE revoked = false;

# Step 5: Review audit logs
echo "5. Checking for unauthorized access..."
# Supabase: Dashboard → Auth → Audit Logs
# Look for logins/actions from unusual IPs

# Step 6: Enable enhanced monitoring
echo "6. Enabling enhanced monitoring..."
# Sentry: Lower error rate alert threshold
# Database: Enable slow query logs
# Network: Enable WAF rules

# Step 7: Notify users
echo "7. Sending security notice to users..."
# Email template in incident response playbook

# Step 8: Create incident report
echo "Incident response complete. Document findings."
```

---

## Runbook 7: Database Backup & Restore

### Creating Manual Backup

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="backups"
BACKUP_NAME="c4c_campus_$(date +%Y%m%d_%H%M%S)"

mkdir -p $BACKUP_DIR

echo "Creating database backup: $BACKUP_NAME"

# Method 1: Supabase (via API)
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID/backups/request

# Method 2: PostgreSQL dump
pg_dump -h db.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f "$BACKUP_DIR/$BACKUP_NAME.dump"

# Method 3: Export to S3
pg_dump -h db.supabase.co -U postgres -d postgres | \
  aws s3 cp - s3://backups/c4c-campus/$BACKUP_NAME.sql

# Verify backup
ls -lh "$BACKUP_DIR/$BACKUP_NAME.dump"
echo "Backup created successfully"
```

### Restoring from Backup

```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE="${1:-backups/latest.dump}"

echo "Restoring database from: $BACKUP_FILE"

# WARNING: This will overwrite current database

read -p "Are you sure? Type 'YES' to confirm: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Restore cancelled"
  exit 1
fi

# Method 1: Full restore (overwrites everything)
pg_restore -h db.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  "$BACKUP_FILE"

# Method 2: Selective restore (specific tables)
pg_restore -h db.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  -t applications \
  "$BACKUP_FILE"

# Verify restore
psql -h db.supabase.co -U postgres -d postgres \
  -c "SELECT COUNT(*) FROM applications;"

echo "Restore complete"
```

---

## Runbook 8: Adding Feature Flags

### Deploying with Feature Flags

```javascript
// src/lib/features.ts
export const features = {
  DISCUSSIONS_ENABLED: process.env.FEATURE_DISCUSSIONS_ENABLED !== 'false',
  COHORTS_ENABLED: process.env.FEATURE_COHORTS_ENABLED !== 'false',
  PROGRESS_TRACKING_ENABLED: process.env.FEATURE_PROGRESS_TRACKING_ENABLED !== 'false',
};

export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}
```

```astro
// In component
---
import { isFeatureEnabled } from '../lib/features';

if (isFeatureEnabled('DISCUSSIONS_ENABLED')) {
  // Show discussions UI
}
---
```

### Deploying with Flag Disabled

```bash
# Step 1: Deploy new code with feature disabled by default
vercel env add FEATURE_NEW_FEATURE_ENABLED false
vercel --prod

# Step 2: Test in production (feature hidden)
# Verify nothing breaks

# Step 3: Enable feature progressively
vercel env rm FEATURE_NEW_FEATURE_ENABLED  # Use default (true)
vercel --prod

# Step 4: Monitor errors
# Check Sentry for any new errors
# If issues, revert to false and investigate
```

---

## Runbook 9: Handling Database Growth

### Monitor Database Size

```bash
#!/bin/bash
# monitor-db-growth.sh

# Check current size
SIZE_GB=$(curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID \
  | jq '.db_size / 1024 / 1024 / 1024')

echo "Current database size: $SIZE_GB GB"

# Set alert if approaching quota
QUOTA_GB=50  # Adjust based on plan
THRESHOLD_PERCENT=80

USAGE_PERCENT=$(echo "scale=0; ($SIZE_GB / $QUOTA_GB) * 100" | bc)

if [ $USAGE_PERCENT -gt $THRESHOLD_PERCENT ]; then
  echo "Database usage at $USAGE_PERCENT% of quota!"
  # Send alert to team
fi
```

### Archive Old Data

```sql
-- Create archive table
CREATE TABLE applications_archive AS
SELECT * FROM applications
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete from main table
DELETE FROM applications
WHERE created_at < NOW() - INTERVAL '1 year';

-- Vacuum to reclaim space
VACUUM ANALYZE;

-- Check space reclaimed
SELECT pg_size_pretty(pg_total_relation_size('applications'));
```

---

## Runbook 10: Updating Dependencies

### Safe Dependency Update

```bash
#!/bin/bash
# update-dependencies.sh

set -e

echo "Checking for updates..."
npm outdated

# Step 1: Update in development branch
git checkout -b deps/update-$(date +%Y%m%d)

# Step 2: Update dependencies
npm update

# Step 3: Check for breaking changes
npm audit
npm run check

# Step 4: Test thoroughly
npm run test
npm run test:integration
npm run build

# Step 5: Create PR
git add package*.json
git commit -m "chore: update dependencies"
git push -u origin deps/update-$(date +%Y%m%d)
# Create PR via GitHub

# Step 6: After PR merged, deploy
git checkout main
git pull
npm run build && vercel --prod
```

---

## Quick Reference Commands

```bash
# Deployment
npm run build            # Build for production
npm run test            # Run all tests
npm run test:integration # Integration tests
vercel --prod           # Deploy to Vercel
netlify deploy --prod   # Deploy to Netlify

# Database
psql -h db.supabase.co -U postgres  # Connect to database
\dt                     # List tables
\d+ applications        # Describe table
SELECT * FROM applications;  # Query data

# Monitoring
curl https://c4ccampus.org/api/health  # Health check
curl https://c4ccampus.org/api/status  # Status
curl -I https://c4ccampus.org/  # Headers

# Logs
vercel logs --tail      # Vercel logs
netlify logs:tail       # Netlify logs
docker logs c4c-campus  # Container logs

# Git
git log --oneline       # Recent commits
git diff main~1         # Changes since last deploy
git cherry-pick [hash]  # Apply specific commit
```

---

## Escalation Decision Tree

```
Issue detected ↓

Is application completely down? ↓
  Yes → P0 Incident, Call incident commander
  No ↓

Is error rate > 10%? ↓
  Yes → P1 Incident, Initiate rollback
  No ↓

Is a major feature broken? ↓
  Yes → P1 Incident, Create fix or rollback
  No ↓

Is there a security issue? ↓
  Yes → P0 Incident, Call security team
  No ↓

Is performance degraded > 50%? ↓
  Yes → P2 Incident, Investigate and fix
  No ↓

Schedule fix in next deployment
```

---

## Additional Resources

- [Main Deployment Guide](./production-guide.md)
- [Monitoring Setup](./monitoring-setup.md)
- [Disaster Recovery](./production-guide.md#disaster-recovery-plan)
- [Troubleshooting](./production-guide.md#troubleshooting)

**Last Updated**: October 29, 2025
