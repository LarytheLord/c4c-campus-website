# C4C Website - OpenPaws Integration Guide

**Tool:** Code for Compassion (C4C) Campus Website
**Tier:** Tier 1 - Active Production
**Difficulty:** Easy Integrate
**Status:** Production
**Last Updated:** November 4, 2025

---

## Table of Contents

1. [Purpose in OpenPaws](#purpose-in-openpaws)
2. [How It Works](#how-it-works)
3. [Architecture Integration](#architecture-integration)
4. [Database Integration](#database-integration)
5. [Setup & Configuration](#setup--configuration)
6. [API Endpoints](#api-endpoints)
7. [Usage Examples](#usage-examples)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Monitoring & Logging](#monitoring--logging)
11. [Troubleshooting](#troubleshooting)
12. [References](#references)

---

## Purpose in OpenPaws

### What Problem Does This Solve?

The C4C Campus Website solves the critical need for **structured, scalable campus organizing** by providing:

1. **Institutional Intelligence**: Tracks university sustainability and animal welfare policies across hundreds of campuses
2. **Student Mobilization**: Provides cohort-based AI training for campus activists
3. **Campaign Infrastructure**: Enables student organizers to build and deploy AI tools for advocacy campaigns
4. **Movement Building**: Creates a pipeline from education (bootcamp) → prototyping (hackathons) → deployment (accelerator)

**Example Workflow**: A student activist at UC Berkeley wants to launch a plant-based dining campaign. The C4C website:
- Shows them UC Berkeley's current sustainability grade and policy gaps
- Enrolls them in a 4-week bootcamp on AI advocacy tools
- Provides cohort-based learning with scheduled content releases
- Connects them with other campus organizers through discussions
- Equips them with AI-powered tools to analyze dining contracts and draft proposals

### Why This Tool?

We chose this approach because:
- **Institutional Data Integration**: Connects with OpenPaws' `c4c_institutions` database for comprehensive university tracking
- **Gandhian Engineering (ASSURED)**: Designed for Global South accessibility (3G optimized, <200KB bundle, works on cheap devices)
- **Cohort-Based Model**: Proven higher completion rates than self-paced courses (65% vs 15%)
- **Static Site + SSR Hybrid**: Fast, scalable, edge-cacheable with dynamic user experiences
- **Movement Integration**: Seamlessly connects campus campaigns with broader OpenPaws advocacy ecosystem

### Use Cases in OpenPaws

1. **Campus Campaign Organizer**: Student discovers their university's sustainability gaps, gets trained on AI advocacy tools, launches dining policy campaign
2. **AI Bootcamp Student**: Activist learns to build sentiment analysis tools for social media outreach, completes cohort-based training with peer support
3. **Hackathon Participant**: Weekend builder prototypes Reddit engagement bot, gets accelerator support to deploy at scale
4. **Institutional Researcher**: Analyst submits new university for evaluation, receives automated sustainability assessment via n8n workflow
5. **Teacher/Facilitator**: Course creator builds custom AI safety curriculum, manages cohorts across multiple campuses, tracks student progress

---

## How It Works

### Technical Overview

C4C Campus is an Astro-based SSR web application with React components, Supabase backend, and n8n workflow automation:

```
User Browser → Vercel/Netlify Edge → Astro SSR → React Components
                                           ↓
                                    Supabase PostgreSQL
                                    (c4c_institutions,
                                     c4c_institution_submissions,
                                     courses, enrollments, cohorts)
                                           ↓
                                    n8n Workflows
                                    (institution analysis,
                                     email notifications,
                                     progress tracking)
```

### Key Components

1. **Frontend (Astro 5.x + React 19)**
   - Server-side rendering for SEO and performance
   - React components for interactive features (video player, progress tracking, AI chat)
   - Tailwind CSS 4.x for styling
   - <200KB bundle size (ASSURED principles)

2. **Backend (Supabase)**
   - PostgreSQL database with 45+ tables
   - Row-Level Security (RLS) for multi-tenant data isolation
   - Supabase Auth for user management
   - Supabase Storage for course videos and materials

3. **Automation (n8n)**
   - Institution analysis workflows (scrape university data, generate sustainability reports)
   - Email notifications (enrollment confirmations, lesson reminders, assignment deadlines)
   - Progress tracking (daily engagement summaries, dropout prediction)

4. **AI Teaching Assistant (OpenRouter)**
   - Claude 3.5 Sonnet for course-specific help
   - Token usage tracking with daily limits
   - Cost optimization across multiple models

### Technology Stack

- **Language:** TypeScript 5.6.3
- **Framework:** Astro 5.15.1 (SSR mode)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4.1.16
- **Database:** Supabase (PostgreSQL 15+)
- **Auth:** Supabase Auth (email/password, magic links)
- **Storage:** Supabase Storage (videos, course materials)
- **Payments:** Stripe 19.2.0
- **Email:** Resend 6.3.0
- **AI:** OpenRouter (Claude 3.5, GPT-4, Llama 3.1)
- **Automation:** n8n (self-hosted or cloud)
- **Testing:** Vitest 4.0.4 + Playwright 1.56.1

### Data Flow

1. **Institution Submission Flow**
   ```
   User submits institution → c4c_institution_submissions table → n8n webhook
   → n8n fetches university data → AI analyzes sustainability policies
   → Results stored in c4c_institutions → User receives email notification
   ```

2. **Course Enrollment Flow**
   ```
   User applies → applications table → Admin approves → role='student'
   → User enrolls in course → enrollments + cohort_enrollments
   → Cohort schedule determines module unlocks → lesson_progress tracks completion
   → AI assistant provides personalized help → Certificate issued on completion
   ```

3. **Campus Campaign Flow**
   ```
   Student searches institution → c4c_institutions table shows grade/policies
   → Enrolls in bootcamp → Completes cohort-based training
   → Builds campaign tools (AI-powered) → Deploys on campus
   → Reports results → Institution grade updated
   ```

---

## Architecture Integration

### Service Registry

The C4C website registers as a frontend service in OpenPaws:

```typescript
// Conceptual registration (actual implementation in deployment)
await registerService({
  name: 'c4c-campus-website',
  displayName: 'C4C Campus Website',
  type: 'frontend',
  baseUrl: process.env.SITE || 'https://c4ccampus.org',
  capabilities: [
    'campus-organizing',
    'institution-tracking',
    'cohort-learning',
    'ai-training',
    'campaign-infrastructure'
  ],
  version: '2.0.0',
  healthCheckPath: '/api/health'
});
```

### AI Orchestrator Integration

The C4C website integrates with OpenPaws AI orchestration through:

- **Tool ID:** `c4c-campus`
- **Input Schema:** User profile, institutional data, course enrollment
- **Output Schema:** Trained activists with AI tool skills, institutional intelligence, campaign materials
- **Workflow Position:** Entry point for campus organizing → Training → Campaign deployment

**Example Multi-Step Workflow:**
```
Step 1: Institution Research (c4c-campus) → University sustainability data
Step 2: Campaign Planning (AI Orchestrator) → Strategy recommendations
Step 3: Tool Building (Bootcamp) → AI advocacy tools
Step 4: Deployment (Accelerator) → Production campaigns
Step 5: Impact Tracking (Analytics) → Results measurement
```

### Dependencies

**OpenPaws Services This Tool Depends On:**

- **Supabase Database:** Core data storage (institutions, courses, enrollments)
  - Tables: `c4c_institutions`, `c4c_institution_submissions`, `applications`, `courses`, `modules`, `lessons`, `enrollments`, `cohorts`, `cohort_enrollments`
- **n8n Workflows:** Automation for institution analysis, notifications
  - Workflows: Institution analysis, email notifications, progress tracking
- **OpenRouter:** AI teaching assistant
  - Models: Claude 3.5 Sonnet, GPT-4 Turbo

**Tools That Depend on This Service:**

- **Campus Organizer Dashboard:** Uses institution data for campaign targeting
- **Reddit Engagement Tool:** Bootcamp graduates deploy this on campus subreddits
- **Social Media Sentiment Analysis:** Trained through C4C curriculum, deployed in campaigns
- **Politician Tracker:** Campus campaigns target local politicians using this data

---

## Database Integration

### Tables Used

#### Primary Tables (C4C-Specific)

**Table: `c4c_institutions`**
- **Purpose:** Stores university sustainability and animal welfare data
- **Access:** Read (public), Write (admin/automated via n8n)
- **Key Columns:**
  - `id` (UUID) - Primary key
  - `name` (TEXT) - University name (unique)
  - `slug` (TEXT) - URL-friendly identifier
  - `type` (TEXT) - university/college/community_college/institute
  - `city`, `state`, `country` - Location
  - `overall_grade` (TEXT) - Sustainability grade (A-F)
  - `overall_grade_score` (INTEGER) - Numeric score for ranking
  - `overall_percentile_score` (INTEGER) - Percentile ranking
  - `vegan_options` (TEXT) - Dining policy assessment
  - `environmental_policy` (TEXT) - Climate commitments
  - `animal_welfare_policy` (TEXT) - Animal product policies
  - `carbon_emissions_report_link` (TEXT) - Carbon reporting
  - `certifications` (TEXT[]) - Green certifications
  - `metadata` (JSONB) - Additional data
- **Example:**
  ```sql
  SELECT name, overall_grade, overall_grade_score, vegan_options
  FROM c4c_institutions
  WHERE state = 'CA'
  ORDER BY overall_grade_score DESC
  LIMIT 10;
  ```

**Table: `c4c_institution_submissions`**
- **Purpose:** User-submitted institutions pending analysis
- **Access:** Write (authenticated users), Read (admins)
- **Key Columns:**
  - `id` (UUID) - Primary key
  - `institution_name` (TEXT) - Submitted name
  - `submitter_email` (TEXT) - Contact email
  - `submitter_user_id` (UUID) - FK to profiles (optional)
  - `status` (TEXT) - pending/processing/completed/duplicate/rejected
  - `error_message` (TEXT) - Processing errors
  - `created_at` (TIMESTAMPTZ) - Submission timestamp
  - `processed_at` (TIMESTAMPTZ) - Analysis completion
- **Example:**
  ```sql
  INSERT INTO c4c_institution_submissions (institution_name, submitter_email)
  VALUES ('Stanford University', 'student@stanford.edu')
  RETURNING id;
  ```

#### Shared Tables (OpenPaws Platform)

**Table: `applications`**
- **Purpose:** User applications for bootcamp/accelerator/hackathon
- **Access:** Read/Write (own data), Read (admins)
- **Key Columns:**
  - `id` (UUID), `user_id` (UUID FK to auth.users)
  - `program` (TEXT) - bootcamp/accelerator/hackathon
  - `status` (TEXT) - pending/approved/rejected/waitlisted
  - `role` (TEXT) - student/teacher/admin
  - `name`, `email`, `whatsapp`, `location`, `discord`
  - `interests` (TEXT[]), `motivation`, `technical_experience`
- **Example:**
  ```sql
  SELECT id, name, program, status
  FROM applications
  WHERE user_id = auth.uid();
  ```

**Table: `courses`**
- **Purpose:** Course catalog (AI training, advocacy skills)
- **Access:** Read (public), Write (teachers/admins)
- **Key Columns:**
  - `id` (UUID), `slug` (TEXT), `title`, `description`
  - `track` (TEXT) - animal_advocacy/climate/ai_safety/general
  - `difficulty` (TEXT) - beginner/intermediate/advanced
  - `is_published` (BOOLEAN), `thumbnail_url`
  - `created_by` (UUID FK to auth.users)
- **Example:**
  ```sql
  SELECT title, track, difficulty
  FROM courses
  WHERE is_published = true AND track = 'animal_advocacy';
  ```

**Table: `modules`**
- **Purpose:** Course sections containing grouped lessons
- **Access:** Read (enrolled students), Write (course creator)
- **Key Columns:**
  - `course_id` (UUID FK), `title`, `description`, `order_index`
- **Example:**
  ```sql
  SELECT title, order_index
  FROM modules
  WHERE course_id = 'course-uuid'
  ORDER BY order_index;
  ```

**Table: `lessons`**
- **Purpose:** Individual learning units (videos, text, resources)
- **Access:** Read (enrolled students if unlocked), Write (course creator)
- **Key Columns:**
  - `module_id` (UUID FK), `title`, `content`, `video_url`
  - `duration_minutes`, `order_index`, `is_preview`
- **Example:**
  ```sql
  SELECT l.title, l.video_url, l.duration_minutes
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE m.course_id = 'course-uuid'
  ORDER BY m.order_index, l.order_index;
  ```

**Table: `enrollments`**
- **Purpose:** Tracks user course enrollments
- **Access:** Read/Write (own data), Read (teachers for their courses)
- **Key Columns:**
  - `user_id` (UUID FK), `course_id` (UUID FK)
  - `enrolled_at`, `completed_at`, `progress_percentage`
- **Example:**
  ```sql
  SELECT c.title, e.progress_percentage, e.enrolled_at
  FROM enrollments e
  JOIN courses c ON e.course_id = c.id
  WHERE e.user_id = auth.uid();
  ```

**Table: `cohorts`**
- **Purpose:** Time-gated learning groups with scheduled module releases
- **Access:** Read (enrolled students), Write (course creator)
- **Key Columns:**
  - `course_id` (UUID FK), `name`, `start_date`, `end_date`
  - `status` (TEXT) - upcoming/active/completed/archived
  - `max_students` (INTEGER), `created_by` (UUID FK)
- **Example:**
  ```sql
  SELECT name, start_date, status
  FROM cohorts
  WHERE course_id = 'course-uuid' AND status = 'active';
  ```

**Table: `cohort_enrollments`**
- **Purpose:** Student enrollment in specific cohorts
- **Access:** Read (cohort members), Write (course creator)
- **Key Columns:**
  - `cohort_id` (UUID FK), `user_id` (UUID FK)
  - `status` (TEXT) - active/completed/dropped/paused
  - `progress` (JSONB), `last_activity_at`
- **Example:**
  ```sql
  SELECT u.email, ce.status, ce.last_activity_at
  FROM cohort_enrollments ce
  JOIN auth.users u ON ce.user_id = u.id
  WHERE ce.cohort_id = 'cohort-uuid';
  ```

**Table: `cohort_schedules`**
- **Purpose:** Defines when modules unlock for cohorts
- **Access:** Read (cohort members), Write (course creator)
- **Key Columns:**
  - `cohort_id` (UUID FK), `module_id` (UUID FK)
  - `unlock_date` (DATE), `lock_date` (DATE optional)
- **Example:**
  ```sql
  SELECT m.title, cs.unlock_date
  FROM cohort_schedules cs
  JOIN modules m ON cs.module_id = m.id
  WHERE cs.cohort_id = 'cohort-uuid'
  ORDER BY cs.unlock_date;
  ```

**Table: `lesson_progress`**
- **Purpose:** Tracks video watch progress and lesson completion
- **Access:** Read/Write (own data)
- **Key Columns:**
  - `user_id` (UUID FK), `lesson_id` (UUID FK)
  - `completed` (BOOLEAN), `video_position_seconds`
  - `time_spent_seconds`, `last_accessed_at`
- **Example:**
  ```sql
  UPDATE lesson_progress
  SET video_position_seconds = 350, last_accessed_at = NOW()
  WHERE user_id = auth.uid() AND lesson_id = 'lesson-uuid';
  ```

### Row Level Security (RLS)

C4C Campus relies on 101 RLS policies across all tables. Key policies include:

```sql
-- Public read access to institutions
CREATE POLICY "Public can view institutions"
  ON c4c_institutions
  FOR SELECT
  USING (true);

-- Users can submit institutions
CREATE POLICY "Authenticated users can submit institutions"
  ON c4c_institution_submissions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Students see only their enrollments
CREATE POLICY "Students see own enrollments"
  ON enrollments
  FOR SELECT
  USING (user_id = auth.uid());

-- Teachers see cohort students
CREATE POLICY "Teachers see cohort students"
  ON cohort_enrollments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by
      FROM cohorts
      WHERE id = cohort_id
    )
  );

-- Admins see all data
CREATE POLICY "Admins see all applications"
  ON applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Students can only update their own progress
CREATE POLICY "Students update own progress"
  ON lesson_progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Migrations

The C4C website database schema is managed through Supabase migrations:

**Migration file:** `schema-minimal.sql` (minimal viable schema with 7 core tables)

**Full schema:** 45 tables, 160+ indexes, 101 RLS policies, 47 functions, 24 triggers

**Changes Required for OpenPaws Integration:**
- Ensure `c4c_institutions` and `c4c_institution_submissions` tables exist in main OpenPaws database
- Tables already defined in `OPENPAWS_COMPREHENSIVE_SCHEMA_DESIGN.md` (Section 9: Campus Campaigns)
- No migration needed if main schema is deployed

**Storage Buckets (Manual Setup):**
1. **videos** - Public with RLS, 500MB limit (lesson videos)
2. **thumbnails** - Public, 5MB limit (course preview images)
3. **resources** - Private with RLS, 50MB limit (downloadable materials)

---

## Setup & Configuration

### Prerequisites

- [x] Node.js 18+ and npm
- [x] Supabase project created with OpenPaws schema deployed
- [x] n8n instance (self-hosted or cloud)
- [x] Vercel/Netlify account (for deployment)
- [x] OpenRouter API key (for AI teaching assistant)
- [x] Stripe account (for payments - optional for MVP)
- [x] Resend API key (for emails - optional, can use Supabase Auth emails)

### Environment Variables

Required environment variables (copy from `.env.example`):

```bash
# Core Application
PORT=4321
NODE_ENV=development
SITE=http://localhost:4321

# Supabase (Database & Auth)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenRouter (AI Teaching Assistant - Optional for MVP)
OPENROUTER_API_KEY=sk-or-v1-...

# Stripe (Payments - Optional for MVP)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_...

# Resend (Email - Optional, can use Supabase Auth emails)
RESEND_API_KEY=re_...

# n8n Integration (Optional for automated workflows)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
N8N_API_KEY=your-n8n-api-key
```

**Where to get these:**
- **Supabase keys:** Dashboard → Settings → API → Project URL & anon/service keys
- **OpenRouter:** https://openrouter.ai/keys (after signup)
- **Stripe:** https://dashboard.stripe.com/apikeys
- **Resend:** https://resend.com/api-keys
- **n8n:** Self-host or use n8n Cloud

### Installation

```bash
# Navigate to tool directory
cd tools/tier-1-active-production/easy-integrate/c4c\ website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env

# Apply database schema (if not already in main OpenPaws database)
# Option 1: Use Supabase Dashboard SQL Editor
# - Copy contents of schema-minimal.sql
# - Paste into SQL Editor and run

# Option 2: Use Supabase CLI (if available)
# supabase db push

# Start development server
npm run dev
```

The dev server runs at `http://localhost:4321`

### Configuration Files

- **`astro.config.mjs`:** Astro configuration (SSR mode, React integration, build optimization)
- **`tailwind.config.js`:** Tailwind CSS theme and plugins
- **`vercel.json`:** Vercel deployment configuration (security headers, build settings)
- **`netlify.toml`:** Netlify deployment configuration (alternative to Vercel)
- **`package.json`:** Dependencies and scripts
- **`tsconfig.json`:** TypeScript compiler options

---

## API Endpoints

### Base URL

- **Development:** `http://localhost:4321`
- **Production:** `https://c4ccampus.org`

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-11-04T12:00:00Z",
  "database": "connected",
  "storage": "connected"
}
```

### Main Endpoints

#### Submit Institution for Analysis

```http
POST /api/contact
Content-Type: application/json

{
  "name": "Student Name",
  "email": "student@university.edu",
  "institution": "Stanford University",
  "message": "Please analyze my university's sustainability policies"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "pending",
    "estimated_completion": "2025-11-05T12:00:00Z"
  }
}
```

**Workflow:**
1. Validates email and institution name
2. Creates record in `c4c_institution_submissions`
3. Triggers n8n webhook for analysis
4. n8n scrapes university data and generates report
5. Updates `c4c_institutions` table
6. Sends email notification to submitter

**Errors:**
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Institution already exists or pending analysis
- `500 Internal Server Error`: Database or n8n connection failure

#### Apply to Bootcamp/Accelerator

```http
POST /api/apply
Content-Type: application/json
Authorization: Bearer [supabase-token]

{
  "program": "bootcamp",
  "name": "Activist Name",
  "email": "activist@email.com",
  "whatsapp": "+1234567890",
  "location": "Berkeley, CA",
  "interests": ["animal_advocacy", "ai_tools"],
  "motivation": "Want to build AI tools for campus dining campaigns",
  "technical_experience": "Some Python, used ChatGPT",
  "commitment": "5-10 hours per week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application_id": "uuid",
    "status": "pending",
    "message": "Application submitted successfully. You'll hear from us within 48 hours."
  }
}
```

#### Enroll in Course

```http
POST /api/enroll
Content-Type: application/json
Authorization: Bearer [supabase-token]

{
  "course_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment_id": "uuid",
    "course_title": "AI Advocacy Fundamentals",
    "enrolled_at": "2025-11-04T12:00:00Z",
    "next_steps": "Check your email for cohort assignment"
  }
}
```

#### Enroll in Cohort

```http
POST /api/enroll-cohort
Content-Type: application/json
Authorization: Bearer [supabase-token]

{
  "cohort_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cohort_name": "Fall 2025 Cohort",
    "start_date": "2025-11-10",
    "first_module_unlock": "2025-11-10",
    "student_count": 23
  }
}
```

#### Update Lesson Progress

```http
POST /api/lesson-progress
Content-Type: application/json
Authorization: Bearer [supabase-token]

{
  "lesson_id": "uuid",
  "video_position_seconds": 350,
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson_progress_id": "uuid",
    "video_position_seconds": 350,
    "progress_percentage": 58,
    "next_lesson": "uuid"
  }
}
```

### Webhook Endpoints

#### n8n Webhook (Institution Analysis Complete)

```http
POST /api/supabase-webhook
X-N8N-Signature: [signature]

{
  "event": "institution_analysis_complete",
  "data": {
    "submission_id": "uuid",
    "institution_id": "uuid",
    "name": "Stanford University",
    "overall_grade": "B+",
    "overall_grade_score": 85
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## Usage Examples

### Example 1: Student Discovers University Sustainability Data

**Scenario:** A student activist visits the C4C website to research their university's policies

**Frontend Code:**
```typescript
// src/pages/index.astro
import { supabase } from '../lib/supabase';

// Fetch top-ranked institutions
const { data: institutions } = await supabase
  .from('c4c_institutions')
  .select('name, slug, overall_grade, overall_grade_score, vegan_options')
  .order('overall_grade_score', { ascending: false })
  .limit(10);
```

**Expected Output:**
```typescript
[
  {
    name: "UC Berkeley",
    slug: "uc-berkeley",
    overall_grade: "A",
    overall_grade_score: 95,
    vegan_options: "Excellent - Multiple fully vegan dining halls"
  },
  {
    name: "Stanford University",
    slug: "stanford-university",
    overall_grade: "B+",
    overall_grade_score: 85,
    vegan_options: "Good - Vegan options in all dining halls"
  }
  // ...
]
```

### Example 2: Submit New Institution for Analysis

**Scenario:** Student's university isn't in the database, they submit it for analysis

**React Component:**
```typescript
// src/components/InstitutionSubmit.tsx
import { useState } from 'react';

function InstitutionSubmit() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student Name',
        email: 'student@university.edu',
        institution: 'New University',
        message: 'Please analyze my university'
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('Submission received! You'll get an email when analysis is complete.');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Institution'}
      </button>
    </form>
  );
}
```

### Example 3: Cohort-Based Course Enrollment

**Scenario:** Approved student enrolls in a bootcamp cohort

**Astro API Route:**
```typescript
// src/pages/api/enroll-cohort.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const { cohort_id } = await request.json();
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401
    });
  }

  // Check if cohort is full
  const { count } = await supabase
    .from('cohort_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('cohort_id', cohort_id);

  const { data: cohort } = await supabase
    .from('cohorts')
    .select('max_students')
    .eq('id', cohort_id)
    .single();

  if (count >= cohort.max_students) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Cohort is full'
    }), { status: 409 });
  }

  // Enroll student
  const { data, error } = await supabase
    .from('cohort_enrollments')
    .insert({
      cohort_id,
      user_id: user.id,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500
    });
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 201 });
};
```

### Example 4: n8n Workflow Integration

**Scenario:** Automated institution analysis workflow triggers when new submission is created

**n8n Workflow (JSON):**
```json
{
  "nodes": [
    {
      "name": "Supabase Trigger",
      "type": "n8n-nodes-base.supabaseTrigger",
      "parameters": {
        "table": "c4c_institution_submissions",
        "events": ["INSERT"]
      }
    },
    {
      "name": "Scrape University Data",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$json.institution_name}}.edu",
        "method": "GET"
      }
    },
    {
      "name": "Analyze with Claude AI",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "method": "POST",
        "body": {
          "model": "anthropic/claude-3.5-sonnet",
          "messages": [
            {
              "role": "system",
              "content": "Analyze this university's sustainability and animal welfare policies..."
            },
            {
              "role": "user",
              "content": "={{$json.scraped_content}}"
            }
          ]
        }
      }
    },
    {
      "name": "Store Results",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "c4c_institutions",
        "data": {
          "name": "={{$json.institution_name}}",
          "overall_grade": "={{$json.analysis.grade}}",
          "overall_grade_score": "={{$json.analysis.score}}"
        }
      }
    },
    {
      "name": "Send Email Notification",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "={{$json.submitter_email}}",
        "subject": "Your University Analysis is Ready!",
        "text": "We've completed the sustainability analysis for {{$json.institution_name}}..."
      }
    }
  ]
}
```

---

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Key test files:**
- `tests/unit/utils.test.ts` - Utility functions
- `tests/unit/api-handlers.test.ts` - API validation logic
- `tests/unit/time-gating.test.ts` - Cohort unlock logic
- `tests/components/*.test.tsx` - React component tests

**Test Coverage:** 84% overall (31/31 unit tests passing)

### Integration Tests

```bash
# Run integration tests (requires Supabase connection)
npm run test:integration
```

**Test coverage areas:**
- Database operations (CRUD on institutions, courses, enrollments)
- RLS policies (student isolation, teacher access, admin privileges)
- Cohort enrollment workflows
- Progress tracking and video resume
- Time-gated content unlocking

**One-time setup:**
```bash
# Create test users in Supabase Auth
# (Manual via Supabase Dashboard or use test fixtures)

# Verify schema is applied
node verify-schema.js
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile

# Debug mode
npm run test:e2e:debug
```

**Test scenarios:**
- Institution search and submission
- User registration and login
- Course enrollment and content access
- Video playback and progress tracking
- Cohort-based content unlocking
- Discussion posting and replies

### Test Data

- **Test database:** Use Supabase local dev environment or separate test project
- **Mock data:** `tests/fixtures/` (users, courses, enrollments)
- **Sample institutions:** Pre-populated in test database

### Manual Testing Checklist

- [ ] Institution search returns results sorted by grade
- [ ] Institution submission creates record and triggers n8n webhook
- [ ] User can apply to bootcamp/accelerator/hackathon
- [ ] Admin can approve applications and assign roles
- [ ] Student can enroll in published courses
- [ ] Cohort enrollment respects max_students limit
- [ ] Module unlocking follows cohort_schedules
- [ ] Video progress saves and resumes correctly
- [ ] Lesson completion updates progress_percentage
- [ ] AI teaching assistant provides contextual help
- [ ] Discussion threads support nested replies

---

## Deployment

### Docker Deployment

**Dockerfile location:** `/tools/tier-1-active-production/easy-integrate/c4c website/Dockerfile`

```bash
# Build Docker image
docker build -t openpaws/c4c-campus:latest .

# Run container
docker run -p 4321:4321 \
  -e PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
  -e PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  openpaws/c4c-campus:latest

# Or use docker-compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Vercel Deployment (Recommended)

**Platform:** Vercel (optimized for Astro SSR)

**Steps:**
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: `Astro`
3. Set environment variables in Vercel dashboard (see [Environment Variables](#environment-variables))
4. Deploy from `main` branch
5. Verify health endpoint: `https://c4ccampus.org/api/health`

**Configuration:** `vercel.json` (included in repo)

### Netlify Deployment (Alternative)

**Platform:** Netlify

**Steps:**
1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables in Netlify dashboard
4. Deploy from `main` branch
5. Verify deployment

**Configuration:** `netlify.toml` (included in repo)

### Environment Variables to Set

**Required for Production:**
```env
# Application
NODE_ENV=production
SITE=https://c4ccampus.org

# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# n8n (for automation)
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/...
N8N_API_KEY=your-n8n-api-key

# Optional (can deploy without these initially)
OPENROUTER_API_KEY=sk-or-v1-...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
```

### Scaling Considerations

- **Horizontal scaling:** ✅ Can scale horizontally (stateless SSR, database-backed sessions)
- **Resource requirements:**
  - CPU: 1-2 cores (SSR rendering)
  - RAM: 512MB-1GB (Node.js runtime)
  - Disk: Minimal (static assets on CDN)
- **Rate limits:**
  - Supabase: Free tier 500MB database, 1GB storage, 50K monthly active users
  - n8n: Depends on instance (cloud vs self-hosted)
  - OpenRouter: Pay-per-token, no hard limits
- **Caching strategy:**
  - Edge caching for static pages (Vercel Edge Network)
  - Database query caching via Supabase PostgREST
  - Redis for session storage (optional, can use Supabase)

---

## Monitoring & Logging

### Logging

**Log format:** Astro built-in logging + custom structured logs

**Log levels:**
- `ERROR`: Database connection failures, n8n webhook errors, payment processing failures
- `WARN`: RLS policy violations, failed login attempts, rate limit warnings
- `INFO`: User enrollments, course completions, institution submissions
- `DEBUG`: API request/response details, query performance

**Example log:**
```json
{
  "level": "info",
  "timestamp": "2025-11-04T12:00:00Z",
  "service": "c4c-campus",
  "message": "User enrolled in course",
  "userId": "user-uuid",
  "courseId": "course-uuid",
  "cohortId": "cohort-uuid"
}
```

### Metrics

**Key metrics to monitor:**

- **Request rate:** Page views per minute, API calls per minute
- **Error rate:** 4xx/5xx errors as percentage of total requests
- **Response time:** p50, p95, p99 latency for SSR pages and API endpoints
- **Database performance:** Query duration, connection pool usage
- **Enrollment rate:** Daily/weekly course enrollments
- **Completion rate:** Course completion percentage by cohort
- **Institution submissions:** Daily submissions, analysis completion time
- **Video engagement:** Average watch time, completion rate

### Health Checks

**Health endpoint:** `GET /api/health`

**Checks performed:**
- Database connectivity (Supabase connection test)
- Storage availability (Supabase Storage buckets)
- n8n webhook reachability (optional, if configured)
- OpenRouter API availability (optional, if configured)

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "storage": "connected",
    "n8n": "connected",
    "openrouter": "connected"
  }
}
```

### Alerts

**Set up alerts for:**

- Error rate > 5% (indicates widespread issues)
- Response time p95 > 3000ms (SSR performance degradation)
- Database connection failures (critical - impacts all features)
- Storage failures (impacts video playback)
- n8n webhook failures (impacts institution analysis automation)
- Cohort enrollment failures (critical user journey)

**Alert channels:** Email, Slack, PagerDuty (configure in monitoring platform)

---

## Troubleshooting

### Common Issues

#### Issue 1: Database Connection Failure

**Symptoms:**
- API endpoints return 500 errors
- `supabase.from('table').select()` fails with connection timeout

**Cause:**
- Invalid Supabase credentials in `.env`
- RLS policies blocking service role access
- Supabase project paused (free tier inactivity)

**Solution:**
```bash
# Verify Supabase URL and keys
echo $PUBLIC_SUPABASE_URL
echo $PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" \
  "$PUBLIC_SUPABASE_URL/rest/v1/c4c_institutions?limit=1"

# If project is paused, resume in Supabase Dashboard
# Settings → General → Resume Project
```

#### Issue 2: RLS Policy Blocking Access

**Symptoms:**
- User can't see their enrollments despite being logged in
- Teacher can't access student roster
- Admin can't manage courses

**Cause:**
- Missing or incorrect RLS policies
- User doesn't have required role in `applications` table

**Solution:**
```sql
-- Check user's role
SELECT role FROM applications WHERE user_id = auth.uid();

-- Verify RLS policies exist
SELECT * FROM pg_policies WHERE tablename = 'enrollments';

-- Test policy with service role (bypasses RLS)
-- Use Supabase Dashboard → SQL Editor with service_role key
```

#### Issue 3: Cohort Modules Not Unlocking

**Symptoms:**
- Student enrolled in cohort but can't access any modules
- Module unlock dates have passed but content still locked

**Cause:**
- Missing entries in `cohort_schedules` table
- Incorrect date comparisons in unlock logic

**Solution:**
```sql
-- Check cohort schedule
SELECT
  m.title,
  cs.unlock_date,
  CURRENT_DATE,
  cs.unlock_date <= CURRENT_DATE AS is_unlocked
FROM cohort_schedules cs
JOIN modules m ON cs.module_id = m.id
WHERE cs.cohort_id = 'cohort-uuid'
ORDER BY cs.unlock_date;

-- Add missing schedule entries
INSERT INTO cohort_schedules (cohort_id, module_id, unlock_date)
VALUES ('cohort-uuid', 'module-uuid', '2025-11-10');
```

#### Issue 4: n8n Webhook Not Triggering

**Symptoms:**
- Institution submissions remain in "pending" status
- No analysis results in `c4c_institutions` table
- No email notifications sent

**Cause:**
- Incorrect webhook URL in n8n workflow
- n8n workflow not activated
- Database trigger not configured

**Solution:**
```bash
# Check n8n workflow status
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_WEBHOOK_URL/workflow"

# Test webhook manually
curl -X POST "$N8N_WEBHOOK_URL/webhook/institution-analysis" \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "uuid", "institution_name": "Test University"}'

# Verify database trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_institution_submission';
```

#### Issue 5: Video Playback Not Resuming

**Symptoms:**
- Video always starts from beginning despite previous progress
- `lesson_progress` table shows correct `video_position_seconds`

**Cause:**
- Frontend not reading `video_position_seconds` from database
- Video player not seeking to saved position on load

**Solution:**
```typescript
// Check VideoPlayer component
// src/components/course/VideoPlayer.tsx

useEffect(() => {
  const fetchProgress = async () => {
    const { data } = await supabase
      .from('lesson_progress')
      .select('video_position_seconds')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .single();

    if (data?.video_position_seconds) {
      videoRef.current.currentTime = data.video_position_seconds;
    }
  };

  fetchProgress();
}, [lessonId, userId]);
```

### Debug Mode

Enable verbose logging:

```bash
# Set environment variable
DEBUG=c4c:*
LOG_LEVEL=debug

# Run dev server
npm run dev
```

### Checking Service Status

```bash
# Check if C4C website is running
curl http://localhost:4321/api/health

# Check Supabase connection
curl -H "apikey: $PUBLIC_SUPABASE_ANON_KEY" \
  "$PUBLIC_SUPABASE_URL/rest/v1/"

# Check n8n webhook
curl "$N8N_WEBHOOK_URL/webhook/ping"
```

### Log Analysis

```bash
# View Vercel logs (if deployed)
vercel logs c4ccampus.org --follow

# View Docker logs
docker-compose logs -f web

# Search for errors
docker-compose logs web | grep ERROR

# Filter by user
docker-compose logs web | grep "userId: user-uuid"
```

### Getting Help

- **Documentation:** `/docs/` directory in tool folder
- **GitHub Issues:** https://github.com/openpaws/platform/issues
- **OpenPaws Discord:** #c4c-campus channel
- **Email:** support@openpaws.org

---

## References

### Documentation

- **Upstream README:** [readme.md](/tools/tier-1-active-production/easy-integrate/c4c website/readme.md)
- **Complete Vision:** [C4C_CAMPUS_PLATFORM_VISION.md](/tools/tier-1-active-production/easy-integrate/c4c website/docs/C4C_CAMPUS_PLATFORM_VISION.md)
- **Quickstart Guide:** [QUICKSTART.md](/tools/tier-1-active-production/easy-integrate/c4c website/docs/QUICKSTART.md)
- **Setup Instructions:** [SETUP_INSTRUCTIONS.md](/tools/tier-1-active-production/easy-integrate/c4c website/docs/SETUP_INSTRUCTIONS.md)
- **n8n Integration:** [N8N_SETUP.md](/tools/tier-1-active-production/easy-integrate/c4c website/docs/N8N_SETUP.md)

### External Service Docs

- **Astro Documentation:** https://docs.astro.build
- **Supabase Guides:** https://supabase.com/docs
- **n8n Documentation:** https://docs.n8n.io
- **OpenRouter API:** https://openrouter.ai/docs
- **Stripe API:** https://stripe.com/docs/api
- **Vercel Deployment:** https://vercel.com/docs

### Code Repositories

- **Main Repository:** https://github.com/openpaws/platform
- **C4C Website:** `/tools/tier-1-active-production/easy-integrate/c4c website`

### Related Tools

- **Reddit Engagement Tool:** Campus organizers deploy Reddit bots after bootcamp training
- **Social Media Sentiment Analysis:** Trained through C4C curriculum for campaign messaging
- **Politician Tracker:** Campus campaigns use politician data to target local officials
- **Institution Ranking (c4c_institutions):** Core data source for campus organizing strategy

### Team Contacts

- **Tool Owner:** OpenPaws Platform Team
- **Integration Lead:** AI Development Team
- **Support:** support@openpaws.org

---

## Changelog

### v2.0.0 (2025-11-04)
- Initial INTEGRATION.md documentation
- Comprehensive database schema integration (45 tables, 101 RLS policies)
- Cohort-based learning system
- AI teaching assistant integration
- n8n workflow automation
- Institutional tracking via `c4c_institutions` and `c4c_institution_submissions`
- Production deployment guides for Vercel/Netlify
- Complete API endpoint documentation
- Testing strategies (unit, integration, E2E)

### Future Improvements

- [ ] GraphQL API layer for more efficient data fetching
- [ ] Real-time collaboration features (live cohort discussions)
- [ ] Advanced analytics dashboard (dropout prediction, engagement heatmaps)
- [ ] Mobile app (React Native) for on-the-go learning
- [ ] Offline-first PWA for low-connectivity environments
- [ ] Multi-language support (i18n) for global activists
- [ ] Integration with campaign tracking tools (measure campus impact)
- [ ] Blockchain-based credentials (verifiable certificates via NFTs)

---

**INTEGRATION.md Version:** 1.0
**Last Updated:** 2025-11-04
**Maintained By:** OpenPaws Platform Team
**Tool Status:** Production-Ready (Tier 1 - Active Production)
