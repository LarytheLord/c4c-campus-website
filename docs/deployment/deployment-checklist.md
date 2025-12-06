# C4C Campus Deployment Checklist

**Use this checklist for every production deployment**

---

## Pre-Deployment Phase (30 minutes before)

### Code & Testing
- [ ] All code merged to `main` branch
- [ ] All pull requests reviewed and approved
- [ ] All branch protection rules satisfied
- [ ] Run unit tests locally: `npm run test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] All tests passing (green checkmark on CI/CD)
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run check`
- [ ] No security vulnerabilities: `npm audit` (no critical/high)
- [ ] Code review comments resolved

### Database
- [ ] Current database backed up via Supabase Dashboard
- [ ] Backup verified (can see in Backups list)
- [ ] No pending migrations
- [ ] RLS policies reviewed for correctness
- [ ] Database has sufficient quota
- [ ] Connection pool settings verified

### Performance
- [ ] Lighthouse score ≥ 95 (all categories)
  - [ ] Performance ≥ 95
  - [ ] Accessibility ≥ 95
  - [ ] Best Practices ≥ 95
  - [ ] SEO ≥ 95
- [ ] Bundle size < 5MB
- [ ] No unused dependencies
- [ ] Images optimized
- [ ] Code splitting applied

### Security
- [ ] No secrets in code
- [ ] No `.env` file in git history
- [ ] All API keys rotated (quarterly check)
- [ ] SSL certificate valid
- [ ] HTTPS redirect configured
- [ ] CORS headers correct
- [ ] CSP headers in place
- [ ] Security headers verified

### Environment Variables
- [ ] All required env vars documented
- [ ] Staging env vars set correctly
- [ ] Production env vars set correctly
- [ ] No typos in variable names
- [ ] Sensitive values in secure storage (not plaintext)
- [ ] Service role key NOT exposed in frontend

### Documentation
- [ ] CHANGELOG updated with changes
- [ ] README updated (if needed)
- [ ] Deployment runbook reviewed
- [ ] Known issues documented
- [ ] Database migration steps documented

### Team Communication
- [ ] On-call engineer assigned for 4 hours post-deployment
- [ ] Team notified in #deployments channel
- [ ] Expected deployment time communicated
- [ ] Rollback plan confirmed with team
- [ ] User support team briefed on changes

---

## Deployment Phase (10 minutes)

### Pre-Deploy Steps
- [ ] No active critical incidents
- [ ] Current on `main` branch
- [ ] Latest changes pulled: `git pull`
- [ ] Dependencies installed: `npm ci`
- [ ] Previous version can be rolled back to

### Build
- [ ] Clean build: `rm -rf dist && npm run build`
- [ ] Build completed without errors
- [ ] Build size reasonable (< 10MB)
- [ ] dist/ folder contains expected files
- [ ] Build artifacts archived for reference

### Deploy
- [ ] Choose deployment platform
  - [ ] **Vercel**: `vercel --prod --token=$VERCEL_TOKEN`
  - [ ] **Netlify**: `netlify deploy --prod --dir=dist`
  - [ ] **Self-hosted**: Docker/K8s deployment script
- [ ] Deployment started without errors
- [ ] Monitor deployment progress
- [ ] Wait for deployment to complete (green status)

### Immediate Post-Deploy (first 5 minutes)
- [ ] Application is accessible
- [ ] No 5xx errors on homepage
- [ ] No error spam in Sentry
- [ ] Database connections healthy
- [ ] Performance metrics normal

---

## Verification Phase (5-30 minutes)

### Health Checks
- [ ] Homepage loads: `curl -I https://c4ccampus.org/`
- [ ] Returns HTTP 200
- [ ] HTTPS redirect working (http → https)
- [ ] Security headers present
  - [ ] Strict-Transport-Security
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Content-Security-Policy (if configured)

### Functional Testing
- [ ] Homepage renders correctly
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] Authentication flow works
- [ ] Database queries return data
- [ ] API endpoints respond
- [ ] Static assets load (CSS, JS, images)

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database query time < 200ms
- [ ] No console errors
- [ ] CDN serving content (check cache headers)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Design
- [ ] Desktop (1440px+)
- [ ] Tablet (768px-1024px)
- [ ] Mobile (320px-480px)
- [ ] All images scale correctly
- [ ] Touch targets sufficient size

### Accessibility
- [ ] No automated a11y errors
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (test with NVDA/JAWS)
- [ ] Color contrast sufficient
- [ ] Form labels present

### Database
- [ ] Can connect to database
- [ ] Can read data
- [ ] Can write data (if applicable)
- [ ] RLS policies enforced
- [ ] No orphaned records created

### Analytics & Monitoring
- [ ] Sentry receiving errors
- [ ] Uptime monitor working
- [ ] Analytics tracking events
- [ ] Logs aggregating correctly
- [ ] Performance metrics recorded

### Run Smoke Tests
```bash
chmod +x production-smoke-tests.sh
./production-smoke-tests.sh
```

All tests should pass (green output).

---

## Extended Monitoring (4 hours post-deployment)

### T+10 minutes
- [ ] Check error logs (Sentry)
  - [ ] No spike in errors
  - [ ] No new error patterns
  - [ ] Error rate < 1%
- [ ] Check performance metrics
  - [ ] Response time stable
  - [ ] Database queries normal
- [ ] Check user reports
  - [ ] No complaints in Discord/Slack
  - [ ] Support team reports normal

### T+30 minutes
- [ ] Run full smoke test suite
- [ ] Check analytics dashboard
- [ ] Review application logs
- [ ] Monitor database performance
- [ ] Check CDN cache hit rate

### T+1 hour
- [ ] Compare baseline metrics
  - [ ] Error rate steady
  - [ ] Performance consistent
  - [ ] User sessions normal
