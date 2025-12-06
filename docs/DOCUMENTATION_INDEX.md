# C4C Campus Documentation Index

Complete documentation for the C4C Campus platform. Find guides for teachers, students, developers, and administrators.

---

## Quick Navigation

### For Teachers
- **[Unified Teacher Dashboard Guide](guides/unified-teacher-dashboard.md)** - Complete guide to managing courses, cohorts, and student progress
- **[Progress Tracking Guide](guides/progress-tracking.md)** - Understanding student metrics and interventions
- **[Teacher Dashboard Guide](guides/teacher-dashboard.md)** - Legacy guide (see unified dashboard instead)

### For Students
- **[Getting Started](QUICKSTART.md#for-students)** - Browse courses and enroll
- **[Platform URLs](QUICKSTART.md#platform-urls)** - All key links and endpoints

### For Developers
- **[Quick Start Guide](QUICKSTART.md)** - Setup and deployment
- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Complete environment setup
- **[n8n Integration](N8N_SETUP.md)** - Workflow automation setup
- **[Database Schema](../schema.sql)** - Database structure and migrations

### For Admins
- **[Application Management](../README.md)** - Managing user applications and roles

---

## Platform URLs

### Production
- **Home**: https://c4c-campus.vercel.app
- **Login**: https://c4c-campus.vercel.app/login
- **Apply**: https://c4c-campus.vercel.app/apply

### Development (localhost:4321)
- **Home**: http://localhost:4321/
- **Teacher Dashboard**: http://localhost:4321/teacher
- **Student Dashboard**: http://localhost:4321/dashboard
- **Course Catalog**: http://localhost:4321/courses
- **Admin Portal**: http://localhost:4321/admin

---

## Documentation by Topic

### Courses & Curriculum
- **[Unified Teacher Dashboard](guides/unified-teacher-dashboard.md#creating-courses)** - Create and manage courses
- **[Platform Vision](C4C_CAMPUS_PLATFORM_VISION.md)** - Long-term product roadmap

### Student Progress
- **[Progress Tracking Guide](guides/progress-tracking.md)** - Understanding metrics
- **[Teacher Dashboard](guides/teacher-dashboard.md)** - Monitor student performance

### Cohorts & Groups
- **[Unified Teacher Dashboard](guides/unified-teacher-dashboard.md#managing-cohorts)** - Create and manage cohorts
- **[Cohort Schema](code-review-cohort-schema.md)** - Database schema details

### Discussions & Community
- **[Discussion System Index](DISCUSSION_SYSTEM_DOCUMENTATION_INDEX.md)** - Community features
- **[Moderation Guide](guides/moderation.md)** - Managing discussions

### Database & Technical
- **[Schema (SQL)](../schema.sql)** - Complete database schema
- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Database configuration
- **[Migrations](migrations/)** - Database change history

### API Reference
- **[Cohorts API](api/cohorts.md)** - Cohort endpoints

---

## Feature Documentation

### Complete Features

| Feature | Location | Type | Audience |
|---------|----------|------|----------|
| Course Management | [Unified Dashboard](guides/unified-teacher-dashboard.md) | Guide | Teachers |
| Cohort Management | [Unified Dashboard](guides/unified-teacher-dashboard.md) | Guide | Teachers |
| Progress Tracking | [Progress Guide](guides/progress-tracking.md) | Guide | Teachers |
| Discussions | [Discussion Index](DISCUSSION_SYSTEM_DOCUMENTATION_INDEX.md) | Index | All |
| Student Dashboard | [Quick Start](QUICKSTART.md) | Quick Ref | Students |
| Database | [Setup Instructions](SETUP_INSTRUCTIONS.md) | Setup | Developers |

---

## Getting Started Guides

### First Time Teacher
1. **Login**: https://c4c-campus.vercel.app/login
2. **Read**: [Unified Teacher Dashboard](guides/unified-teacher-dashboard.md)
3. **Create**: Your first course
4. **Organize**: Create cohorts
5. **Monitor**: Student progress

### First Time Student
1. **Explore**: [Course Catalog](https://c4c-campus.vercel.app/courses)
2. **Apply**: [Join a Course](https://c4c-campus.vercel.app/apply)
3. **Access**: [Student Dashboard](https://c4c-campus.vercel.app/dashboard)
4. **Learn**: Watch lessons and join discussions

### First Time Developer
1. **Setup**: Follow [Quick Start](QUICKSTART.md)
2. **Review**: [Setup Instructions](SETUP_INSTRUCTIONS.md)
3. **Configure**: Supabase and n8n
4. **Test**: Run test suite
5. **Deploy**: Via Vercel

---

## Troubleshooting

### Can't find what you're looking for?
- Check the **[Unified Teacher Dashboard FAQ](guides/unified-teacher-dashboard.md#faqs)** for common questions
- Review **[Progress Tracking](guides/progress-tracking.md)** for metric questions
- See **[Setup Instructions](SETUP_INSTRUCTIONS.md)** for technical issues

### Report an issue
- Email: support@c4c-campus.com
- Slack: c4c.slack.com/teachers
- GitHub: [Project Repo](https://github.com/c4c-campus/website)

---

## Document Index by File

### Root Level
- **[README.md](../README.md)** - Project overview and setup
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history (v2.0.0 current)

### /docs/guides/
- **[unified-teacher-dashboard.md](guides/unified-teacher-dashboard.md)** - Complete teacher dashboard guide (627 lines)
- **[progress-tracking.md](guides/progress-tracking.md)** - Progress metrics and intervention strategies
- **[teacher-dashboard.md](guides/teacher-dashboard.md)** - Student roster and engagement tracking
- **[moderation.md](guides/moderation.md)** - Discussion moderation

### /docs/
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide with URLs (201 lines)
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[N8N_SETUP.md](N8N_SETUP.md)** - Workflow automation setup
- **[C4C_CAMPUS_PLATFORM_VISION.md](C4C_CAMPUS_PLATFORM_VISION.md)** - Product roadmap
- **[DISCUSSION_SYSTEM_DOCUMENTATION_INDEX.md](DISCUSSION_SYSTEM_DOCUMENTATION_INDEX.md)** - Community features
- **[DISCUSSION_SYSTEM_MIGRATION_GUIDE.md](DISCUSSION_SYSTEM_MIGRATION_GUIDE.md)** - Database migration

### /docs/diagrams/
- **[cohort-erd.md](diagrams/cohort-erd.md)** - Entity relationship diagram
- **[discussion-erd.md](diagrams/discussion-erd.md)** - Discussion system schema

### /docs/api/
- **[cohorts.md](api/cohorts.md)** - Cohort API reference

### /docs/security/
- **[cohort-rls-policies.md](security/cohort-rls-policies.md)** - Row Level Security

### /docs/migrations/
- **[001-add-cohort-system.md](migrations/001-add-cohort-system.md)** - Database migration v1

---

## Document Maintenance

### Version Information
- **Current Version**: 2.0.0 (Released October 29, 2025)
- **Maintained By**: C4C Platform Team
- **Last Updated**: October 29, 2025
- **Contact**: teachers@c4c-campus.com

### Documentation Standards
- Uses Markdown format
- Follows semantic heading hierarchy
- Includes cross-references
- Contains code examples where appropriate
- Provides visual diagrams (ASCII)
- Includes email templates for common tasks

### Updating Documentation
When updating documentation:
1. Follow the same format as existing files
2. Update version numbers and dates
3. Add entry to CHANGELOG.md
4. Test all links and references
5. Review for consistency with platform features

---

## Quick Reference

### Most Used Documents
1. **[Unified Teacher Dashboard](guides/unified-teacher-dashboard.md)** - 627 lines, comprehensive teacher guide
2. **[Quick Start](QUICKSTART.md)** - 201 lines, setup and URLs
3. **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Complete environment setup

### For Each Role
- **Teachers**: [Unified Teacher Dashboard](guides/unified-teacher-dashboard.md)
- **Students**: [Quick Start - Student Features](QUICKSTART.md#for-students)
- **Developers**: [Quick Start](QUICKSTART.md) + [Setup Instructions](SETUP_INSTRUCTIONS.md)
- **Admins**: [README](../README.md) + [CHANGELOG](../CHANGELOG.md)

### Learning Path
1. **Understand**: Read [Platform Vision](C4C_CAMPUS_PLATFORM_VISION.md)
2. **Setup**: Follow [Quick Start](QUICKSTART.md)
3. **Deploy**: Follow [Setup Instructions](SETUP_INSTRUCTIONS.md)
4. **Manage**: Read [Unified Teacher Dashboard](guides/unified-teacher-dashboard.md)
5. **Monitor**: Read [Progress Tracking](guides/progress-tracking.md)

---

**Documentation Version**: 2.0.0
**Last Updated**: October 29, 2025
**Maintained By**: C4C Platform Team
**Feedback**: teachers@c4c-campus.com

For questions or issues, see [Support Resources](guides/unified-teacher-dashboard.md#support-resources).
