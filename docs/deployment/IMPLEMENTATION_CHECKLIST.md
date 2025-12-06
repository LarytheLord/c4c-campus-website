# C4C Campus Deployment Guide - Implementation Checklist

**Checklist for implementing the deployment guide in your organization**

---

## Phase 1: Documentation Setup (Day 1)

### Verify Documentation
- [ ] All 5 documents created in `docs/deployment/`:
  - [ ] README.md (Navigation & overview)
  - [ ] production-guide.md (Comprehensive reference)
  - [ ] deployment-runbooks.md (Step-by-step procedures)
  - [ ] monitoring-setup.md (Monitoring configuration)
  - [ ] deployment-checklist.md (Operational checklist)
- [ ] All documents are accessible and readable
- [ ] Links between documents work correctly
- [ ] Document versions are 1.0.0

### Share Documentation
- [ ] Share docs/deployment/README.md link in team Slack
- [ ] Add link to team wiki/knowledge base
- [ ] Email summary to team
- [ ] Add to onboarding documentation
- [ ] Create bookmark in shared browser folder

### Schedule Initial Training
- [ ] Schedule 30-minute overview meeting with team
- [ ] Assign reading homework (2-3 hours)
- [ ] Schedule Q&A session
- [ ] Assign deployment roles

---

## Phase 2: Tools Setup (Week 1)

### Configure Error Tracking
- [ ] Create Sentry account (or use existing)
- [ ] Create new Sentry project for C4C Campus
- [ ] Add Sentry DSN to environment variables
- [ ] Install Sentry SDK: `npm install @sentry/astro`
- [ ] Configure Sentry in astro.config.mjs
- [ ] Test error reporting (throw test error)
- [ ] Configure Slack alert integration
- [ ] Set up alert rules for:
  - [ ] High error rate (> 1% in 5 min)
  - [ ] New issue detected
  - [ ] Release health (< 95% crash-free)

### Configure Uptime Monitoring
- [ ] Create UptimeRobot account
- [ ] Add monitor for https://c4ccampus.org
- [ ] Set check frequency to 5 minutes
- [ ] Configure alert contacts:
  - [ ] Email notifications
  - [ ] Slack webhook
  - [ ] SMS (optional, for critical)
- [ ] Create status page (using UptimeRobot or statuspage.io)
- [ ] Add status page link to footer/sidebar

### Configure Database Monitoring
- [ ] Log into Supabase Dashboard
- [ ] Go to Settings → Monitoring
- [ ] Enable alerts for:
  - [ ] Disk usage > 80%
  - [ ] Connections > 80
  - [ ] CPU usage > 80%
  - [ ] Query duration > 5 seconds
- [ ] Configure notification emails

### Configure Analytics
- [ ] Create Plausible Analytics account
- [ ] Add Plausible script to layout
- [ ] Verify tracking is working (check dashboard)
- [ ] Set up weekly email reports
- [ ] Configure spike detection alerts

### Test All Monitoring
- [ ] Trigger test error in Sentry (verify alert)
- [ ] Verify uptime monitoring sends alerts
- [ ] Check database monitoring thresholds
- [ ] Confirm analytics collecting data
- [ ] Test all notification channels

---

## Phase 3: Deployment Setup (Week 1-2)

### Choose Deployment Platform

**Option A: Vercel (Recommended)**
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Framework: Astro
- [ ] Add environment variables:
  - [ ] PUBLIC_SUPABASE_URL
  - [ ] PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] PUBLIC_N8N_URL (optional)
  - [ ] N8N_API_KEY (optional)
- [ ] Enable automatic deployments on main branch
- [ ] Configure preview deployments for PRs
- [ ] Test deploy: `vercel --prod --token=$VERCEL_TOKEN`

**Option B: Netlify**
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Add environment variables (same as above)
- [ ] Enable automatic deployments
- [ ] Configure deploy notifications to Slack
- [ ] Test deploy: `netlify deploy --prod --dir=dist`

