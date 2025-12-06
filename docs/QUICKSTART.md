# Quick Start Guide

## Setup (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` - the site is now running!

## Platform URLs

### Core Platform
- **Home**: `http://localhost:4321/` (or `https://c4c-campus.vercel.app`)
- **Login**: `http://localhost:4321/login`
- **Sign Up**: `http://localhost:4321/apply`

### Student Features
- **Student Dashboard**: `http://localhost:4321/dashboard`
- **Course Catalog**: `http://localhost:4321/courses`
- **Lesson Viewer**: `http://localhost:4321/courses/[slug]/lessons/[lesson-slug]`

### Teacher Features
- **Teacher Dashboard**: `http://localhost:4321/teacher`
- **Teacher Course Builder**: Manage courses from teacher dashboard
- **Admin Applications**: `http://localhost:4321/admin`

### Documentation
- **Unified Teacher Dashboard Guide**: [docs/guides/unified-teacher-dashboard.md](guides/unified-teacher-dashboard.md)
- **Progress Tracking Guide**: [docs/guides/progress-tracking.md](guides/progress-tracking.md)
- **Teacher Dashboard Guide**: [docs/guides/teacher-dashboard.md](guides/teacher-dashboard.md)

## Key Features

### For Teachers
- Create and manage courses from `/teacher`
- Organize students into cohorts
- Track real-time student progress
- Monitor engagement and activity
- Edit and publish courses

### For Students
- Browse published courses at `/courses`
- Enroll in cohorts
- Watch lessons with progress tracking
- Join discussions
- View personal dashboard at `/dashboard`

### For Admins
- Manage applications at `/admin`
- View platform overview
- Access user management

## Making Changes

### Update Content

All pages are in `src/pages/`:
- `index.astro` - Home page
- `programs/bootcamp.astro` - Bootcamp page
- `about.astro` - About page
- `teacher.astro` - Teacher dashboard
- `dashboard.astro` - Student dashboard
- etc.

Just edit the files and save. The browser auto-refreshes.

### Update Styling

Colors are in `tailwind.config.js`:
- `primary` - Green (animal advocacy)
- `accent` - Amber (energy)

Layout and navigation in `src/layouts/BaseLayout.astro`.

### Add Images

Put images in `public/` directory. Reference them with `/filename.jpg` in your code.

## Database

The e-learning platform uses Supabase:

```bash
# Create test users
node create-test-users.ts

# Verify schema
node verify-schema.js

# Run tests
npm test
npm run test:integration
```

See `docs/SETUP_INSTRUCTIONS.md` for complete database setup.

## Deploy to Production

### Option 1: Vercel (Easiest)

1. Push code to GitHub
2. Go to vercel.com
3. Click "Import Project"
4. Select your repo
5. Deploy!

Vercel auto-detects Astro and builds correctly.

### Option 2: Netlify

1. Push code to GitHub
2. Go to netlify.com
3. Click "Add new site"
4. Select your repo
5. Deploy!

The `netlify.toml` file has all settings.

### Option 3: Manual

```bash
npm run build
```

Upload the `dist/` folder to any web host.

## Next Steps

### Set Up Database (Required for Auth)

```bash
# 1. Create Supabase project
# 2. Copy credentials to .env
# 3. Run schema.sql in Supabase SQL editor
# 4. Create storage buckets (videos, thumbnails, resources)
```

See `docs/SETUP_INSTRUCTIONS.md` for detailed instructions.

### Teacher Testing

1. Create a test teacher account with role `teacher`
2. Visit `/teacher` to access the dashboard
3. Create and publish a test course
4. Create a cohort and invite students

### Add Analytics

Add to `src/layouts/BaseLayout.astro`:

```html
<!-- Plausible Analytics -->
<script defer data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"></script>
```

### Add CMS

For easy content updates without coding:
- Sanity.io (recommended)
- Strapi
- TinaCMS

### SEO

Update in `astro.config.mjs`:
```js
site: 'https://yourdomain.com'
```

Each page has meta tags in the `<BaseLayout>` component.

## Performance

Current bundle size: **220KB total** (target was <200KB, we're close!)

Run Lighthouse:
```bash
npm run build
npm run preview
```

Then run Lighthouse in Chrome DevTools.

## Support

Questions? Check:
- **Teacher Dashboard Guide**: [docs/guides/unified-teacher-dashboard.md](guides/unified-teacher-dashboard.md)
- **Full README.md**: See project root
- **Setup Instructions**: [docs/SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Astro docs**: https://docs.astro.build
- **Tailwind docs**: https://tailwindcss.com

---

Built with Astro + Tailwind for maximum performance and minimal complexity.
