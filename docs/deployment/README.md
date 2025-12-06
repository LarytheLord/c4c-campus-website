# C4C Campus Production Deployment Documentation

**Complete guide to deploying C4C Campus to production**

---

## Quick Start

**First time deploying?**
1. Read: [Production Guide - Pre-Deployment Checklist](./production-guide.md#pre-deployment-checklist)
2. Follow: [Deployment Runbooks - Standard Deployment](./deployment-runbooks.md#runbook-1-standard-production-deployment)
3. Verify: [Deployment Checklist](./deployment-checklist.md)

**Experienced deployer?**
1. Use: [Deployment Checklist](./deployment-checklist.md) (2 minutes)
2. Reference: [Deployment Runbooks](./deployment-runbooks.md) (as needed)

**Emergency? Application down?**
1. Follow: [Runbook 2 - Emergency Rollback](./deployment-runbooks.md#runbook-2-emergency-rollback)
2. Restore: [Database Rollback](./production-guide.md#scenario-2-database-rollback)

---

## Documentation Overview

### 1. [Production Guide](./production-guide.md) (Main Document)

**60-minute read** | Complete reference for production deployment

Covers:
- Deployment architecture and overview
- Pre-deployment checklist (comprehensive)
- Database migration steps
- Environment variables setup
- Build and deploy procedures
- Post-deployment verification
- Rollback procedures
- Monitoring and alerting setup
- Disaster recovery plan
- Performance tuning
- Security hardening
- Troubleshooting guide
- Maintenance schedule

**When to use:**
- First time deploying to production
- Learning about disaster recovery
- Setting up monitoring
- Troubleshooting deployment issues

### 2. [Deployment Runbooks](./deployment-runbooks.md) (Quick Reference)

**Quick reference** | Step-by-step procedures for common scenarios

Contains 10 runbooks:
1. Standard production deployment
2. Emergency rollback
3. Database migration
4. Application scaling
5. Performance investigation
6. Security incident response
7. Database backup & restore
8. Adding feature flags
9. Handling database growth
10. Updating dependencies

**When to use:**
- During actual deployment
- Quick reference during incidents
- Standard operation procedures

### 3. [Monitoring Setup](./monitoring-setup.md) (Implementation Guide)

**30-minute read** | Complete monitoring configuration

Covers:
- Error tracking (Sentry)
- Database monitoring (Supabase)
- Application performance (APM)
- Infrastructure monitoring (Prometheus/Grafana)
- Uptime monitoring
- Log aggregation (ELK)
- User activity monitoring (Plausible)
- Build monitoring
- Alert routing and escalation
- Monitoring dashboard setup
- Regular review schedule

**When to use:**
- Setting up monitoring for first time
- Configuring new monitoring service
- Understanding monitoring architecture

### 4. [Deployment Checklist](./deployment-checklist.md) (Operation Checklist)

**5-10 minute use** | Actionable checklist for each deployment

Covers:
- Pre-deployment phase (30 minutes before)
- Deployment phase (10 minutes)
- Verification phase (5-30 minutes)
- Extended monitoring (4 hours)
- Post-deployment phase (same day)
- Common issues & quick fixes
- Sign-off documentation

**When to use:**
- Every production deployment
- Ensures nothing is forgotten
- Training new team members

---

## Deployment Workflow

### Standard Deployment Flow

```
Development → Testing → Code Review → Merge to main → Build → Deploy → Verify → Monitor
    ↓         (local)      (GitHub)       (CI/CD)      (prod)   (prod)   (prod)  (24/7)
   Create
   feature
   branch
```

### Detailed Timeline

```
T-30min: Run checklist pre-deployment phase
T-0:     Deploy to production
T+5min:  Run verification checks
T+30min: Full smoke test
T+1hr:   Compare with baseline
T+4hr:   Declare success/rollback
T+1day:  Post-deployment review
```

---

## Deployment Scenarios & When to Use Each

| Scenario | Type | Runbook | Risk | Time |
|----------|------|---------|------|------|
| New feature/bugfix | Standard | #1 | Low | 15 min |
| Critical bug/security | Hotfix | #2 | High | 5 min |
| Database schema change | Migration | #3 | Medium | 20 min |
| High traffic expected | Scaling | #4 | Low | 5 min |
| App running slowly | Investigation | #5 | Low | 20 min |
| Credentials leaked | Security | #6 | Critical | 10 min |
| Need old data | Restore | #7 | High | 30 min |
| Gradual rollout | Feature flag | #8 | Very Low | 5 min |
| DB too large | Maintenance | #9 | Low | 30 min |
| Update packages | Maintenance | #10 | Low | 30 min |

---

## Key Concepts

### RTOs (Recovery Time Objectives)

| Component | RTO | How We Achieve It |
|-----------|---|---|
| Application | 5 minutes | Auto-scaling, rollback, restart |
| Database | 15 minutes | Daily backups, point-in-time recovery |
| Data | 1 hour | Automated backups (Supabase) |
| Full Infrastructure | 30 minutes | Multi-region failover (planned) |

### RPOs (Recovery Point Objectives)

| Component | RPO | How We Achieve It |
|-----------|---|---|
| Database | 24 hours | Daily automatic backups |
| Code | Immediate | Git history, tagged deployments |
| Configuration | 1 hour | Infrastructure as code |
| User data | 1 hour | Real-time replication (Supabase) |

### Deployment Strategies

#### Blue-Green Deployment
- Deploy to new environment
- Verify functionality
- Switch traffic instantly
- Zero downtime
- **Use when**: Major changes, zero downtime required

#### Canary Deployment
- Deploy to 5% of traffic first
- Monitor for errors
- Gradually increase (10%, 25%, 50%, 100%)
- Rollback quickly if needed
- **Use when**: Large changes, want to catch issues early

#### Rolling Deployment
- Update instances one at a time
- Health check after each
- Automatic rollback if unhealthy
- **Use when**: No database changes, large fleet

#### Feature Flags
- Deploy with new feature hidden
- Enable for percentage of users
- Disable instantly if problems
- **Use when**: Risky features, want user-level control

---

## Deployment Platforms

### Vercel (Recommended)

**Pros:**
- Automatic deployments from git
- Global edge caching
- Built-in analytics
- Automatic scaling
- Preview deployments for PRs

**Setup:**
```bash
vercel --prod
# or connect via GitHub dashboard
```

**Rollback:**
```bash
vercel rollout --rollback
```

### Netlify

**Pros:**
- Automatic deployments from git
- Built-in form handling
- Edge functions
- Atomic deployments

**Setup:**
```bash
netlify deploy --prod --dir=dist
```

**Rollback:**
```bash
netlify deploy --prod --dir=dist
# Redeploy previous version
```

### Self-Hosted

**Pros:**
- Full control
- No vendor lock-in
- Custom infrastructure

**Setup:**
```bash
docker build -t c4c-campus .
docker push registry/c4c-campus
kubectl rollout restart deployment/c4c-campus
```

**Rollback:**
```bash
kubectl rollout undo deployment/c4c-campus
```

---

## Team Roles & Responsibilities

### Deployment Manager
- [ ] Initiates deployment
- [ ] Verifies checklist
- [ ] Coordinates team
- [ ] Documents decisions

### On-Call Engineer
- [ ] Monitors for 4 hours post-deployment
- [ ] Responds to alerts
- [ ] Performs rollback if needed
- [ ] Documents incidents

### Database Administrator
- [ ] Creates/verifies backup
- [ ] Monitors database health
- [ ] Performs migrations
- [ ] Handles restore if needed

### Team Lead
- [ ] Approves deployment
- [ ] Reviews changes
- [ ] Escalates if needed
- [ ] Post-deployment review

### DevOps Engineer
- [ ] Manages infrastructure
- [ ] Monitoring setup
- [ ] Security hardening
- [ ] Performance optimization

---

## Security Checklist

Before every deployment, verify:

- [ ] No secrets in code
- [ ] API keys rotated (if old)
- [ ] Service role key NOT in frontend
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Database RLS policies correct
- [ ] No SQL injection vulnerabilities
- [ ] npm audit clean
- [ ] SSL certificate valid

---

## Performance Targets

Measure after each deployment:

| Metric | Target | Alert If |
|--------|--------|----------|
| Lighthouse Performance | ≥ 95 | < 90 |
| P95 Response Time | < 500ms | > 1s |
| Error Rate | < 0.5% | > 1% |
| Database Query Time | < 200ms | > 500ms |
| Page Load Time | < 2s | > 3s |
| Bundle Size | < 5MB | > 6MB |
| Uptime | 99.9% | < 99% |
| Cache Hit Rate | > 90% | < 80% |

---

## Communication Templates

### Pre-Deployment Notification

```
🚀 Production Deployment Starting

Version: v1.2.3
Time: [Date/Time]
Expected Duration: 10 minutes
Changes: [Brief summary]

We'll post updates in #deployments during the process.
```

### Successful Deployment

```
✓ Production Deployment Complete

Version: v1.2.3
Deployment Time: [X minutes]
Status: Success
Incidents: None

Thank you to [team members] for the smooth deployment!
```

### Rollback Notification

```
⚠️ Production Rollback Initiated

Issue: [Brief description]
Previous Version: v1.2.2
Time: [Start time]
Status: [In Progress]

We're working to restore stability.
```

---

## Incident Management

### Incident Severity Levels

**P0 - Critical**
- Application completely down
- Data loss occurring
- Security breach active
- Response: < 5 minutes

**P1 - High**
- Major feature broken
- Error rate > 10%
- Performance degraded > 50%
- Response: < 15 minutes

**P2 - Medium**
- Single feature broken
- Error rate 5-10%
- Performance degraded 20-50%
- Response: < 1 hour

**P3 - Low**
- Minor UI issue
- Error rate < 5%
- Performance degraded < 20%
- Response: Next business day

### Escalation Path

1. **On-Call Engineer** (5 min response)
   - Initial investigation
   - Attempt quick fix
   - Decide on rollback

2. **Team Lead** (15 min response)
   - Review decision
   - Authorize rollback
   - Assess impact

3. **Incident Commander** (30 min response)
   - Overall coordination
   - Communication
   - Post-incident review

---

## Post-Deployment Activities

### Immediate (Same Day)
- [ ] Monitor error logs
- [ ] Verify no data corruption
- [ ] Check performance metrics
- [ ] Team debrief (if issues)

### Next Day
- [ ] Review deployment metrics
- [ ] Analyze error trends
- [ ] Update documentation
- [ ] Plan next deployment

### Weekly
- [ ] Deployment retrospective
- [ ] Security audit
- [ ] Performance analysis
- [ ] Dependency updates

---

## Learning Resources

### For New Team Members

1. **Read in order:**
   - This README
   - [Production Guide - Architecture](./production-guide.md#deployment-architecture)
   - [Deployment Runbooks - Standard](./deployment-runbooks.md#runbook-1-standard-production-deployment)

2. **Watch/Observe:**
   - Shadow experienced deployer
   - Watch deployment happen
   - Review deployment logs

3. **Practice:**
   - Practice on staging first
   - Do first deployment with team lead
   - Gradually increase independence

### For Experienced Team Members

1. **Reference:**
   - Keep [Deployment Checklist](./deployment-checklist.md) nearby
   - [Deployment Runbooks](./deployment-runbooks.md) for quick lookup
   - [Troubleshooting Guide](./production-guide.md#troubleshooting) for issues

2. **Maintain:**
   - Update runbooks quarterly
   - Review lessons learned
   - Improve processes
   - Train new team members

---

## Deployment Statistics

Track these metrics over time:

- **Deployment Frequency**: Target ≥ 1x per week
- **Lead Time for Changes**: Target < 1 day
- **Mean Time to Recovery**: Target < 30 min
- **Change Failure Rate**: Target < 15%

```sql
-- Track deployments
SELECT
  DATE(deployed_at) as date,
  COUNT(*) as deployment_count,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*)::float as success_rate,
  AVG(CASE WHEN status = 'success' THEN duration_minutes ELSE NULL END) as avg_duration
FROM deployments
GROUP BY DATE(deployed_at)
ORDER BY date DESC;
```

---

## Emergency Contacts

**During Production Incident:**

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Engineer | [Name] | [Phone] | [Email] |
| Team Lead | [Name] | [Phone] | [Email] |
| Incident Commander | [Name] | [Phone] | [Email] |
| DevOps Lead | [Name] | [Phone] | [Email] |

**Communication Channels:**
- Slack: #incidents, #deployments
- Email: ops@codeforcompassion.com
- Phone: [On-call number]

---

## FAQ

**Q: How often should we deploy?**
A: At least weekly. Smaller, frequent deployments are safer than large, infrequent ones.

**Q: Can we deploy on weekends?**
A: Only for critical issues. Schedule maintenance windows for features.

**Q: What if deployment fails?**
A: Immediately rollback using [Runbook 2](./deployment-runbooks.md#runbook-2-emergency-rollback).

**Q: How long should we monitor after deployment?**
A: At least 4 hours. On-call engineer stays alert for 24 hours.

**Q: What if we need to deploy database changes?**
A: Follow [Runbook 3](./deployment-runbooks.md#runbook-3-database-migration) for safe migration.

**Q: How do we handle secrets?**
A: Never commit to git. Use platform secrets (Vercel, Netlify) or secure vault (self-hosted).

**Q: What's our uptime SLA?**
A: 99.9% (8.76 hours downtime/year). Aim for higher.

**Q: Can we deploy during working hours?**
A: Yes, but notify users. Consider off-peak for major changes.

---

## Document Version

**Version**: 1.0.0
**Last Updated**: October 29, 2025
**Next Review**: January 29, 2026

---

## Quick Links

- **Main Production Guide**: [production-guide.md](./production-guide.md)
- **Deployment Runbooks**: [deployment-runbooks.md](./deployment-runbooks.md)
- **Monitoring Setup**: [monitoring-setup.md](./monitoring-setup.md)
- **Deployment Checklist**: [deployment-checklist.md](./deployment-checklist.md)

---

## Contributing to This Documentation

If you find errors or have improvements:

1. Create a branch: `docs/deployment-improvements`
2. Edit the relevant file
3. Create pull request with explanation
4. Get reviewed and merged
5. Update document version number

---

## Support

For questions about deployment:
- Check [Troubleshooting](./production-guide.md#troubleshooting)
- Review relevant [Runbook](./deployment-runbooks.md)
- Ask in #deployments Slack channel
- Contact on-call engineer for urgent issues

---

**Remember**: The goal of this documentation is to make deployments safe, predictable, and quick. If something feels wrong, ask for help. No deployment is worth risking data or user experience.

Happy deploying! 🚀