**Option C: Self-Hosted**
- [ ] Set up Docker environment
- [ ] Create Dockerfile (from guide)
- [ ] Set up container registry (Docker Hub, ECR, etc.)
- [ ] Configure Kubernetes (if using K8s)
- [ ] Set up load balancer
- [ ] Configure SSL/TLS
- [ ] Set up health checks
- [ ] Test deploy process

### Configure CI/CD Pipeline
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Add workflow steps:
  - [ ] Checkout code
  - [ ] Setup Node.js
  - [ ] Install dependencies
  - [ ] Run linting
  - [ ] Run unit tests
  - [ ] Run integration tests
  - [ ] Build application
  - [ ] Deploy to production
  - [ ] Notify Slack
- [ ] Test workflow on non-main branch first
- [ ] Verify workflow runs on main branch push

### Verify Deployment Works
- [ ] Test preview deployment (create test PR)
- [ ] Test production deployment (merge to main)
- [ ] Verify application loads
- [ ] Check Lighthouse score
- [ ] Run smoke tests
- [ ] Verify logs are accessible

---

## Phase 4: Security Setup (Week 2)

### Environment Variables
- [ ] Audit all environment variables
- [ ] Ensure SERVICE_ROLE_KEY is server-side only
- [ ] Set up secret rotation reminder (calendar)
- [ ] Document all required env vars
- [ ] Create checklist for adding new env vars

### Secrets Management
- [ ] Remove any hardcoded secrets from repository
- [ ] Audit git history for secrets: `git-secrets --scan`
- [ ] Install git-secrets: `git-secrets --install`
- [ ] Configure git hooks for secret detection
- [ ] Set up secret rotation schedule (quarterly)
- [ ] Document secret access procedures

### Security Headers
- [ ] Verify HTTPS is enforced (redirect http → https)
- [ ] Check security headers via: `curl -I https://c4ccampus.org/`
- [ ] Verify headers present:
  - [ ] Strict-Transport-Security
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection
  - [ ] Content-Security-Policy (if configured)
- [ ] Test in Chrome DevTools (Security tab)

### Database Security
- [ ] Enable RLS on all tables
- [ ] Verify RLS policies are correct
- [ ] Test RLS policies with sample queries
- [ ] Set up database audit logging
- [ ] Review backup encryption settings
- [ ] Test database restore procedure

### API Security
- [ ] Implement rate limiting on API endpoints
- [ ] Configure CORS for production domain only
- [ ] Enable API request validation
- [ ] Set up API authentication (JWT)
- [ ] Test API with invalid credentials

---

## Phase 5: Monitoring Dashboard Setup (Week 2-3)

### Create Application Dashboard
- [ ] Set up Grafana (if self-hosted) or equivalent
- [ ] Create dashboard with panels:
  - [ ] Error rate (last 24h)
  - [ ] Response time (p50, p95, p99)
  - [ ] Request rate
  - [ ] Top errors
  - [ ] Database metrics
  - [ ] Infrastructure metrics

### Create On-Call Dashboard
- [ ] Create mobile-friendly status dashboard
- [ ] Add metrics:
  - [ ] Application health (green/red)
  - [ ] Database status
  - [ ] Error count (last hour)
  - [ ] Response time
  - [ ] Recent alerts
- [ ] Make accessible via: `/monitoring`

### Configure Alert Rules
- [ ] Create alerts in Prometheus/Grafana:
  - [ ] HighErrorRate: > 1% in 5 min
  - [ ] HighCPUUsage: > 80% for 5 min
  - [ ] HighMemoryUsage: > 85% for 5 min
  - [ ] DiskFull: < 15% free for 5 min
  - [ ] ApplicationDown: no response for 1 min
  - [ ] DatabaseDown: no connections for 1 min
  - [ ] SlowQueries: > 5s execution time