- [ ] Review any warning-level alerts
- [ ] Verify no data corruption occurred

### T+2 hours
- [ ] Performance analysis complete
- [ ] No critical issues found
- [ ] User feedback positive
- [ ] Team confident in deployment

### T+4 hours
- [ ] Declare deployment successful
- [ ] Off-call engineer can leave
- [ ] Document any minor issues
- [ ] Schedule post-deployment review

---

## Post-Deployment Phase (same day)

### Documentation
- [ ] Add deployment note to git tag
- [ ] Document any issues encountered
- [ ] Update runbooks if procedures changed
- [ ] Archive build artifacts
- [ ] Log deployment metrics

### Monitoring
- [ ] Verify monitoring alerts working
- [ ] Confirm on-call coverage continues
- [ ] Check backup schedule ran
- [ ] Review error trends

### Communication
- [ ] Update #deployments with success message
- [ ] Thank ops/deployment team
- [ ] Notify support team deployment complete
- [ ] Update status page if applicable

### Cleanup
- [ ] Remove debug code/logs
- [ ] Clean up temporary files
- [ ] Delete old build artifacts (keep last 3)
- [ ] Archive deployment logs

---

## Deployment Runbook Selection

**Choose based on deployment type:**

### Standard Deployment
✓ No database changes
✓ New features/fixes only
✓ Low risk

**Process**: Use [Runbook 1](./deployment-runbooks.md#runbook-1-standard-production-deployment)

### Database Migration
✓ Schema changes
✓ Data migration required
✓ Medium risk

**Process**: Use [Runbook 3](./deployment-runbooks.md#runbook-3-database-migration)

### Emergency/Hotfix
✓ Critical bug/security issue
✓ Must deploy ASAP
✓ High risk

**Process**: Use [Runbook 2](./deployment-runbooks.md#runbook-2-emergency-rollback) or emergency process

### Blue-Green Deployment
✓ Zero downtime required
✓ Complex changes
✓ High risk

**Process**: Deploy to staging, verify, switch traffic

---

## Rollback Decision Tree

Use this to decide if rollback is needed:

```
Is application completely down (can't access any page)?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO

Is error rate > 10% (100+ errors/minute)?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO

Is a critical business feature completely broken?
├─ YES → ROLLBACK & ASSESS
└─ NO

Is database connection failing?
├─ YES → ROLLBACK IMMEDIATELY
└─ NO

Is security vulnerability confirmed?
├─ YES → ROLLBACK & PATCH
└─ NO

Is there a data corruption issue?
├─ YES → ROLLBACK & INVESTIGATE
└─ NO

Is performance degraded > 50%?
├─ YES → ASSESS CAUSE
│   ├─ Database query slow → Optimize & Redeploy
│   ├─ Frontend code slow → Rollback
│   └─ Infrastructure issue → Scale
└─ NO → DEPLOYMENT SUCCESSFUL ✓
```

---

## Quick Verification Commands

Run these to verify deployment:

```bash
# Connectivity
curl -I https://c4ccampus.org/

# Application status
curl https://c4ccampus.org/api/status

# Database connectivity
curl https://c4ccampus.org/api/db-health

# Performance (requires lighthouse)
npm install -g lighthouse
lighthouse https://c4ccampus.org --chrome-flags="--headless"

# Check Sentry for errors
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  https://sentry.io/api/0/projects/org-name/project-name/events/

# Check logs
vercel logs --tail  # Vercel
netlify logs:tail   # Netlify

# Check DNS
nslookup c4ccampus.org
dig c4ccampus.org

# Monitor deployment
watch -n 5 'curl -s https://c4ccampus.org/api/status | jq'
```

---

## Common Issues & Quick Fixes

### Application returns 502 Bad Gateway
1. [ ] Check if build succeeded
2. [ ] Restart application container
3. [ ] Check database connection
4. [ ] Review recent error logs
5. [ ] If persistent, rollback

### Database connection timeout
1. [ ] Verify database is running
2. [ ] Check connection string
3. [ ] Verify network connectivity
4. [ ] Check database user permissions
5. [ ] Increase connection timeout

### Performance is slow
1. [ ] Check Lighthouse score
2. [ ] Analyze slow database queries
3. [ ] Check CDN cache hit rate
4. [ ] Monitor CPU/memory usage
5. [ ] Optimize or rollback

### Errors spiking in Sentry
1. [ ] Check error messages
2. [ ] Look for pattern
3. [ ] Check recent code changes
4. [ ] Verify environment variables
5. [ ] Consider rollback if systematic

### Users reporting issues
1. [ ] Ask for specific error message
2. [ ] Check browser console errors
3. [ ] Try to reproduce locally
4. [ ] Check if issue in previous version
5. [ ] Document and fix in next release

---

## Deployment Metrics to Track

Record these for each deployment:

```
Deployment Date: [Date/Time]
Version: [Commit Hash/Tag]
Duration: [Minutes]
Status: [Success/Rollback/Issues]
Error Count Before: [Number]
Error Count After: [Number]
Issues Encountered: [List]
Performance Impact: [Improved/Degraded/Unchanged]
Team Notes: [Any issues or learnings]
```

---

## Sign-Off

After completing all checks:

```
Deployment completed successfully on [DATE] at [TIME]
Deployed by: [NAME]
Verified by: [NAME]
On-call engineer: [NAME]
Issues: [None / List if any]
Rollback needed: [Yes/No]
```

---

## Related Documentation

- [Main Deployment Guide](./production-guide.md)
- [Deployment Runbooks](./deployment-runbooks.md)
- [Monitoring Setup](./monitoring-setup.md)
- [Troubleshooting](./production-guide.md#troubleshooting)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-29 | 1.0.0 | Initial checklist |

**Last Updated**: October 29, 2025
