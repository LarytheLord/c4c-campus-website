# C4C Campus Website - AI Development Accelerator

**Location**: `/projects/c4c website` | **Status**: Production-Ready | **Updated**: November 1, 2025

## Overview

AI development accelerator platform for animal liberation with a three-stage pipeline:

1. **Bootcamp**: 4-8 week self-paced AI tool training
2. **Hackathons**: 48-hour weekend rapid prototyping
3. **Accelerator**: 3-6 month production deployment support

**Design Philosophy**: Gandhian Engineering (ASSURED) - Affordable, Scalable, Sustainable, Universal, Rapid, Excellent, Distinctive. Optimized for 3G connections in Global South (Bangalore, Nairobi, Jakarta).

## Core Features

### Learning Management
- **Courses**: Multi-track (animal advocacy, climate, AI safety, general), difficulty levels
- **Modules & Lessons**: Video-based with resume, text supplements, resource downloads
- **Progress Tracking**: Video resume, completion tracking, time spent
- **Discussions**: Threaded lesson comments, course forums with teacher responses

### Cohort System
- Time-gated learning groups with module unlock schedules
- Student roster management, cohort analytics
- Status: Upcoming, Active, Completed, Archived
- Per-cohort enrollment with teacher management

### Assessments
- **Assignments**: Rubric-based grading, file uploads with malware scanning
- **Quizzes**: Multiple question types, auto/manual grading
- Submission history, revisions tracking

### AI Teaching Assistant
- Floating chat widget with course-specific context
- Token usage tracking with daily limits by role
- Cost tracking across multiple AI models
- Quick actions for common queries

### Payments
- Stripe integration: one-time + subscriptions
- Tiers: Free, Pro (monthly/yearly), Enterprise
- Revenue sharing (70-80% teacher, 20-30% platform)
- Auto tax calculation, refund management

### Certifications
- Digital certificates with QR code verification
- Customizable templates, PDF download, social sharing

### Analytics
- Student progress dashboards, cohort performance
- Leaderboards, struggling student detection
- Time-series engagement, CSV export

### Messaging
- Direct messaging, system notifications
- Email notifications with templates
- Announcement broadcasting, read/unread tracking

### Admin Management
- User/role management, cohort administration
- Analytics dashboards, application review
- Platform configuration, search analytics

### Security
- Row-level security (RLS) for data isolation
- Malware scanning for uploads
- XSS protection (HTML sanitization)
- SQL injection prevention, CSRF tokens, rate limiting

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Astro | 5.x (SSR) |
| **UI** | React | 19.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase Auth | Email/password |
| **Payments** | Stripe | 19.2.0 |
| **AI** | OpenRouter | Claude 3.5, GPT-4, Llama 3.1 |
| **Email** | Resend | 6.3.0 |
| **Automation** | n8n | Workflows |
| **Editor** | TipTap | Rich text |
| **Charts** | Chart.js + D3 | Visualization |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **Build** | Vite + ESBuild | Optimization |

## Database Architecture

**Schema**: 45 tables, 160+ indexes, 101 RLS policies, 47 functions, 24 triggers, 9 materialized views

### Table Groups

| Group | Tables | Description |
|---|---|---|
| **Auth** | applications, auth_logs | User roles and auth events |
| **Courses** | courses, modules, lessons, lesson_progress, lesson_discussions | Course structure and progress |
| **Forums** | course_forums, forum_replies, forum_subscriptions | Discussions |
| **Enrollments** | enrollments, cohort_enrollments, cohorts, cohort_schedules | Enrollment management |
| **Assessments** | quizzes, quiz_questions, quiz_responses, assignments, assignment_rubrics, assignment_submissions | Quizzes and assignments |
| **Messaging** | message_threads, messages, notifications, announcements | Communication |
| **Analytics** | analytics_events, user_engagement_scores, leaderboards, cohort_analytics | Tracking and metrics |
| **AI** | ai_conversations, ai_messages, ai_usage_logs, ai_conversation_context | Teaching assistant |
| **Certificates** | certificate_templates, certificates | Certification |
| **Payments** | payments, refunds, subscriptions, payout_history | Financial |
| **Media** | media_library, media_audit_log, media_versions | File storage |

### Key Schema Features

**RLS**: 101 granular policies (student isolation, role-based access, service role elevated permissions)
**Data Integrity**: Foreign keys, CHECK constraints, auto timestamps, cascade deletes
**Performance**: Indexed primary/foreign/search keys, materialized views, full-text GIN indexes

## Authentication

### Flow
1. User submits email/password → Supabase Auth validates
2. Token stored in HTTP-only cookie `sb-[project-id]-auth-token`
3. Session established with user profile

