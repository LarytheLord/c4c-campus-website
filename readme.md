# C4C Campus

**Engineering Compassion Through AI**

C4C Campus is a learning platform that trains developers to build AI tools for animal advocacy, climate action, and AI safety. Based in Bengaluru with remote participation worldwide.

## What We Do

We run three programs to build technical capacity in impact movements:

- **Weekend Bootcamp** - 12 weeks, no technical skills required. Learn no-code/low-code AI development.
- **Global Hackathons** - Build prototype tools and find your team.
- **Full-Time Accelerator** - 12 weeks intensive. Take your prototype to production.

## Three Focus Areas

| Animal Advocacy | Climate Action | AI Safety |
|-----------------|----------------|-----------|
| Supply chain transparency | Greenwashing detection | Harm detection |
| Rescue coordination | Renewable energy optimization | Adversarial defense |
| Campaign automation | Climate litigation support | Ethics testing |

## Platform Features

This codebase powers the C4C Campus learning management system:

- **Student Experience** - Course progress, assignments, quizzes, certificates
- **Teacher Tools** - Course creation, cohort management, grading, analytics
- **Admin Portal** - Application review, user management, platform settings
- **Discussion Forums** - Course-specific discussions with moderation

## Tech Stack

- [Astro](https://astro.build) + React
- [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage)
- [Tailwind CSS](https://tailwindcss.com)
- [Resend](https://resend.com) (Email)
- [Vercel](https://vercel.com) (Hosting)

## Quick Start

```bash
git clone https://github.com/Open-Paws/c4c-campus-website.git
cd c4c-campus-website
npm install
cp .env.example .env  # Fill in your credentials
npm run dev
```

### Environment Variables

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
SITE_URL=https://your-domain.com
```

### Database Setup

Run `schema.sql` in your Supabase SQL Editor.

### Schema-TypeScript Sync Process

**IMPORTANT:** The database schema (`schema.sql`) is the single source of truth. TypeScript types must always match the schema.

#### When Modifying the Database Schema:

1. Update `schema.sql` with your changes
2. Update corresponding TypeScript types:
   - `src/types/index.ts` - Core types (Enrollment, Course, Module, Lesson, Cohort, etc.)
   - `src/types/quiz.ts` - Quiz system types (Quiz, QuizAttempt, QuizQuestion, etc.)
   - `src/types/assignment.ts` - Assignment types (Assignment, Submission, etc.)
3. Update any API handlers that reference modified columns
4. Run TypeScript compilation to catch type errors: `npx astro check`
5. Update integration tests to verify new schema fields

#### Key Conventions:

- **UUIDs**: All `id` fields on tables like `cohorts`, `quiz_attempts`, `assignment_submissions` are UUID strings, not numbers
- **Nullable fields**: Match DB `NULL` with TypeScript `| null`
- **JSONB columns**: Define typed interfaces (e.g., `CohortProgress` for `cohort_enrollments.progress`)
- **CHECK constraints**: TypeScript union types must match DB constraints exactly (e.g., `QuestionType`, `GradingStatus`)
- **Column renames**: If the DB column name differs from the TypeScript property, add a comment noting the mapping

#### Type Generation and CI:

The project includes automated schema-types synchronization:

```bash
# Generate types from local schema (requires Supabase CLI)
npm run db:types

# Manually check schema-types synchronization
npm run db:types:check
```

A GitHub Actions workflow (`.github/workflows/schema-types-check.yml`) automatically runs on every push or PR that modifies `schema.sql` or `src/types/**`. The CI will fail if:
- TypeScript types don't match the database schema
- UUID fields are incorrectly typed as `number` instead of `string`
- Known schema mismatches are detected (e.g., `time_limit` vs `time_limit_minutes`)

To fix schema-type issues:
1. Run `npm run db:types:check` to identify problems
2. Update types in `src/types/` to match `schema.sql`
3. Ensure all ID fields use `string` type (UUIDs)
4. Run `npx astro check` to verify no TypeScript errors

#### Workflow for Contributors

**IMPORTANT:** Do NOT hand-edit `src/types/generated.ts`. This file is auto-generated from the database schema.

When making schema changes:
1. Modify `schema.sql` with your changes
2. Run `npm run db:types` to regenerate `src/types/generated.ts`
3. Commit BOTH `schema.sql` and `src/types/generated.ts` together
4. The CI will fail if generated.ts is out of sync

The helper type aliases at the bottom of `generated.ts` (like `QuizRow`, `AssignmentRow`) may be manually maintained, but the `Database` type definition must remain auto-generated.

Consider adding a pre-commit hook to catch drift early:
```bash
# In your local tooling configuration, run this when schema.sql or src/types/ change:
npm run db:types:check
```

## Deployment

Connect to Vercel and add environment variables. That's it.

After deploying, update your Supabase project's Site URL to match your domain.

## License

MIT

## Contact

info@codeforcompassion.com

---

Built by [Open Paws](https://openpaws.ai) for the animal liberation movement.
