# C4C Campus Admin Documentation

Welcome to the C4C Campus Administration documentation. This comprehensive guide covers all aspects of platform administration, from day-to-day operations to advanced procedures.

## Quick Start

If you're new to C4C Campus administration:

1. **Start Here:** [Training Materials](./training-materials.md)
2. **Daily Operations:** [Admin Dashboard Guide](./admin-dashboard.md)
3. **Common Tasks:** See guide sections below

## Documentation Structure

### Core Guides

#### 1. [Admin Dashboard Guide](./admin-dashboard.md)
Your main overview of platform health and activity.

**Topics:**
- Dashboard overview and widgets
- Understanding key statistics
- System health monitoring
- Quick actions and navigation
- Real-time data updates

**Best for:** Daily check-ins, platform monitoring, quick insights

#### 2. [User Management Guide](./user-management.md)
Manage user roles, permissions, and access.

**Topics:**
- Viewing and searching users
- Changing individual user roles
- Bulk role assignments
- Role types and responsibilities
- Best practices for user management

**Best for:** Assigning roles, bulk operations, user access control

#### 3. [Application Review Guide](./application-review.md)
Process and manage program applications.

**Topics:**
- Application review workflow
- Status management (approve, reject, waitlist)
- Quick reviews and detailed reviews
- Bulk operations for applications
- Search and filtering
- Application history

**Best for:** Reviewing applicants, making approval decisions, processing applications

#### 4. [Analytics Guide](./analytics.md)
Understand platform performance and user engagement.

**Topics:**
- Key metrics explanation
- Chart interpretation
- Enrollment trends
- Completion rates
- Course popularity
- Cohort performance
- Using data for decisions

**Best for:** Understanding platform metrics, making data-driven decisions, identifying trends

### Support Resources

#### 5. [Training Materials](./training-materials.md)
Comprehensive training program for new admins.

**Modules:**
- Module 1: Access and Setup (30 min)
- Module 2: Understanding User Roles (30 min)
- Module 3: Processing Applications (45 min)
- Module 4: Managing Users Effectively (30 min)
- Module 5: Reading Platform Analytics (30 min)

**Also includes:**
- Training schedule (3 weeks)
- Success criteria and assessment
- Quick reference card
- Certification process

**Best for:** Onboarding new admins, comprehensive training, certification

#### 6. [Troubleshooting Guide](./troubleshooting.md)
Solutions for common problems and errors.

**Topics:**
- Access and authentication issues
- Dashboard loading problems
- User management issues
- Application review issues
- Analytics problems
- System health issues
- When and how to contact support

**Best for:** Fixing problems, debugging issues, getting unstuck

#### 7. [Backup & Restore Procedures](./backup-restore-procedures.md)
Protect data and recover from failures.

**Topics:**
- Backup strategy and types
- Automatic backup verification
- Manual database exports
- Full restore procedures
- Disaster recovery planning
- Testing restores
- Emergency procedures

**Best for:** Data protection, emergency recovery, disaster planning

## Common Tasks Quick Reference

### Daily Operations

**Check Platform Health**
1. Go to Admin Dashboard
2. Review overview statistics
3. Check system health status
4. Note any alerts

**Process Applications**
1. Go to Applications page
2. Filter: Status = "Pending"
3. Review each application
4. Make approval decision
5. Move to next

**Review Analytics**
1. Go to Analytics page
2. Check enrollment trend
3. Review completion rates
4. Note any concerning metrics

### Weekly Operations

**Audit User Roles**
1. Go to User Management
2. Filter by role: "Admin"
3. Review all admins
4. Verify each should have access
5. Document review

**Manage Pending Items**
1. Check pending applications count
2. Process any pending applications
3. Review pending user requests
4. Update team on status

### Monthly Operations

**Comprehensive Review**
1. Review all analytics
2. Audit user access
3. Check system health
4. Document findings
5. Plan improvements

**Data Protection**
1. Verify recent backups
2. Test backup restore
3. Document process
4. Update runbooks

## Access and Permissions

### Admin Credentials

You need:
- Email address with admin access
- Password
- MFA enabled (if configured)

### Admin Role Requirements

Only users with `role = 'admin'` can:
- Access admin dashboard
- View/manage users
- Review applications
- Access analytics
- Perform bulk operations

### Multiple Factor Authentication (MFA)

If MFA is configured:
1. You'll be prompted for second factor
2. Use authenticator app or SMS
3. Enter code to complete login
4. Session remains authenticated

## Platform Access

