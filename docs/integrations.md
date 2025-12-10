# C4C Campus External Integrations

This document describes the external services and APIs that C4C Campus integrates with, their purposes, and how they connect to the system.

## Integration Overview

| Service | Purpose | Status | Required |
|---------|---------|--------|----------|
| Supabase | Database, Auth, Storage, Realtime | Active | **Yes** |
| Resend | Transactional emails | Active | **Yes** |
| Vercel | Hosting & CDN | Active | **Yes** |
| Stripe | Payment processing | Partial | No |
| Google Translate | Multi-language support | Active | No |

## Supabase

Supabase is the primary backend infrastructure, providing four integrated services:

### PostgreSQL Database
- **34 tables** defined in `schema.sql`
- Row-Level Security (RLS) policies enforce authorization
- Custom functions for complex operations (enrollment, submissions)
- Triggers for automatic timestamps and cascading updates

### Authentication
- Email/password authentication
- Session management via JWT tokens
- Automatic token refresh
- Password reset flow

**How it connects:**
```
Browser → Login form → Supabase Auth → JWT token
Token stored in cookies + localStorage
Every request → Middleware extracts token → Validates session
```

### Storage
- Private bucket for assignment submissions
- Signed URLs for secure file access (1-hour expiration)
- File validation (size, type, security checks)

**How it connects:**
```
Student uploads file → Server validates → Supabase Storage
Teacher requests file → Authorization check → Signed URL generated
```

### Realtime
- WebSocket connections for live updates
- Used for discussion threads, notifications
- Presence tracking for typing indicators

**Configuration:**
```
Environment Variables:
- PUBLIC_SUPABASE_URL
- PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side only)
```

## Resend (Email)

Transactional email service for critical user communications.

### Email Types Sent

| Event | Recipient | Purpose |
|-------|-----------|---------|
| Application received | Applicant | Confirm submission |
| Application approved | Applicant | Welcome + next steps |
| Enrollment confirmed | Student | Course/cohort details |
| Assignment submitted | Teacher | Review notification |
| Assignment graded | Student | Grade + feedback |
| Contact form | Admin | Inquiry forwarding |

### How It Connects

```
Application approved → log_application_approval() trigger
    │
    ▼
email-notifications.ts → Resend API → Applicant inbox
```

**Configuration:**
```
Environment Variables:
- RESEND_API_KEY

Constants:
- FROM_EMAIL: notifications@updates.codeforcompassion.com
- ADMIN_EMAIL: info@codeforcompassion.com
```

## Vercel (Hosting)

Vercel provides hosting infrastructure optimized for Astro's SSR mode.

### Services Used

| Feature | Purpose |
|---------|---------|
| Serverless Functions | API endpoints and SSR |
| Edge Network | Global CDN for static assets |
| Environment Variables | Secret management |
| Preview Deployments | PR previews |

### Configuration

`astro.config.mjs`:
```javascript
adapter: vercel()  // Enables Vercel-specific optimizations
output: 'server'   // Full SSR mode
```

`vercel.json`:
```json
{
  "headers": [
    // Security headers applied at edge
  ]
}
```

## Stripe (Payments)

**Status: Partially Implemented**

Frontend pricing UI exists, but backend payment processing is incomplete.

### What Exists

- Pricing table component with Free/Pro/Enterprise tiers
- Stripe.js loaded on client
- Database tables: `payments`, `subscriptions`

### What's Missing

- No checkout session creation endpoint
- No webhook handler for subscription events
- Environment variables defined but not actively used

**Configuration (prepared but not active):**
```
Environment Variables:
- PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
```

### Pricing Tiers (UI only)

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic course access |
| Pro | $29/mo or $290/yr | Premium courses, cohorts |
| Enterprise | Custom | White-label, API access |

## Google Translate

Client-side translation widget for multi-language support.

### How It Works

- Widget embedded in `BaseLayout.astro`
- Supports 18 languages (including 10+ Indian languages)
- No API key required (client-side widget)
- Language selector in site header

### Supported Languages
English, Spanish, French, German, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Arabic, Portuguese, Japanese, Korean, Chinese (Simplified)

## AI Assistant (Future)

**Status: Database schema exists, no active integration**

### Prepared Infrastructure

Database tables ready for AI chat:
- `ai_conversations` - Chat sessions linked to courses/lessons
- `ai_messages` - User/assistant/system messages
- `ai_usage_logs` - Token usage tracking

### Intended Purpose
- In-course AI tutor with context awareness
- Cost monitoring per user/model
- Default model: `claude-3.5-sonnet`

No API integration code exists yet.

## Data Flow Summary

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Vercel    │────▶│  Supabase   │
│  (Client)   │◀────│   (Edge)    │◀────│  (Backend)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Google    │     │   Resend    │     │   Stripe    │
│  Translate  │     │   (Email)   │     │ (Payments)  │
└─────────────┘     └─────────────┘     └─────────────┘
   (active)           (active)           (partial)
```

## Environment Variables

### Required for Production

```bash
# Supabase (required)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only, never expose

# Email (required)
RESEND_API_KEY=re_...
```

### Optional

```bash
# Payments (not active)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database direct access (for scripts)
DATABASE_URL=postgresql://...
```

## Security Considerations

### Supabase
- RLS policies enforce data access at database level
- Service role key NEVER exposed to client
- Anon key has limited permissions via RLS

### File Storage
- All uploads go to private bucket
- Access only via time-limited signed URLs
- File validation prevents malicious uploads

### Authentication
- Sessions validated server-side
- Tokens stored in HttpOnly cookies (when possible)
- CSRF protection on state-changing operations

### Third-Party Scripts
- Google Translate widget sandboxed
- Stripe.js loaded from trusted CDN
- CSP headers restrict script sources

## Monitoring & Observability

### Built-in Tracking

| What | Where | Purpose |
|------|-------|---------|
| Request timing | Middleware | Performance monitoring |
| Slow requests (>1s) | Server logs | Performance alerts |
| Auth failures | `auth_logs` table | Security monitoring |
| User events | `analytics_events` table | Behavior analysis |

### What's Not Tracked
- No external analytics (Google Analytics, etc.)
- No error monitoring service (Sentry, etc.)
- Logging is basic console output

## Adding New Integrations

When adding a new external service:

1. **Environment variables** - Add to `.env.example`
2. **Library file** - Create in `src/lib/`
3. **Error handling** - Graceful degradation if service unavailable
4. **Documentation** - Update this file
5. **Security** - Review for data exposure, add to CSP if needed
