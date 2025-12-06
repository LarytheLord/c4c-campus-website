# C4C Campus

**AI Development Accelerator for Animal Liberation**

C4C Campus is a learning management system designed to train advocates in AI development skills, helping them build tools for animal liberation.

## Features

- **Student Dashboard** - Track course progress, submit assignments, take quizzes
- **Teacher Tools** - Create courses, manage cohorts, grade submissions, view analytics
- **Admin Portal** - Review applications, manage users, platform settings
- **Quiz System** - Multiple question types, auto-grading, attempt tracking
- **Assignment System** - File uploads, rubric grading, feedback
- **Discussion Forums** - Course-specific discussions with moderation
- **Email Notifications** - Application confirmations, grade notifications via Resend
- **Analytics** - Student progress tracking, engagement metrics

## Tech Stack

- **Framework**: [Astro](https://astro.build) with React components
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Email**: [Resend](https://resend.com)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Resend account (for emails)

### Installation

```bash
# Clone the repo
git clone https://github.com/Open-Paws/c4c-campus-website.git
cd c4c-campus-website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your environment variables (see below)

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Supabase (get from Supabase Dashboard > Settings > API)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (get from resend.com/api-keys)
RESEND_API_KEY=re_your_api_key

# Site URL
SITE_URL=https://your-domain.com
```

### Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in Supabase Dashboard
3. Run the contents of `schema.sql`

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/     # React components (quizzes, assignments, etc.)
├── layouts/        # Astro layouts
├── lib/            # Utilities (supabase client, notifications)
├── pages/          # Routes
│   ├── admin/      # Admin pages
│   ├── api/        # API endpoints
│   ├── courses/    # Course pages
│   ├── quizzes/    # Quiz pages
│   └── teacher/    # Teacher pages
└── styles/         # Global CSS
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

After deploying, update Supabase:
- **Authentication > URL Configuration**: Set Site URL to your domain
- **Authentication > Email Templates**: Update confirmation email redirect URL

## Contributing

This is liberation infrastructure for the animal advocacy movement. Contributions welcome!

## License

MIT

## Contact

- Email: info@codeforcompassion.com
- Website: [codeforcompassion.com](https://codeforcompassion.com)

---

Built by [Open Paws](https://openpaws.ai) for the animal liberation movement.
