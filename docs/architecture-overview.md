# C4C Campus Architecture Overview

This document provides a high-level mental model of the C4C Campus system architecture. It describes the shape of the system and how major components connect, not implementation details.

## What Is C4C Campus?

C4C Campus is a **cohort-based learning management system** for the Code for Compassion organization. It trains developers to build AI tools for animal advocacy, climate action, and AI safety through:

- Weekend Bootcamps
- Global Hackathons
- Full-Time Accelerator programs

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Astro 5 (SSR mode) | Server-rendered pages with React islands |
| **UI Components** | React 19 | Interactive client-side components |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Database** | PostgreSQL (Supabase) | All persistent data |
| **Auth** | Supabase Auth | User authentication and sessions |
| **File Storage** | Supabase Storage | Assignment uploads, media |
| **Email** | Resend | Transactional notifications |
| **Payments** | Stripe | Subscription billing (partially implemented) |
| **Hosting** | Vercel | SSR deployment with edge CDN |

## System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Astro Pages  │  │    React     │  │   Client-side JS     │  │
│  │   (SSR)      │  │  Components  │  │  (hydration)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                            │
│  Performance → CORS → Auth → Static Assets → Cache → Security   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ /api/apply │  │/api/quizzes│  │/api/cohorts│  ...           │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LIBRARY LAYER                                 │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐               │
│  │ supabase.ts│  │time-gating │  │api-handlers │  ...          │
│  └────────────┘  └────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │   Auth   │  │ Storage  │  │ Realtime │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

A typical request flows through these stages:

1. **Browser** sends request to Vercel edge
2. **Middleware chain** executes (auth, security headers, caching)
3. **Astro page** runs server-side, queries Supabase
4. **HTML response** sent to browser
5. **React components** hydrate for interactivity
6. **Client-side actions** call API endpoints

## Key Architectural Decisions

### Schema Immutability
The database schema (`schema.sql`) is the **absolute source of truth**. Code adapts to the schema, never the reverse. This prevents drift between application expectations and database reality.

### Server-Side Authentication
All protected routes are validated in middleware before page render. This prevents client-side bypass attacks where malicious JavaScript could skip authorization checks.

### Row-Level Security
Database tables have PostgreSQL RLS policies. Authorization happens at the database level, not just the application level. Even if application code has bugs, the database enforces access rules.

### Cohort-First Design
The system is built around **cohorts** (time-bounded learning groups) rather than simple course enrollments. This enables:
- Time-gated content release
- Cohort-scoped discussions
- Group progress tracking
- Enrollment caps

### Type Safety
Two-layer type system:
1. **Generated types** (`src/types/generated.ts`) - Auto-generated from database, never hand-edited
2. **Application types** (`src/types/index.ts`) - Extends generated types with stricter constraints

## Directory Structure

```
src/
├── components/          # React components (islands)
│   ├── student/         # Student-facing features
│   ├── teacher/         # Teaching tools
│   ├── analytics/       # Charts and metrics
│   └── ...
├── layouts/             # Astro layout templates
│   ├── BaseLayout.astro # Root layout (header, footer, toast)
│   ├── TeacherLayout.astro
│   └── AdminLayout.astro
├── lib/                 # Shared utilities
│   ├── supabase.ts      # Database client
│   ├── time-gating.ts   # Cohort scheduling logic
│   ├── api-handlers.ts  # Request validation
│   └── ...
├── middleware/          # Request processing
│   ├── auth.ts          # Authentication checks
│   └── cache-middleware.ts
├── pages/               # Routes (Astro + API)
│   ├── api/             # REST endpoints
│   ├── admin/           # Admin panel
│   ├── teacher/         # Teacher dashboard
│   └── ...
└── types/               # TypeScript definitions
    ├── generated.ts     # Auto-generated (DO NOT EDIT)
    └── index.ts         # Application types
```

## Three User Portals

The application has three distinct interfaces based on user role:

### Student Portal (`/dashboard`, `/lessons/*`, `/assignments/*`)
- View enrolled courses and progress
- Watch lessons with resume capability
- Submit assignments and take quizzes
- Participate in cohort discussions

### Teacher Portal (`/teacher/*`)
- Manage own courses and content
- Create and configure cohorts
- Set module unlock schedules
- Grade assignments and review quizzes
- Monitor student progress

### Admin Portal (`/admin/*`)
- Review and process applications
- Manage all users and roles
- View platform-wide analytics
- Oversee all cohorts

## Data Flow Patterns

### Reading Data (Server-Side)
```
Astro Page → Supabase Query → Transform → Render HTML → Hydrate React
```

### Writing Data (Client-Side)
```
React Component → fetch() → API Endpoint → Validate → Supabase Mutation → Response
```

### Real-time Updates
```
Supabase Realtime → WebSocket → Subscription Callback → React State Update
```

## External Dependencies

| Service | Required? | Purpose |
|---------|-----------|---------|
| Supabase | **Yes** | All data, auth, and storage |
| Resend | **Yes** | Email notifications |
| Vercel | **Yes** | Hosting and deployment |
| Stripe | No* | Payment processing |

*Stripe integration exists but is not fully implemented.

## Next Steps

For deeper understanding, see:
- [Data Model](./data-model.md) - Entity relationships and schema
- [API Reference](./api-reference.md) - Endpoint overview
- [Integrations](./integrations.md) - External service details