### Middleware Protection
```typescript
// /src/middleware/auth.ts (147 lines)
- Public: /, /login, /courses, /about
- Auth Required: /dashboard
- Teacher: /teacher/* (teacher or admin role)
- Admin: /admin/* (admin role only)
```

**Role Checking**: Query applications table for user role, validate against route requirement

**Security Events**: Logs unauthorized access attempts

### Session Security
- HTTP-only cookies (prevent XSS)
- Secure flag on HTTPS
- SameSite policy (CSRF protection)
- 24-hour timeout with auto-refresh

## API Architecture

**Framework**: Astro API Routes (RESTful)
**Location**: `/src/pages/api/` (90 endpoint files)

### Endpoint Categories

| Category | Endpoints | Description |
|---|---|---|
| **Auth** | apply, apply-verification, apply-status | Application submission |
| **Enrollment** | enroll, enroll-cohort | Course/cohort enrollment |
| **Content** | content/*, lessons/*, modules/* | Course content CRUD |
| **Assessments** | assignments/*, submissions/*, quizzes/* | Assignment and quiz management |
| **Payments** | payments/create-checkout, payments/verify, payments/webhook | Stripe integration |
| **Messaging** | messages/*, announcements/*, notifications/* | Communication |
| **Analytics** | analytics/*, analytics/cohort-stats | Event tracking and reporting |
| **AI** | ai/* | Teaching assistant |
| **Search** | search/* | Full-text search |
| **Admin** | admin/* | Admin operations (11 files) |
| **Teacher** | teacher/* | Teacher tools (3 files) |
| **Certificates** | certificates/* | Certificate generation |
| **Integrations** | n8n-workflows, supabase-webhook | Automation |

### Response Format
```typescript
{
  success: boolean,
  data?: T,
  error?: { code: string, message: string }
}
```

**Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Server Error)

### Validation

**File**: `/src/lib/api-handlers.ts` (385 lines)

Functions: `validateCourseInput()`, `validateCohortInput()`, `checkEnrollment()`, `calculateCourseProgress()`

**Rules**: Required fields, URL-friendly slugs, enum validation, XSS sanitization (DOMPurify)

## Components

**Location**: `/src/components/` (51 files)

### Categories

| Category | Components |
|---|---|
| **Course** | CourseCard, CourseBuilder, LessonNav, ProgressBar, VideoPlayer |
| **Student** | AssignmentCard, DueDateCountdown, SubmissionStatus, FileUploader, AssignmentRubric |
| **Assessment** | QuizCard, QuizProgress, QuizResults, QuizTimer |
| **AI Chat** | ChatWidget, ChatPanel, ChatMessage, MessageInput, AIQuickActions, UsageDashboard |
| **Communication** | Comment, CommentInput, DiscussionThread |
| **Analytics** | ProgressChart, Leaderboard, StrugglingStudents |
| **Utility** | NotificationBell, ModerationActions, OptimizedImage |
| **Search** | SearchBar, SearchFilters, SearchSuggestions, SearchResults |

**Patterns**: React functional components with TypeScript interfaces, Tailwind CSS utility classes

## Key Libraries

### Supabase (`/src/lib/supabase.ts`)
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
**Usage**: Database queries, real-time subscriptions, file storage

### Stripe (`/src/lib/stripe.ts` - 596 lines)

**Features**: Customer management, checkout sessions, subscriptions, refunds, tax calculation, webhooks, payout management

**Pricing**:
- Free: $0
- Pro Monthly: $29.00
- Pro Yearly: $290.00 (17% off)
- Enterprise: Custom

**Revenue Share**: 70-80% teacher, 20-30% platform (based on performance)

### OpenRouter (`/src/lib/openrouter.ts` - 300+ lines)

**Models**: Claude 3.5 Sonnet ($3-15/M tokens), GPT-4 Turbo ($10-30/M), GPT-3.5 ($0.5-1.5/M), Llama 3.1 ($0.35-0.4/M)

**Daily Token Limits**: Student (100K), Teacher (500K), Admin (unlimited)

**Features**: Multi-model support, token tracking, cost calculation, caching

### Email (Resend - `/src/lib/email-notifications.ts` - 650+ lines)

**Templates**: Welcome, enrollment, assignment reminders, quiz notifications, certificates, password reset, admin alerts

### Notifications (`/src/lib/notification-service.ts` - 600+ lines)

In-app + email notifications, real-time updates, preferences, read/unread tracking

### File Upload (`/src/lib/file-upload.ts` - 300+ lines)

**Features**: Malware scanning (ClamAV), type/size validation, Supabase storage, signed URLs, versioning

**Supported**: PDF, DOCX, XLSX, TXT, JPG, PNG, GIF, WebP, MP4, WebM, MOV, ZIP

### Security (`/src/lib/security.ts` - 370+ lines)

```typescript
// Validation
isValidEmail(), isValidUUID(), isValidSlug(), isStrongPassword()
// Sanitization
sanitizeHTML(), stripHTML(), escapeHTML()
// Security
generateCSRFToken(), validateCSRFToken(), getSecurityHeaders()
```

### Analytics (`/src/lib/analytics/tracker.ts`)

**Events**: Page views, enrollments, lesson completions, assignments, quizzes, video watch, interactions

**Dropout Prediction**: Low completion (<20%), no activity >7 days, quiz score trends, assignment delays

### Search (`/src/lib/search.ts` - 300+ lines)

Full-text search, filters (difficulty, track, instructor), pagination, ranking, caching

**Database**: GIN indexes, PostgreSQL full-text, trigram similarity

## Security Implementation

### Authentication
- Password requirements: 8+ chars, uppercase, lowercase, number, special char
- HTTP-only cookies, Secure flag, SameSite policy, 24-hour timeout

### Data Protection
**101 RLS Policies**:
```sql
-- Student isolation
CREATE POLICY "Students see own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Teacher access to cohort students
CREATE POLICY "Teachers see cohort students" ON cohort_enrollments
  FOR SELECT USING (auth.uid() IN (SELECT created_by FROM cohorts WHERE id = cohort_id));

-- Admin sees all
CREATE POLICY "Admin sees all" ON enrollments
  FOR ALL USING (is_admin(auth.uid()));
```

**Encryption**: Sensitive fields at rest (Supabase), TLS 1.3 in transit

### Input Validation
- Server-side schema validation
- XSS prevention (DOMPurify)
- SQL injection prevention (parameterized queries)
- Pattern detection for malicious input

### API Security
- Content-Type validation, body size limits, token expiration
- Rate limiting: 100 req/min (public), 1000 req/min (authenticated), 10 req/min (login)
- CORS headers, CSRF tokens

### File Upload
```typescript
// 4-step validation
1. Check file extension
2. Verify MIME type
3. Check file size
4. Scan for malware (ClamAV)
```

**Storage**: Supabase bucket with RLS, signed URLs, audit logs

### Payment Security
- No credit card data stored (Stripe tokenization)
- Webhook signature verification
- PCI-DSS compliance via Stripe

### Security Headers
```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: (restrictive)
```

### Logging
- Security events: Unauthorized access, malware detected
- Audit trail: DB changes, admin actions, failed logins, API access

## Deployment

### Architecture
- **Hosting**: Vercel/Netlify recommended
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage + Stripe
- **Email**: Resend SMTP
- **AI**: OpenRouter
- **Automation**: n8n

### Docker
```bash
docker-compose up -d               # Production
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up  # Dev
docker-compose logs -f web         # View logs
```

### Environment Variables
```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_...

# Email & AI
RESEND_API_KEY=re_...
OPENROUTER_API_KEY=sk-...

# Application
PORT=4321
NODE_ENV=production
SITE=https://c4ccampus.org
```

### Build Process
```bash
npm run dev              # Development
npm run build            # Production build
npm run build:production # Build + optimize images
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```

**Optimization**: Code splitting, image optimization (Sharp), CSS inlining, HTML compression, asset fingerprinting

### Performance Targets
- **Lighthouse**: 95+ all categories
- **Bundle Size**: <200KB
- **Load Time**: <2s on 3G
- **Database Queries**: Indexed <50ms, full-text <200ms, aggregations <500ms

## Project Statistics

**Codebase**: 14,294+ lines library code, 51 component files, 90 API endpoints

| Metric | Value |
|---|---|
| Database Tables | 45 |
| Database Indexes | 160+ |
| RLS Policies | 101 |
| API Endpoints | 90 |
| React Components | 51 |
| Database Functions | 47 |
| Triggers | 24 |
| Materialized Views | 9 |

**Dependencies**: 17 production, 18 development

**Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, iOS Safari 14+, Chrome for Android

## Summary

C4C Campus is a comprehensive e-learning platform with:
- Robust Astro SSR + React + Supabase architecture
- Security-first design with 101 RLS policies
- Scalable database with 45 tables and 160+ indexes
- Rich features: courses, cohorts, assessments, AI chat, payments
- Modern stack: TypeScript, Tailwind, Vite optimization
- Production-ready with Docker support

**Status**: Production-ready, Phase 1 launch ready
**Last Schema Update**: October 31, 2025
