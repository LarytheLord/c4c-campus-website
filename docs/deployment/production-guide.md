# C4C Campus Production Deployment Guide

**Version**: 1.0.0
**Last Updated**: October 29, 2025
**Audience**: DevOps engineers, deployment managers, system administrators

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Architecture](#deployment-architecture)
4. [Database Migration Steps](#database-migration-steps)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Build and Deploy Steps](#build-and-deploy-steps)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring and Alerting](#monitoring-and-alerting)
10. [Disaster Recovery Plan](#disaster-recovery-plan)
11. [Performance Tuning](#performance-tuning)
12. [Security Hardening](#security-hardening)
13. [Troubleshooting](#troubleshooting)

---

## Overview

C4C Campus is a production Astro application serving the animal advocacy community with:

- **Frontend**: Astro 5.x server-side rendering application
- **Backend**: Supabase PostgreSQL database with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **Workflow Automation**: Optional n8n integration (cloud-hosted or self-hosted)
- **Storage**: Supabase Storage for videos, thumbnails, resources
- **Deployment Targets**: Vercel, Netlify, or self-hosted
- **CDN**: Global edge caching for static assets and dynamic content

### Key Deployment Characteristics

- **Uptime SLA**: 99.9% (target)
- **Response Time**: <200ms at p95
- **Build Time**: ~2-3 minutes
- **Database Size**: Starts at 100MB, grows with courses/discussions
- **Monthly Traffic**: Starts at ~10GB CDN bandwidth
- **Cost Estimate**: $50-200/month (variable based on usage)

---

## Pre-Deployment Checklist

### 1. Team & Access Verification

- [ ] All team members have production access credentials
- [ ] Team members with deployment access have multi-factor authentication (MFA) enabled
- [ ] Deployment access is rotated quarterly
- [ ] All production credentials are stored in secure vault (1Password, HashiCorp Vault)
- [ ] Incident response team is defined (on-call rotation)

### 2. Code & Testing

- [ ] All code changes merged to main branch via pull requests
- [ ] All tests passing: `npm run test` (unit/component tests)
- [ ] Integration tests passing: `npm run test:integration`
- [ ] Lighthouse performance score ≥95 for all metrics
- [ ] Security audit passed: `npm audit` shows no high/critical vulnerabilities
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge - current versions)
- [ ] Mobile responsive design verified across breakpoints
- [ ] Accessibility (a11y) compliance verified: WCAG 2.1 Level AA minimum

### 3. Database

- [ ] Current database backup created and tested
- [ ] Migration scripts validated in staging environment
- [ ] RLS policies reviewed and correct for production data
- [ ] Database has sufficient storage quota (check Supabase dashboard)
- [ ] Connection pooling configured for expected concurrent users
- [ ] Automated backup schedule confirmed (daily, 7-day retention minimum)

### 4. Infrastructure

- [ ] CDN configured and origin shielding enabled
- [ ] SSL/TLS certificates valid and not expiring in next 60 days
- [ ] DNS records verified (A, AAAA, CNAME records)
- [ ] Rate limiting configured for API endpoints
- [ ] DDoS protection enabled (Cloudflare if using)
- [ ] WAF rules configured for common attack patterns
- [ ] CORS headers properly configured

### 5. Environment & Configuration

- [ ] All environment variables documented and secured
- [ ] `.env` file not committed to version control
- [ ] Secret management system configured (GitHub Secrets, Vercel, etc.)
- [ ] Feature flags configured for rollout controls
- [ ] Logging and monitoring configured
- [ ] Error tracking configured (Sentry, DataDog, or similar)
- [ ] Analytics configured (privacy-respecting)

### 6. Documentation

- [ ] Runbooks written for common operations
- [ ] Deployment logs can be accessed
- [ ] Incident response procedures documented
- [ ] Rollback procedures tested and documented
- [ ] Team trained on deployment and rollback

### 7. Communication

- [ ] Deployment notification plan established
- [ ] Maintenance window communicated to users (if applicable)
- [ ] On-call engineer assigned for 4 hours post-deployment
- [ ] Slack/communication channels ready for deployment updates
- [ ] User support team notified of changes

---

## Deployment Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Users (Global)                          │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Cloudflare │   │  Edge Cache │   │   Origin   │
   │    CDN      │   │    (HTTP)    │   │   Server   │
   └──────┬──────┘   └──────┬───────┘   └──────┬─────┘
          └────────────────┬────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Vercel     │  │   Netlify    │  │  Self-Hosted │
│  Serverless  │  │  Functions   │  │   (Node.js)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌──────────┐  ┌──────────────┐  ┌──────────────┐
   │ Supabase │  │ Supabase     │  │ Optional:    │
   │   Auth   │  │   Database   │  │   n8n        │
   │          │  │  PostgreSQL  │  │ Workflows    │
   └──────────┘  └──────────────┘  └──────────────┘
                        │
                        ▼
                  ┌─────────────┐
                  │  Automated  │
                  │   Backups   │
                  │  (daily)    │
                  └─────────────┘
```

### Component Responsibilities

| Component | Responsibility | Redundancy |
|-----------|---|---|
| CDN | Distribute static assets globally, cache dynamic content | Multi-region (Cloudflare) |
| Application Server | Run Astro SSR, handle routing, API endpoints | Auto-scaling (Vercel/Netlify) or load balanced (self-hosted) |
| Database | Store all application data, handle RLS policies | Daily backups, Point-in-time recovery |
| Authentication | Manage user sessions, JWT tokens | Managed by Supabase (99.99% uptime) |
| Storage | Serve videos, thumbnails, course materials | Supabase Storage with CORS headers |
| Monitoring | Track errors, performance, availability | CloudWatch, DataDog, or self-hosted Prometheus |

---

## Database Migration Steps

### Pre-Migration Checklist

1. **Backup Current Database**
   ```bash
   # For Supabase: Use dashboard → Backups tab
   # Manually trigger backup and verify completion

   # Or via pg_dump (if self-hosted):
   pg_dump -h db.supabase.co \
     -U postgres \
     -d postgres \
     -v \
     -F c \
     -f db_backup_$(date +%Y%m%d_%H%M%S).dump
   ```

2. **Notify Users**
   - Post in Discord/Slack that maintenance window is starting
   - Set status page to "Maintenance in Progress"
   - Alert on-call team

3. **Disable Writes**
   - Stop application servers (or redirect to maintenance page)
   - Verify no background jobs are running
   - Check Supabase dashboard for active connections

### Migration Process

#### Step 1: Validate Migration Script

```bash
# Run migration script in dry-run mode
psql -h db.supabase.co -U postgres -d postgres \
  --echo-all \
  --dry-run \
  < migrations/001-production-schema.sql
```

#### Step 2: Create Pre-Migration Snapshot

For database migrations, create a snapshot before applying changes:

```sql
-- Example: Create snapshot of critical tables
CREATE TABLE IF NOT EXISTS schema_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  table_count INTEGER,
  row_count INTEGER
);

-- Capture row counts before migration
INSERT INTO schema_snapshots (snapshot_name, row_count, table_count)
SELECT
  'pre-migration-' || NOW()::DATE,
  SUM((SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public')),
  COUNT(*)
FROM pg_tables
WHERE schemaname = 'public';
```

#### Step 3: Apply Migration

```bash
# Apply migration to production database
psql -h db.supabase.co -U postgres -d postgres \
  --echo-all \
  < migrations/001-production-schema.sql

# Capture exit code
MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
  echo "Migration failed with code $MIGRATION_EXIT_CODE"
  # Trigger rollback (see Rollback section)
  exit 1
fi
```

#### Step 4: Post-Migration Validation

```sql
-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify indexes created
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public';

-- Verify RLS policies enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify data integrity
SELECT COUNT(*) as applications_count FROM applications;
SELECT COUNT(*) as users_count FROM auth.users;
SELECT COUNT(*) as enrollments_count FROM enrollments;
```

#### Step 5: Update Application

```bash
# Rebuild application with new database schema awareness
npm run build

# Deploy new version
npm run deploy
```

### Migration Rollback (If Needed)

```bash
# Restore from pre-migration backup
psql -h db.supabase.co -U postgres -d postgres < db_backup.dump

# Verify restoration
psql -h db.supabase.co -U postgres -d postgres \
  -c "SELECT COUNT(*) FROM applications;"

# Redeploy old application version
git checkout main~1
npm run build
npm run deploy
```

---

## Environment Variables Setup

### Production Environment Variables

Create `.env.production` with the following variables. **Never commit this file.**

```bash
# ============================================================================
# REQUIRED: Supabase Configuration (Database, Auth, Storage)
# ============================================================================

# Supabase Project URL (public, safe to expose)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public, safe to expose)
# Used for client-side authentication and data access
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (SENSITIVE - server-side only)
# NEVER expose this in frontend code
# Used for admin operations (creating users, managing roles, etc.)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# OPTIONAL: n8n Workflow Automation Configuration
# ============================================================================

# n8n Cloud Instance URL
PUBLIC_N8N_URL=https://your-instance.app.n8n.cloud

# n8n API Key for programmatic access
N8N_API_KEY=your_n8n_api_key_here

# Only if self-hosting n8n in Docker
# N8N_POSTGRES_PASSWORD=very_strong_random_password
# N8N_ENCRYPTION_KEY=very_strong_random_encryption_key
# N8N_SMTP_HOST=smtp.gmail.com
# N8N_SMTP_PORT=587
# N8N_SMTP_USER=your-email@gmail.com
# N8N_SMTP_PASS=your_app_password
# N8N_SMTP_SENDER=noreply@codeforcompassion.com

# ============================================================================
# OPTIONAL: Email & Communication
# ============================================================================

# Resend API Key (for transactional emails)
RESEND_API_KEY=re_your_api_key_here

# ============================================================================
# OPTIONAL: Media & CDN Configuration
# ============================================================================

# Cloudflare Stream API (for video hosting at scale)
# Only needed when migrating from Supabase Storage to Cloudflare Stream
# CLOUDFLARE_ACCOUNT_ID=your_account_id
# CLOUDFLARE_API_TOKEN=your_api_token

# ============================================================================
# REQUIRED: Site Configuration
# ============================================================================

# Site URL for canonical links and redirects
SITE_URL=https://c4ccampus.org

# ============================================================================
# OPTIONAL: Monitoring & Observability
# ============================================================================

# Sentry Error Tracking (optional, but recommended for production)
# SENTRY_DSN=https://your_key@sentry.io/project_id

# DataDog APM (optional)
# DATADOG_API_KEY=your_datadog_api_key

# ============================================================================
# OPTIONAL: Analytics (Privacy-Respecting)
# ============================================================================

# Plausible Analytics (optional, privacy-friendly)
# PLAUSIBLE_DOMAIN=c4ccampus.org

# ============================================================================
# NODE ENVIRONMENT
# ============================================================================
NODE_ENV=production
```

### Setting Environment Variables in Deployment Platform

#### Vercel

```bash
# Via Vercel CLI
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PUBLIC_N8N_URL
vercel env add N8N_API_KEY

# Or via Vercel Dashboard:
# 1. Go to Project Settings → Environment Variables
# 2. Add each variable (mark sensitive ones with checkmark)
# 3. Select which environments: Development, Preview, Production
```

#### Netlify

```bash
# Via Netlify CLI
netlify env:set PUBLIC_SUPABASE_URL "https://..."
netlify env:set PUBLIC_SUPABASE_ANON_KEY "..."
netlify env:set SUPABASE_SERVICE_ROLE_KEY "..."

# Or via Netlify UI:
# 1. Site Settings → Build & Deploy → Environment
# 2. Click "Edit variables"
# 3. Add each variable with values
```

#### Self-Hosted (Docker/PM2)

```bash
# Create .env.production file
cp .env.example .env.production

# Edit with sensitive values
nano .env.production

# Source in deployment script
set -a
source .env.production
set +a

# Verify no secrets in logs
node server.js 2>&1 | grep -i "supabase\|secret\|key" || echo "No secrets in logs"
```

### Secrets Management Best Practices

1. **Use Platform-Native Secrets**
   - Vercel: Project Settings → Environment Variables (marked "Sensitive")
   - Netlify: Environment variables with encryption
   - Self-hosted: Use HashiCorp Vault or AWS Secrets Manager

2. **Rotate Secrets Quarterly**
   - Set calendar reminder for secret rotation
   - Update Supabase keys: Dashboard → Settings → API Keys
   - Update n8n API keys: Sidebar → Account Settings → API Keys

3. **Audit Secret Access**
   - Enable secret access logging
   - Review logs for unauthorized access attempts
   - Investigate unusual patterns immediately

4. **Isolate Sensitive Secrets**
   - Use different keys for staging vs. production
   - Use different Supabase projects for staging vs. production
   - Never use production keys in development

---

## Build and Deploy Steps

### Automated Build Pipeline

#### Option 1: Vercel (Recommended)

```bash
# 1. Connect GitHub repository to Vercel
# Go to https://vercel.com/new and select your repo

# 2. Vercel will automatically:
#    - Run npm run build
#    - Deploy dist/ folder
#    - Create preview deployments for PRs
#    - Create production deployment on main branch push

# 3. Configure environment variables (see previous section)

# 4. (Optional) Customize build via vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "env": ["PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY"]
}
```

#### Option 2: Netlify

```bash
# 1. Connect GitHub repository to Netlify
# Go to https://app.netlify.com and "New site from Git"

# 2. Configure build settings:
#    Build command: npm run build
#    Publish directory: dist

# 3. Configure environment variables (see previous section)

# 4. (Optional) Customize via netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Option 3: Self-Hosted Docker

```dockerfile
# Dockerfile for production deployment
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Security: Run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "--experimental-modules", "./dist/server/entry.mjs"]
```

```bash
# Build and push
docker build -t your-registry/c4c-campus:latest .
docker push your-registry/c4c-campus:latest

# Deploy
docker run \
  --name c4c-campus \
  -p 3000:3000 \
  -e PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
  -e PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -v /var/log/c4c-campus:/app/logs \
  --restart unless-stopped \
  your-registry/c4c-campus:latest
```

### Manual Build & Deployment

```bash
# Step 1: Clean and install dependencies
rm -rf node_modules dist
npm ci  # Use 'ci' instead of 'install' for reproducible builds

# Step 2: Run tests
npm run test
npm run test:integration

# Step 3: Build for production
npm run build

# Verify build output
ls -lah dist/
du -sh dist/  # Check size (should be < 1MB for initial)

# Step 4: Upload to hosting
# Option A: Vercel
vercel --prod

# Option B: Netlify
netlify deploy --prod --dir=dist

# Option C: Self-hosted
rsync -avz --delete dist/ deploy@server:/var/www/c4c-campus/
ssh deploy@server "sudo systemctl restart c4c-campus"
```

### CI/CD Pipeline Example (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allow manual deployments

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run check

      - name: Run tests
        run: npm run test

      - name: Run integration tests
        run: npm run test:integration
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Build application
        run: npm run build

      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/ | cut -f1)
          LIMIT=$((5 * 1024 * 1024))  # 5MB limit
          if [ $SIZE -gt $LIMIT ]; then
            echo "Bundle size ($SIZE bytes) exceeds limit ($LIMIT bytes)"
            exit 1
          fi

      - name: Deploy to production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token=$VERCEL_TOKEN

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment ${{ job.status }}: ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Production deployment ${{ job.status }}\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Post-Deployment Verification

### 1. Application Health Checks

```bash
# Check application is responding
curl -I https://c4ccampus.org/
# Expected: HTTP 200

# Check API endpoints
curl https://c4ccampus.org/api/health
curl https://c4ccampus.org/api/status

# Check static assets loaded
curl -I https://c4ccampus.org/_astro/index.*.js
# Expected: HTTP 200 with Cache-Control headers
```

### 2. Database Connectivity

```bash
# Verify Supabase connection
curl -X POST \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  https://your-project.supabase.co/rest/v1/applications?select=count

# Expected: Returns count of applications
```

### 3. RLS Policies Verification

```sql
-- Connect to production database
psql -h db.supabase.co -U postgres -d postgres

-- Verify RLS is enabled on critical tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected output (rowsecurity should be 't' for all):
-- applications     | t
-- enrollments      | t
-- lesson_progress  | t
-- etc.
```

### 4. Authentication Test

```bash
# Test Supabase Auth integration
curl -X POST \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test_password_123"
  }' \
  https://your-project.supabase.co/auth/v1/signup

# Expected: User created or "User already exists" error
```

### 5. Performance Verification

```bash
# Lighthouse test (requires Chrome)
npm run build && npm run preview &
npx lighthouse https://localhost:3000/ --chrome-flags="--headless --no-sandbox"

# Expected scores:
# Performance: ≥95
# Accessibility: ≥95
# Best Practices: ≥95
# SEO: ≥95

# Alternative: Use WebPageTest
# https://www.webpagetest.org/?url=https://c4ccampus.org
```

### 6. Security Checks

```bash
# Check HTTPS enforced
curl -I http://c4ccampus.org/
# Expected: HTTP 301/302 redirect to https://

# Check security headers
curl -I https://c4ccampus.org/ | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options"
# Expected:
# Strict-Transport-Security: max-age=31536000
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff

# Check CSP policy
curl -I https://c4ccampus.org/ | grep Content-Security-Policy
```

### 7. CDN & Caching Verification

```bash
# Verify CDN serving content
curl -v https://c4ccampus.org/_astro/index.*.js 2>&1 | grep -E "CF-Cache-Status|X-Cache|Age"
# Expected: HIT or FRESH (indicates CDN caching)

# Verify cache headers
curl -I https://c4ccampus.org/ | grep Cache-Control
# Expected: Cache-Control: public, max-age=3600
```

### 8. Smoke Test Script

```bash
#!/bin/bash
# production-smoke-tests.sh

set -e

DOMAIN="https://c4ccampus.org"
FAILED=0

echo "Running smoke tests against $DOMAIN..."

# Test 1: Homepage loads
if curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/" | grep -q "200"; then
  echo "✓ Homepage loads (HTTP 200)"
else
  echo "✗ Homepage failed"
  FAILED=$((FAILED + 1))
fi

# Test 2: API health endpoint
if curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/health" | grep -q "200"; then
  echo "✓ API health endpoint responds"
else
  echo "✗ API health endpoint failed"
  FAILED=$((FAILED + 1))
fi

# Test 3: Database connectivity
if curl -s "$DOMAIN/api/status" | grep -q "database.*connected"; then
  echo "✓ Database connected"
else
  echo "✗ Database connection failed"
  FAILED=$((FAILED + 1))
fi

# Test 4: Static assets cached
if curl -s -I "$DOMAIN/_astro/index.js" | grep -qE "Cache-Control|Age"; then
  echo "✓ Static assets cached"
else
  echo "✗ Caching headers missing"
  FAILED=$((FAILED + 1))
fi

# Test 5: HTTPS redirect
if curl -s -o /dev/null -w "%{http_code}" "http://c4ccampus.org/" | grep -qE "30[12]"; then
  echo "✓ HTTPS redirect working"
else
  echo "✗ HTTPS redirect failed"
  FAILED=$((FAILED + 1))
fi

if [ $FAILED -eq 0 ]; then
  echo ""
  echo "All smoke tests passed ✓"
  exit 0
else
  echo ""
  echo "$FAILED smoke test(s) failed ✗"
  exit 1
fi
```

```bash
chmod +x production-smoke-tests.sh
./production-smoke-tests.sh
```

---

## Rollback Procedures

### Scenario 1: Immediate Rollback (Critical Bug Found)

```bash
#!/bin/bash
# rollback.sh

ENVIRONMENT="production"
PREVIOUS_VERSION="main~1"

echo "Rolling back $ENVIRONMENT to $PREVIOUS_VERSION..."

# Step 1: Notify team
echo "Notifying team of rollback..."
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "ROLLBACK INITIATED: Rolling back to previous production version"}'

# Step 2: Revert to previous commit
git checkout $PREVIOUS_VERSION
git log -1 --oneline

# Step 3: Rebuild and redeploy
npm ci
npm run build

# Step 4: Deploy to production
if [ "$DEPLOY_PLATFORM" = "vercel" ]; then
  vercel --prod --token=$VERCEL_TOKEN
elif [ "$DEPLOY_PLATFORM" = "netlify" ]; then
  netlify deploy --prod --dir=dist
fi

# Step 5: Verify deployment
sleep 30
./production-smoke-tests.sh

if [ $? -eq 0 ]; then
  echo "Rollback successful ✓"
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{"text": "ROLLBACK COMPLETE: Production restored to previous version"}'
  exit 0
else
  echo "Rollback verification failed ✗"
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{"text": "ROLLBACK FAILED: Verification checks did not pass. Manual intervention required."}'
  exit 1
fi
```

### Scenario 2: Database Rollback

```bash
#!/bin/bash
# database-rollback.sh

BACKUP_DATE="${1:-latest}"

echo "Rolling back database to backup: $BACKUP_DATE"

# Step 1: Verify backup exists
echo "Checking backup availability..."
# For Supabase: Check via API
BACKUP_ID=$(curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID/backups \
  | jq -r ".backups[] | select(.name | contains(\"$BACKUP_DATE\")) | .id" \
  | head -1)

if [ -z "$BACKUP_ID" ]; then
  echo "Backup not found for date: $BACKUP_DATE"
  exit 1
fi

# Step 2: Notify users
echo "Notifying users of database restore..."
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"DATABASE RESTORE: Restoring database from $BACKUP_DATE\"}"

# Step 3: Stop application (prevent writes)
echo "Stopping application to prevent writes..."
# This depends on your deployment platform

# Step 4: Restore database
echo "Restoring database from backup..."
# For Supabase, use dashboard or API
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID/backups/$BACKUP_ID/restore

# Step 5: Wait for restore to complete
echo "Waiting for restore to complete..."
sleep 60

# Step 6: Verify data integrity
echo "Verifying data integrity..."
APPS_COUNT=$(curl -s \
  -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/applications?select=count \
  | jq '.count')

echo "Applications count: $APPS_COUNT"

# Step 7: Restart application
echo "Restarting application..."
# Deployment-specific restart command

# Step 8: Run verification
./production-smoke-tests.sh

if [ $? -eq 0 ]; then
  echo "Database rollback successful ✓"
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"DATABASE RESTORE COMPLETE: Data restored from $BACKUP_DATE\"}"
else
  echo "Database rollback verification failed ✗"
  exit 1
fi
```

### Scenario 3: Feature Rollback (Keep App Version)

```bash
# Use feature flags to disable problematic features
# Example: Disable discussions system if it's causing issues

# Option 1: Environment variable flag
export FEATURE_DISCUSSIONS_ENABLED=false

# Restart application
npm run build && npm run preview

# Option 2: Database feature flag table
psql -h db.supabase.co -U postgres -d postgres << EOF
UPDATE feature_flags
SET enabled = false
WHERE feature_name = 'discussions_system';
EOF

# Verify flag disabled
curl https://c4ccampus.org/api/features
# Should show discussions_system: false
```

### Rollback Decision Tree

```
Is application broken?
├─ YES (pages not loading) → Use code rollback (Scenario 1)
├─ NO → Continue

Is database corrupted?
├─ YES (data inconsistency) → Use database rollback (Scenario 2)
├─ NO → Continue

Is specific feature broken?
├─ YES → Use feature flag rollback (Scenario 3)
├─ NO → Investigate and fix in new release

Has production been in broken state > 15 minutes?
├─ YES → Escalate to incident commander
├─ NO → Continue troubleshooting
```

---

## Monitoring and Alerting

### 1. Application Monitoring Setup

#### Using Sentry for Error Tracking

```bash
# Step 1: Install Sentry
npm install @sentry/astro

# Step 2: Configure in astro.config.mjs
import Sentry from "@sentry/astro";

export default defineConfig({
  integrations: [
    Sentry({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    })
  ]
});

# Step 3: Set environment variable
export SENTRY_DSN="https://your_key@sentry.io/project_id"
```

#### Dashboard Configuration

In Sentry Dashboard:

- Create alerts for:
  - Error rate > 1% in last 5 minutes
  - New issue detected
  - Release health: Crash-free sessions < 99%
  - Performance: Transaction duration > 2s

#### Notification Channels

Configure notifications to:
- Slack: #incidents channel
- Email: ops@codeforcompassion.com
- PagerDuty: For critical issues (P1)

### 2. Database Monitoring

```sql
-- Create monitoring views
CREATE VIEW database_health AS
SELECT
  (SELECT COUNT(*) FROM applications) as applications_total,
  (SELECT COUNT(*) FROM enrollments) as enrollments_total,
  (SELECT COUNT(*) FROM auth.users) as users_total,
  pg_database_size(current_database()) as database_size_bytes,
  NOW() as checked_at;

-- Monitor connection count
SELECT
  count(*) as connection_count,
  state,
  application_name
FROM pg_stat_activity
GROUP BY state, application_name;

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Set Supabase Alerts

In Supabase Dashboard → Monitoring:

- Database connection usage > 80%
- Disk usage > 80%
- CPU usage > 80%
- Database query duration > 5s (count)

### 3. Performance Monitoring

```javascript
// Add to your Astro layout
<script>
  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(metric => console.log('CLS:', metric.value));
    getFID(metric => console.log('FID:', metric.value));
    getFCP(metric => console.log('FCP:', metric.value));
    getLCP(metric => console.log('LCP:', metric.value));
    getTTFB(metric => console.log('TTFB:', metric.value));

    // Send to monitoring service
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'web_vitals',
        metric: metric.name,
        value: metric.value,
      });
    }
  });
