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

## Deployment

Connect to Vercel and add environment variables. That's it.

After deploying, update your Supabase project's Site URL to match your domain.

## License

MIT

## Contact

info@codeforcompassion.com

---

Built by [Open Paws](https://openpaws.ai) for the animal liberation movement.