### Admin URLs

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/dashboard` | Platform overview |
| Users | `/admin/users` | User management |
| Applications | `/admin/applications` | Application review |
| Analytics | `/admin/analytics` | Platform insights |

### Keyboard Shortcuts

- `F5` - Refresh page
- `F12` - Open developer tools
- `Ctrl+F` (Cmd+F) - Find on page
- `Ctrl+K` - Focus search (some pages)

## Best Practices

### Security
1. Never share admin password
2. Use strong, unique password
3. Enable MFA if available
4. Logout when done
5. Audit access regularly

### Operations
1. Document your actions
2. Use bulk operations for efficiency
3. Test on non-critical data first
4. Follow change procedures
5. Communicate with team

### Data Protection
1. Create backups before changes
2. Test restore procedures
3. Monitor disk space
4. Verify backup integrity
5. Keep audit logs

## Key Metrics You Should Know

**Daily:**
- Pending applications count
- System health status
- Database connection status

**Weekly:**
- Enrollment trends
- Completion rates
- New user registrations
- Active user count

**Monthly:**
- Total platform growth
- Course popularity
- User retention rates
- Admin access audit

## Emergency Procedures

### If You Can't Access Admin Panel
1. Check if you're logged in
2. Verify your role is "admin"
3. Clear browser cache
4. Try incognito window
5. Contact support

### If Platform Is Down
1. Check status page: [status.c4c-campus.com]
2. Wait for incident updates
3. Do not attempt restoration
4. Contact technical support

### If Data Looks Wrong
1. Refresh page
2. Wait for sync (30 sec)
3. Check other admins see same
4. Contact support if persistent
5. Don't make changes until verified

## Team Communication

### Key Contacts

- **Admin Team Lead:** [Name/Email]
- **Technical Support:** support@c4c-campus.com
- **Database Admin:** dba@c4c-campus.com
- **Emergency:** [Phone/Email]

### Communication Channels

- Slack: #admin-channel
- Email: admin@c4c-campus.com
- GitHub: [Issues link]

## Documentation Updates

This documentation is maintained and updated regularly.

**Last Updated:** October 29, 2025
**Next Review:** November 29, 2025
**Maintained By:** Admin Team

### Reporting Issues

Found an error or outdated information?
1. Note the issue and section
2. Email: docs@c4c-campus.com
3. Or submit PR to GitHub

## Suggested Reading Order

### New Admin (Week 1)
1. This README
2. [Training Materials](./training-materials.md) - Module 1 & 2
3. [Admin Dashboard Guide](./admin-dashboard.md)
4. [Troubleshooting Guide](./troubleshooting.md) - first section

### Week 2-3
1. [Training Materials](./training-materials.md) - Module 3 & 4
2. [Application Review Guide](./application-review.md)
3. [User Management Guide](./user-management.md)

### Ongoing Reference
1. [Analytics Guide](./analytics.md) - for data interpretation
2. [Troubleshooting Guide](./troubleshooting.md) - for problems
3. [Backup & Restore](./backup-restore-procedures.md) - as needed

## Glossary

**Admin:** User with administrative access to platform
**RLS:** Row-Level Security - data privacy protection
**Service Role:** Database access with elevated permissions
**Cohort:** Group of students in same course at same time
**Enrollment:** Student registration in a course
**Application:** New user signup for program
**Status:** State of application (pending, approved, rejected, waitlisted)

## FAQ

### Q: How often should I process applications?
A: Daily or at least 3x per week. Check applications daily, process at scheduled times.

### Q: Can I change my own admin role?
A: No, for security. Another admin must make this change.

### Q: What happens if I approve wrong person?
A: Contact another admin immediately. They can revoke approval and restore status.

### Q: How long are backups kept?
A: Automatic: 30 days. Manual: As configured. Archived: 1 year.

### Q: Can I undo a bulk operation?
A: Only by restoring database from backup. Always verify before confirming.

### Q: What if database looks corrupted?
A: Stop using it. Contact support immediately. Don't make changes.

### Q: How do I grant admin access?
A: Go to User Management, find user, change role to "Admin".

### Q: Who can delete users?
A: Only service role (not available through UI). Contact technical team.

## Related Resources

- [Platform Architecture](../ARCHITECTURE.md)
- [Security Guidelines](../SECURITY.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/SCHEMA.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 29, 2025 | Initial documentation |

## License

This documentation is proprietary to C4C Campus. Do not distribute externally.

---

**Need Help?** See [Troubleshooting Guide](./troubleshooting.md) or contact support@c4c-campus.com