</script>
```

Key Metrics to Monitor:

| Metric | Target | Alert If |
|--------|--------|----------|
| First Contentful Paint (FCP) | <1.8s | >2.5s |
| Largest Contentful Paint (LCP) | <2.5s | >4s |
| Cumulative Layout Shift (CLS) | <0.1 | >0.25 |
| Time to First Byte (TTFB) | <600ms | >800ms |
| Core Web Vitals Score | ≥90 | <75 |

### 4. Infrastructure Monitoring (Self-Hosted)

```bash
# Using Prometheus + Grafana for self-hosted deployments

# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'c4c-campus'
    static_configs:
      - targets: ['localhost:3000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
```

### 5. Alert Rules

```yaml
# alert-rules.yml
groups:
  - name: c4c-campus-alerts
    rules:
      # Application
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate detected"
          dashboard: "https://sentry.io/..."

      - alert: ApplicationDown
        expr: up{job="c4c-campus"} == 0
        for: 1m
        annotations:
          summary: "Application is down"
          severity: critical

      # Database
      - alert: HighDatabaseLoad
        expr: pg_stat_activity_count > 80
        for: 5m
        annotations:
          summary: "Database connection pool nearly full"

      - alert: SlowQueries
        expr: rate(pg_stat_statements_mean_exec_time[5m]) > 5000
        for: 5m
        annotations:
          summary: "Slow database queries detected"

      # Infrastructure (self-hosted)
      - alert: HighCPUUsage
        expr: node_cpu_usage > 0.8
        for: 5m
        annotations:
          summary: "High CPU usage detected"

      - alert: HighMemoryUsage
        expr: node_memory_usage > 0.85
        for: 5m
        annotations:
          summary: "High memory usage detected"

      - alert: DiskUsageHigh
        expr: node_disk_usage > 0.85
        for: 10m
        annotations:
          summary: "Disk usage above 85%"
```

### 6. Logging Configuration

```javascript
// Configure application logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Log key events
logger.info({ event: 'deployment', version: process.env.APP_VERSION });
logger.info({ event: 'database_connected', host: process.env.DB_HOST });
logger.warn({ event: 'high_latency', duration_ms: 1500 });
logger.error({ event: 'authentication_failure', error: err.message });

// Send logs to centralized service
// Example: DataDog, CloudWatch, Splunk
```

### 7. On-Call Runbook

**On-Call Engineer Responsibilities:**

- Monitor alerts 24/7 during on-call period
- Respond to critical alerts within 5 minutes
- Attempt quick fix or escalate to team lead
- Document all incidents in incident tracker
- Post-incident: Write RCA and preventive measures

**Alert Response Matrix:**

| Alert | Response Time | Action |
|-------|---|---|
| Application Down | 5 min | Rollback or restart |
| High Error Rate | 15 min | Check logs, fix or rollback |
| High Database Load | 15 min | Optimize query or scale database |
| High CPU Usage | 30 min | Scale infrastructure |
| Slow Queries | 30 min | Analyze and optimize |

---

## Disaster Recovery Plan

### 1. Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

| Scenario | RTO | RPO | Impact |
|----------|---|---|--------|
| Application Crash | 5 min | 15 min | Complete outage |
| Database Failure | 15 min | 1 hour | Data loss (max 1 hour) |
| Region Outage | 30 min | 24 hours | Geographic failure |
| Complete Data Loss | 24 hours | 24 hours | Worst case scenario |

### 2. Backup Strategy

```bash
# Automated Daily Backups (Supabase)
# Configured in Supabase Dashboard → Backups

# Backup retention: 14 days (free tier) or 35 days (pro tier)
# Backup frequency: Daily at 2:00 AM UTC

# Verify backups
curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID/backups | jq '.backups[] | {name, created_at, size}'
```

### 3. Disaster Scenarios and Recovery

#### Scenario A: Application Server Crash

```bash
# Symptoms:
# - Application not responding
# - HTTP 502/503 errors

# Recovery:
# Step 1: Trigger automatic restart (if using managed platforms)
# For Vercel: Automatic (no action needed)
# For Netlify: Automatic (no action needed)
# For self-hosted: systemctl restart c4c-campus

# Step 2: Verify recovery
curl -I https://c4ccampus.org/
# Expected: HTTP 200

# Step 3: Check error logs
# Vercel: go.vercel.app → Deployments → Logs
# Self-hosted: journalctl -u c4c-campus -n 100
```

#### Scenario B: Database Corruption

```sql
-- Step 1: Identify corruption
-- Check table constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'applications';

-- Check for orphaned foreign keys
SELECT a.id FROM applications a
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = a.user_id
);