### Configure Alert Routing
- [ ] Set up Slack webhook for alerts
- [ ] Configure PagerDuty (for critical alerts)
- [ ] Test alert firing (trigger test alert)
- [ ] Verify all notification channels work
- [ ] Document escalation paths

---

## Phase 6: Runbook Testing (Week 3)

### Test Standard Deployment
- [ ] Create feature branch
- [ ] Make small code change
- [ ] Follow [Runbook 1](./deployment-runbooks.md#runbook-1-standard-production-deployment)
- [ ] Deploy to production
- [ ] Verify deployment succeeded
- [ ] Document any issues or improvements

### Test Emergency Rollback
- [ ] Verify previous version is accessible
- [ ] Create test tag for current version
- [ ] Follow [Runbook 2](./deployment-runbooks.md#runbook-2-emergency-rollback)
- [ ] Perform rollback
- [ ] Verify rollback succeeded
- [ ] Re-deploy current version

### Test Database Migration
- [ ] Create test migration SQL
- [ ] Test on staging database first
- [ ] Follow [Runbook 3](./deployment-runbooks.md#runbook-3-database-migration)
- [ ] Execute migration
- [ ] Verify data integrity
- [ ] Test rollback from backup

### Test Monitoring Alerts
- [ ] Trigger high error rate alert
- [ ] Trigger database alert
- [ ] Trigger uptime alert
- [ ] Verify alerts routed correctly
- [ ] Verify team receives notifications
- [ ] Clear alerts after testing

### Test Disaster Recovery
- [ ] Test database restore from backup
- [ ] Measure RTO (should be < 15 min)
- [ ] Verify data integrity post-restore
- [ ] Test application fallback procedures
- [ ] Document any issues

---

## Phase 7: Team Training (Week 3-4)

### Training Sessions
- [ ] Session 1: Deployment overview (30 min)
  - [ ] Presentation on deployment guide
  - [ ] Architecture overview
  - [ ] Tools and platforms
  - [ ] Q&A

- [ ] Session 2: Standard deployment procedure (1 hour)
  - [ ] Walk through checklist
  - [ ] Demonstrate build process
  - [ ] Demonstrate deployment
  - [ ] Live Q&A

- [ ] Session 3: Incidents and rollback (1 hour)
  - [ ] When to rollback
  - [ ] How to rollback
  - [ ] Incident communication
  - [ ] Post-incident review

- [ ] Session 4: Monitoring and on-call (1 hour)
  - [ ] Dashboard walkthrough
  - [ ] Alert interpretation
  - [ ] On-call responsibilities
  - [ ] Escalation procedures

### Hands-On Practice
- [ ] Each team member shadows deployment
- [ ] Each team member does first deployment with lead
- [ ] Each team member tests rollback procedure
- [ ] Each team member reviews monitoring dashboard

### Role Assignments
- [ ] Assign Deployment Manager
- [ ] Assign On-Call Engineer rotation
- [ ] Assign Database Administrator
- [ ] Assign Team Lead
- [ ] Assign DevOps Engineer
- [ ] Create on-call schedule

---

## Phase 8: Documentation Customization (Week 4)

### Customize for Your Organization
- [ ] Update emergency contacts
- [ ] Update team names/email addresses
- [ ] Add organization-specific procedures
- [ ] Add internal links/references
- [ ] Customize alert thresholds
- [ ] Add team-specific notes

### Add Team Runbooks
- [ ] Document your deployment procedure (if different)
- [ ] Add team-specific troubleshooting
- [ ] Document your incident response process
- [ ] Create team-specific checklists
- [ ] Add historical incidents/learnings

### Create Quick Reference
- [ ] Print deployment checklist
- [ ] Create Slack pinned message with links
- [ ] Create wiki page with overview
- [ ] Add bookmarks to shared browser
- [ ] Create email template for deployments

---

## Phase 9: Automation Setup (Week 4-5)

### Create Automation Scripts
- [ ] Create smoke test script
- [ ] Create backup script (if manual)
- [ ] Create deployment script
- [ ] Create monitoring dashboard generator
- [ ] Create alert test script

### Set Up Scheduled Tasks
- [ ] Daily: Database backup (automated via Supabase)
- [ ] Weekly: Database maintenance (VACUUM, ANALYZE)
- [ ] Weekly: Security audit (npm audit)
- [ ] Monthly: Dependency updates
- [ ] Monthly: Monitoring review
- [ ] Quarterly: Disaster recovery drill

### Integrate with CI/CD
- [ ] Automatic tests on every PR
- [ ] Automatic build on main push
- [ ] Automatic deployment on main push
- [ ] Automatic smoke tests post-deployment
- [ ] Automatic Slack notifications
- [ ] Automatic metric collection

---

## Phase 10: Launch & Ongoing (Week 5+)

### First Production Deployment
- [ ] All team members trained
- [ ] All tools configured
- [ ] All runbooks tested
- [ ] All monitoring active
- [ ] Security review passed
- [ ] Schedule deployment
- [ ] Execute deployment
- [ ] Monitor for 4+ hours
- [ ] Post-deployment review

### Ongoing Maintenance
- [ ] Weekly: Review deployment metrics
- [ ] Monthly: Update documentation
- [ ] Quarterly: Disaster recovery drill
- [ ] Quarterly: Security audit
- [ ] Semi-annual: Documentation review
- [ ] Annual: Comprehensive system review

### Continuous Improvement
- [ ] Collect feedback after each deployment
- [ ] Update runbooks based on learnings
- [ ] Improve automation
- [ ] Train new team members
- [ ] Review and update this checklist

---

## Sign-Off

When completed, each phase should be signed off by the team lead:

**Phase 1 - Documentation Setup**: _____________________ Date: _____
**Phase 2 - Tools Setup**: _____________________ Date: _____
**Phase 3 - Deployment Setup**: _____________________ Date: _____
**Phase 4 - Security Setup**: _____________________ Date: _____
**Phase 5 - Monitoring Setup**: _____________________ Date: _____
**Phase 6 - Runbook Testing**: _____________________ Date: _____
**Phase 7 - Team Training**: _____________________ Date: _____
**Phase 8 - Documentation Customization**: _____________________ Date: _____
**Phase 9 - Automation Setup**: _____________________ Date: _____
**Phase 10 - Launch**: _____________________ Date: _____

---

## Estimated Timeline

- **Phase 1**: 1 day
- **Phase 2**: 3-5 days
- **Phase 3**: 5-7 days
- **Phase 4**: 3-5 days
- **Phase 5**: 5-7 days
- **Phase 6**: 3-5 days
- **Phase 7**: 5-7 days
- **Phase 8**: 2-3 days
- **Phase 9**: 3-5 days
- **Phase 10**: Ongoing

**Total Time**: 4-6 weeks to full deployment readiness

---

## Critical Path

Minimum viable deployment (skip optional items):
1. Documentation review (1 day)
2. Choose deployment platform (1 day)
3. Configure environment variables (0.5 day)
4. Test deployment (0.5 day)
5. Team training (2 days)
6. First production deployment (0.5 day)

**Total Minimum**: 5 days

---

## Success Criteria

When implementation is complete:
- [ ] All 5 documents created and reviewed
- [ ] All team members have read overview
- [ ] Deployment platform configured and tested
- [ ] Monitoring active and alerting
- [ ] Team trained on procedures
- [ ] At least 1 successful production deployment
- [ ] Rollback tested successfully
- [ ] On-call rotation established
- [ ] Disaster recovery plan verified
- [ ] Team confident in deployment process

---

## Support & Questions

For questions during implementation:
- Refer to specific document section
- Check FAQ in [README.md](./README.md#faq)
- Ask in #deployments Slack channel
- Contact team lead

---

**Document Version**: 1.0.0
**Last Updated**: October 29, 2025