-- Step 2: Backup corrupted data (for analysis)
pg_dump -h db.supabase.co -U postgres -d postgres -t applications \
  > corrupted_applications_backup.sql

-- Step 3: Fix specific rows (if possible)
DELETE FROM applications WHERE user_id IS NULL;

-- Step 4: If corruption is widespread, restore from backup (see previous section)
```

#### Scenario C: Complete Data Loss

```bash
#!/bin/bash
# complete-recovery.sh

echo "Executing complete recovery procedure..."

# Step 1: Identify latest good backup
BACKUP_DATE=$(curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$PROJECT_ID/backups \
  | jq -r '.backups[0].created_at')

echo "Using backup from: $BACKUP_DATE"

# Step 2: Provision new database instance
echo "Creating new database instance..."
# This would depend on your infrastructure as code

# Step 3: Restore data from backup
echo "Restoring data..."
psql -h new-db.supabase.co -U postgres -d postgres < $BACKUP_FILE

# Step 4: Update connection strings
export PUBLIC_SUPABASE_URL="https://new-db.supabase.co"
npm run build && vercel --prod

# Step 5: Verify data integrity
APPS_COUNT=$(curl -s https://c4ccampus.org/api/applications | jq '.count')
echo "Applications restored: $APPS_COUNT"

# Step 6: Notify stakeholders
echo "Recovery complete. Data restored from $BACKUP_DATE"
```

#### Scenario D: Security Breach (Compromised Credentials)

```bash
#!/bin/bash
# security-incident-response.sh

echo "Incident Response: Compromised Credentials"

# Step 1: Immediately rotate compromised credentials
# Do NOT use compromised credentials below

echo "Step 1: Rotating credentials..."
# Supabase: Generate new API keys
# Screenshot/bookmark current keys first for reference
# Dashboard → Settings → API Keys → Reveal Secret → Copy & Regenerate

# n8n: Regenerate API key
# Settings → Account Settings → API Keys → Delete old → Create new

# Step 2: Update application environment
echo "Step 2: Updating application secrets..."
# Update in Vercel/Netlify/self-hosted environment

# Step 3: Force re-authentication
# Add logout trigger to reset JWT tokens
# Update session expiry to 15 minutes (or less)

# Step 4: Review audit logs
echo "Step 3: Reviewing audit logs..."
# Supabase: Auth → Audit Logs
# Check for unauthorized access attempts

# Step 5: Enable enhanced monitoring
# Sentry: Lower error threshold
# Database: Enable query logging

# Step 6: Notify users (if data breach confirmed)
# Send security notice via email
# Recommend password change

# Step 7: Escalate to incident commander
echo "Incident escalated to incident commander"
```

### 4. Disaster Recovery Drill Schedule

```
# Quarterly DR Drills (every 90 days)

Q1: Database Restoration Drill
- Restore from 1-week old backup to staging
- Verify data integrity
- Measure RTO

Q2: Application Recovery Drill
- Simulate app server failure
- Trigger rollback procedure
- Measure RTO

Q3: Security Incident Drill
- Simulate credential compromise
- Rotate credentials
- Review incident response

Q4: Full DR Drill
- Simulate multi-component failure
- Test complete recovery procedure
- Document findings

Schedule reminders:
- Start: First Monday of quarter month
- Duration: 2 hours
- Participants: Ops team, incident commander, 1 developer
```

### 5. Disaster Recovery Communication Plan

**Internal Communication:**
1. Incident announced in #incidents Slack channel
2. Status page updated (https://status.c4ccampus.org)
3. Email notification sent to subscribers
4. Daily updates posted to team

**External Communication:**
1. User notification email: "We're experiencing issues with the platform"
2. Status page: Estimated time to resolution
3. Social media: Links to status page
4. Follow-up: Root cause analysis sent once issue resolved

**Template Messages:**

```
Subject: C4C Campus Platform Status Update

We're currently experiencing [ISSUE DESCRIPTION] affecting [COMPONENTS].
We're working to resolve this as quickly as possible.

Current Status: [IN PROGRESS / PARTIALLY RESOLVED]
Estimated Resolution: [TIME]
Last Updated: [TIMESTAMP]

Updates: https://status.c4ccampus.org
Support: support@codeforcompassion.com
```

---

## Performance Tuning

### 1. Frontend Optimization

```bash
# Measure current performance
npm run build && npm run preview
# Open https://localhost:3000 in Chrome DevTools
# Check Lighthouse scores

# Enable compression
# In astro.config.mjs
export default defineConfig({
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  }
});

# Optimize images (next-gen formats)
# Install sharp for image optimization
npm install --save-dev sharp

# Code splitting for large pages
import { lazy } from 'react';

const DiscussionThread = lazy(() =>
  import('../components/DiscussionThread')
);
```

### 2. Database Query Optimization

```sql
-- Analyze slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course
ON enrollments(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson
ON lesson_progress(user_id, lesson_id)
WHERE status = 'in_progress';

-- Optimize RLS policies
-- Use indexed columns in WHERE clauses
-- Example: WHERE auth.uid() = user_id (indexed on user_id)

-- Verify query plans
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM enrollments WHERE user_id = 'abc123';
```

### 3. CDN Optimization

```javascript
// Set appropriate cache headers
// In astro.config.mjs or middleware

export function onRequest(context, next) {
  const response = next();

  // Cache static assets for 1 year (with fingerprinting)
  if (context.request.url.includes('/_astro/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache HTML pages for 1 hour
  if (context.request.url.endsWith('.html') || context.request.url.endsWith('/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600');
  }

  // Cache API responses for 5 minutes
  if (context.request.url.includes('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300');
  }

  return response;
}
```

### 4. Database Connection Pooling

```javascript
// For self-hosted deployments using PgBouncer
// pgbouncer.ini

[databases]
c4c_campus = host=localhost port=5432 dbname=c4c_campus

[pgbouncer]
pool_mode = transaction  # or session
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3

# Verify pooling
psql -h localhost -p 6432 -U postgres -d pgbouncer -c "show pools;"
```

---

## Security Hardening

### 1. Environment Security

```bash
# Ensure no secrets in Git history
git-secrets --install
git secrets --register-aws
git secrets --scan

# Audit dependencies for vulnerabilities
npm audit
npm audit fix

# Regular security updates
npm update  # Updates minor versions
npm outdated  # Check for updates
```

### 2. Application Security Headers

```javascript
// In netlify.toml or vercel.json
// Set security headers via platform configuration

headers = [
  {
    "key": "Strict-Transport-Security",
    "value": "max-age=31536000; includeSubDomains; preload"
  },
  {
    "key": "X-Content-Type-Options",
    "value": "nosniff"
  },
  {
    "key": "X-Frame-Options",
    "value": "DENY"
  },
  {
    "key": "X-XSS-Protection",
    "value": "1; mode=block"
  },
  {
    "key": "Referrer-Policy",
    "value": "strict-origin-when-cross-origin"
  },
  {
    "key": "Permissions-Policy",
    "value": "geolocation=(), microphone=(), camera=()"
  }
]
```

### 3. Database Security

```sql
-- Restrict public access
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON SCHEMAS public TO "authenticated" ONLY;

-- Create separate roles
CREATE ROLE app_readonly WITH NOLOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

CREATE ROLE app_readwrite WITH NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;

-- Audit sensitive operations
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT,
  operation TEXT,
  user_id UUID,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
  VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. API Security

```javascript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export async function POST(context) {
  return limiter(context);
}

// Request validation
import { z } from 'zod';

const applicationSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  motivation: z.string().min(10).max(5000),
});

// CORS
import cors from 'cors';

const corsOptions = {
  origin: ['https://c4ccampus.org', 'https://www.c4ccampus.org'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Application fails to start

**Error Symptoms:**
```
Error: Cannot find module 'astro/runtime'
Application crashed
```

**Solutions:**
```bash
# Step 1: Check Node version
node --version  # Should be ≥18

# Step 2: Reinstall dependencies
rm -rf node_modules package-lock.json
npm ci  # Use ci instead of install

# Step 3: Clear build cache
rm -rf .astro dist

# Step 4: Rebuild
npm run build

# Step 5: Check environment variables
npm run build -- --debug
```

#### Issue 2: Database connection timeout

**Error Symptoms:**
```
connect ECONNREFUSED 127.0.0.1:5432
Supabase connection timeout
```

**Solutions:**
```bash
# Step 1: Verify Supabase is running
curl https://your-project.supabase.co/rest/v1/  -H "Authorization: Bearer $JWT"

# Step 2: Check credentials
echo $PUBLIC_SUPABASE_URL
echo $PUBLIC_SUPABASE_ANON_KEY

# Step 3: Test connection with psql
psql "postgresql://postgres:password@db.supabase.co:5432/postgres"

# Step 4: Check connection pooling
SELECT count(*) FROM pg_stat_activity;

# Step 5: Restart application
docker restart c4c-campus
```

#### Issue 3: High memory usage

**Error Symptoms:**
```
Application memory usage > 512MB
Frequent out-of-memory kills
```

**Solutions:**
```bash
# Step 1: Check memory leaks
node --inspect server.js
# Open chrome://inspect in Chrome DevTools

# Step 2: Profile heap
npm install --save-dev clinic
clinic doctor npm run dev

# Step 3: Increase memory limit (temporary)
NODE_OPTIONS=--max_old_space_size=2048 npm run build

# Step 4: Optimize dependencies
npm audit --audit-level=moderate
npm dedupe
npm prune

# Step 5: Scale container
# Docker: Increase memory limit in docker-compose.yml
# Vercel: Increase max function duration
# Self-hosted: Add more RAM or split into multiple processes
```

#### Issue 4: Static assets not loading

**Error Symptoms:**
```
404 for _astro/index.*.js
CSS not applying
```

**Solutions:**
```bash
# Step 1: Verify build output
ls -la dist/_astro/
# Check if files exist

# Step 2: Check asset path configuration
# In astro.config.mjs
export default defineConfig({
  site: 'https://c4ccampus.org',  // Must match actual domain
  build: {
    assets: '_astro'
  }
});

# Step 3: Clear CDN cache
# Vercel: Go to Deployment → Redeploy
# Netlify: Site Settings → Clear cache
# Self-hosted: curl -X PURGE https://cache.example.com/*

# Step 4: Check cache headers
curl -I https://c4ccampus.org/_astro/index.js
# Verify Cache-Control header present
```

#### Issue 5: RLS policy blocking requests

**Error Symptoms:**
```
Policy violates row-level security policy
Unauthorized: new row violates row security policy
```

**Solutions:**
```sql
-- Step 1: Check which policy is failing
SELECT * FROM pg_policies
WHERE tablename = 'applications'
AND cmd = 'INSERT';

-- Step 2: Test policy with specific user
SET "request.jwt.claim.sub" = 'user-id-here';
SELECT * FROM applications;

-- Step 3: Review policy logic
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Step 4: Check JWT claims
SELECT auth.uid() as current_user;

-- Step 5: Temporarily disable RLS for debugging (DANGEROUS)
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
-- Debug queries...
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 6: Add admin bypass if needed
CREATE POLICY "Service role bypass"
  ON applications
  USING (auth.jwt() ->> 'role' = 'service_role');
```

#### Issue 6: Slow database queries

**Error Symptoms:**
```
Query execution time: 5000ms (should be <100ms)
Application timeout waiting for database
```

**Solutions:**
```sql
-- Step 1: Identify slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 5;

-- Step 2: Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM enrollments
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC;

-- Step 3: Create missing indexes
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Step 4: Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0;  -- Unused indexes

-- Step 5: Vacuum and analyze
VACUUM ANALYZE;

-- Step 6: Monitor in real-time
watch -n 1 'psql -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"'
```

#### Issue 7: Intermittent 502 errors

**Error Symptoms:**
```
Occasional HTTP 502 Bad Gateway
Errors appear randomly, then resolve
```

**Solutions:**
```bash
# Step 1: Check server logs
vercel logs --tail  # For Vercel
netlify logs:tail   # For Netlify
journalctl -u c4c-campus -f  # Self-hosted

# Step 2: Monitor metrics during failure
# Check CPU, memory, connections during 502 errors

# Step 3: Check database connection pool status
psql -c "SELECT count(*) FROM pg_stat_activity;"
# If near max_connections, scale up

# Step 4: Increase timeouts
# API route should timeout at 30s, not abruptly

# Step 5: Implement circuit breaker
// Stop sending requests to failing backend
async function callDatabase() {
  try {
    const result = await db.query(...);
    circuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    circuitBreaker.recordFailure();
    if (circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is open');
    }
    throw error;
  }
}
```

---

## Maintenance Schedule

### Daily Tasks

- [ ] Monitor error logs (Sentry dashboard)
- [ ] Check database disk usage (Supabase)
- [ ] Review application metrics (CDN, response times)

### Weekly Tasks

- [ ] Review security alerts
- [ ] Check backup completion
- [ ] Analyze performance trends

### Monthly Tasks

- [ ] Security audit (npm audit)
- [ ] Database optimization (VACUUM ANALYZE)
- [ ] Dependency updates
- [ ] Rotate credentials

### Quarterly Tasks

- [ ] Disaster recovery drill
- [ ] Security penetration testing
- [ ] Performance baseline comparison
- [ ] Update runbooks and documentation

---

## Escalation Procedures

**On-Call Response Times:**

1. **P0 (Critical)**: < 5 minutes
   - Application completely down
   - Data loss occurring
   - Security breach active
   - Action: Emergency rollback, escalate to team lead

2. **P1 (High)**: < 15 minutes
   - High error rate (>5%)
   - Major feature broken
   - Database connection issues
   - Action: Investigate, fix or rollback

3. **P2 (Medium)**: < 1 hour
   - Single feature broken
   - Slow performance
   - Non-critical alerts
   - Action: Schedule fix in next deployment

4. **P3 (Low)**: Next business day
   - Minor UI issues
   - Documentation updates
   - Performance optimization
   - Action: Include in next release

**Escalation Path:**

```
On-Call Engineer (5 min response)
        ↓
Team Lead (15 min response)
        ↓
Incident Commander (30 min response)
        ↓
Full Team Escalation (1 hour)
```

---

## Appendix

### A. Deployment Checklist Template

```markdown
# Deployment Checklist - [VERSION]

## Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Lighthouse score ≥95
- [ ] Security scan passed
- [ ] Database backup verified
- [ ] Team notified

## During Deployment
- [ ] Build succeeds locally
- [ ] Deploy to staging
- [ ] Smoke tests pass in staging
- [ ] Deploy to production
- [ ] Smoke tests pass in production
- [ ] Team monitoring active

## Post-Deployment
- [ ] Error logs normal
- [ ] Performance metrics normal
- [ ] User reports positive
- [ ] Incident report updated
- [ ] Team debriefing scheduled (if issues)
```

### B. Runbook Template

```markdown
# Runbook: [INCIDENT TYPE]

## Symptoms
- [Symptom 1]
- [Symptom 2]

## Impact
- Affects: [Users/Components]
- Severity: [P0/P1/P2]

## Resolution Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Verification
- [ ] Check [metric 1]
- [ ] Verify [metric 2]

## Prevention
- [Action 1]
- [Action 2]

## References
- [Link 1]
- [Link 2]
```

### C. Useful Commands

```bash
# Vercel
vercel logs --tail
vercel deployments list
vercel rollback

# Netlify
netlify logs:tail
netlify deploy --prod --dir=dist

# Supabase
psql -h db.supabase.co -U postgres -d postgres
curl https://api.supabase.com/v1/projects/$PROJECT_ID/backups

# Docker
docker ps -a
docker logs c4c-campus
docker restart c4c-campus

# Git
git log --oneline -10
git diff main~1
git cherry-pick [commit]
```

---

## Support and Escalation

For questions about this guide:
- DevOps Team: [Email]
- On-Call Engineer: [Slack channel]
- Incident Commander: [Contact info]

For security issues:
- Security Team: security@codeforcompassion.com
- Do NOT post security issues publicly

**Document Version**: 1.0.0
**Last Updated**: October 29, 2025
**Next Review**: January 29, 2026
