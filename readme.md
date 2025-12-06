# C4C Campus Website

AI development accelerator for animal liberation. A three-stage pipeline from bootcamp to production deployment.

---

## SECURITY NOTICE - ACTION REQUIRED

**CRITICAL**: API credentials in this repository were previously exposed. If you cloned this repo before 2025-10-31, you MUST:

1. **NEVER commit `.env` files** - Already protected by `.gitignore`
2. **Rotate all exposed credentials immediately** - See `CREDENTIAL_ROTATION_GUIDE.md`
3. **Use `.env.example` as template** - Copy to `.env` and fill with NEW credentials
4. **Install pre-commit hooks** - Prevents future credential exposure

**Required Actions**:
- [ ] Read `CREDENTIAL_ROTATION_GUIDE.md` for detailed rotation instructions
- [ ] Rotate Supabase keys (HIGHEST PRIORITY - student data at risk)
- [ ] Rotate n8n API key and encryption key (HIGH PRIORITY)
- [ ] Rotate n8n PostgreSQL password (MEDIUM PRIORITY)
- [ ] Replace all placeholder keys with real values
- [ ] Update production environments and n8n workflows

**Install Pre-Commit Hook**:
```bash
chmod +x .git/hooks/pre-commit
```

---

## About

C4C Campus is building liberation infrastructure for animal advocacy through:
- **Bootcamp**: Fast, practical AI tool training (4-8 weeks, self-paced)
- **Hackathons**: Rapid prototyping sprints (48-hour weekend builds)
- **Accelerator**: Production deployment support (3-6 months intensive)

This website follows Gandhian Engineering (ASSURED) principles:
- **Affordable**: Works on cheap devices, low data consumption
- **Scalable**: Static site, edge-cached, handles traffic spikes
- **Sustainable**: Easy to maintain, minimal costs
- **Universal**: Works on 3G in Bangalore, Nairobi, Jakarta
- **Rapid**: <2s load time on slow connections
- **Excellent**: Beautiful, professional, inspires confidence
- **Distinctive**: Global South optimism, not Western AI pessimism

## Tech Stack

- **Framework**: Astro 5.x (static site generation)
- **Styling**: Tailwind CSS 4.x
- **Deployment**: Vercel/Netlify recommended
- **Performance**: <200kb bundle, 95+ Lighthouse score target

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:4321`

### 📚 Documentation

**🚀 NEW DEVELOPERS START HERE**: [CONTINUE_HERE.md](CONTINUE_HERE.md) - Quick start guide for resuming development

Comprehensive setup and implementation guides:
- **[CONTINUE_HERE.md](CONTINUE_HERE.md)** - 🚀 **START HERE** - Resume development guide with current status
- **[ROADMAP.md](ROADMAP.md)** - Complete 24-month roadmap (single source of truth)
- **[APPLY_SCHEMA_NOW.md](APPLY_SCHEMA_NOW.md)** - Database schema deployment instructions
- **[WEEK_1-2_STATUS.md](WEEK_1-2_STATUS.md)** - Current sprint status and achievements
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Get up and running in 2 minutes
- **[docs/SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)** - Complete setup guide with database, n8n, and testing
- **[docs/N8N_SETUP.md](docs/N8N_SETUP.md)** - n8n workflow integration guide
- **[docs/C4C_CAMPUS_PLATFORM_VISION.md](docs/C4C_CAMPUS_PLATFORM_VISION.md)** - Complete product vision and technical roadmap

## Database Setup

C4C Campus includes an applications system and e-learning platform.

### Prerequisites

- Supabase account (free tier sufficient)
- Supabase project created with credentials in `.env`

### One-Time Database Migration

**Run the complete schema (single file):**

1. Open the file: `schema.sql` in the project root
2. Copy the entire contents
3. Open Supabase Dashboard → SQL Editor
4. Paste and click "Run"

This creates:
- **6 tables**: applications, courses, modules, lessons, enrollments, lesson_progress
- **14 indexes**: optimized for common queries
- **15 RLS policies**: secure data access per user role (includes admin policies)
- **2 triggers**: auto-update timestamps

### Storage Buckets (Manual Setup)

After running the schema, create these storage buckets in Supabase Dashboard → Storage:

1. **videos** (public with RLS, 500MB limit)
   - For lesson video files
   - Apply storage RLS policies (see schema.sql comments)

2. **thumbnails** (public, 5MB limit)
   - For course preview images
   - No RLS needed

3. **resources** (private with RLS, 50MB limit)
   - For downloadable course materials
   - Apply storage RLS policies (see schema.sql comments)

### Development

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev

# Access routes:
# - Course catalog: http://localhost:4321/courses
# - Admin builder: http://localhost:4321/admin/courses (requires auth)
# - Student dashboard: http://localhost:4321/dashboard (requires auth)
```

### E-Learning Routes

**Student Routes:**
- `/courses` - Public course catalog (browse all published courses)
- `/courses/[slug]` - Course detail page (syllabus, modules, lessons)
- `/courses/[slug]/lessons/[lesson-slug]` - Lesson viewer (video player + content)
- `/dashboard` - Student progress dashboard (enrolled courses, completion %)

**Teacher Routes:**
- `/teacher` - **NEW** Unified teacher dashboard (create/manage courses, track progress)
  - Course creation and management
  - Cohort organization
  - Student progress monitoring
  - Real-time engagement tracking
- `/admin` - Admin applications portal (for admins)

### Environment Variables

The e-learning platform reuses existing Supabase configuration:
- `PUBLIC_SUPABASE_URL` - Already configured for auth/applications
- `PUBLIC_SUPABASE_ANON_KEY` - Already configured
- `SUPABASE_SERVICE_ROLE_KEY` - Already configured (admin operations)

No additional environment variables needed for basic e-learning functionality.

### Video Hosting

**Current:** Supabase Storage (free 1GB tier, S3-compatible)
**Future:** Cloudflare Stream integration planned ($1/1000min viewed, adaptive bitrate for 3G)

For Phase 1 MVP, videos stored in Supabase Storage. Cloudflare Stream migration will be added when ready with additional env vars:
- `CLOUDFLARE_ACCOUNT_ID` (when migrating to Cloudflare Stream)
- `CLOUDFLARE_API_TOKEN` (when migrating to Cloudflare Stream)

### Testing

The project has comprehensive test coverage (84% overall):

```bash
# Run all tests (unit + component, mocked)
npm test

# Run tests in watch mode
npm test:watch

# Run integration tests (requires Supabase connection)
npm run test:integration

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- Unit tests: 31/31 (100%) - Utility functions
- Component tests: 105/120 (87.5%) - React components
- Integration tests: 11/24 (45.8%) - Database workflows

**One-time setup for integration tests:**

```bash
# 1. Create test users in Supabase
node create-test-users.ts

# 2. Verify database schema
node verify-schema.js

# 3. Run integration tests
npm run test:integration
```

Integration tests use real Supabase database to verify:
- Course creation and management
- Student enrollment and progress tracking
- Row Level Security (RLS) policies
- Video resume functionality

## Project Structure

```
/
├── public/
│   ├── logo.jpeg          # C4C Campus logo
│   └── favicon.svg        # Site favicon
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro    # Main layout with nav/footer
│   ├── pages/
│   │   ├── index.astro         # Home page
│   │   ├── programs/
│   │   │   ├── index.astro     # Programs overview
│   │   │   ├── bootcamp.astro  # Bootcamp details
│   │   │   ├── hackathons.astro # Hackathons details
│   │   │   └── accelerator.astro # Accelerator details
│   │   ├── community.astro     # Community page
│   │   ├── builds.astro        # Projects showcase
│   │   ├── about.astro         # About C4C Campus
│   │   └── apply.astro         # Application forms
│   └── styles/
│       └── global.css          # Global styles
├── astro.config.mjs       # Astro configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json
```

## Pages

### Core Pages
- **/** - Home with three-stage pipeline showcase
- **/programs** - Pipeline overview and decision guide
- **/programs/bootcamp** - Bootcamp details and application
- **/programs/hackathons** - Hackathon format and registration
- **/programs/accelerator** - Accelerator criteria and application
- **/community** - Community channels and testimonials
- **/builds** - Production tools, prototypes, student projects
- **/about** - Vision, principles, Open Paws network
- **/apply** - Three application paths

## Customization

### Update Site Domain
Edit `astro.config.mjs`:
```js
export default defineConfig({
  site: 'https://yourdomain.com',
});
```

### Update Colors
Edit `tailwind.config.js` to change the primary (green) and accent (amber) colors.

### Add Content
All pages are in `src/pages/`. Edit the `.astro` files directly to update content.

### Forms Integration
The forms in `apply.astro` have placeholder handlers. Integrate with:
- Formspree
- Netlify Forms
- Custom backend

Update the form `action` attributes and JavaScript handlers.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

Or use Netlify's GitHub integration.

### Manual Deployment

```bash
npm run build
```

Upload the `dist/` folder to any static hosting provider.

## Performance Optimization

Current optimizations:
- Static site generation (no client-side JS framework)
- Minimal JavaScript (only for mobile menu and form handling)
- Tailwind CSS purging in production
- Semantic HTML for accessibility
- Mobile-first responsive design

### Lighthouse Goals
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

Test with: `npm run build && npm run preview` then run Lighthouse.

## Adding Features

### Blog/News
Add a `src/pages/blog/` directory with markdown files. Astro has built-in support for content collections.

### CMS Integration
Consider:
- Sanity.io (recommended for easy updates)
- Strapi
- Contentful

### Analytics
Add Plausible or similar privacy-focused analytics:
```astro
<!-- In BaseLayout.astro head -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Contributing

This is liberation infrastructure. Contributions should follow ASSURED principles:
- Works on low-bandwidth connections
- Accessible to all users
- Fast and lightweight
- No unnecessary dependencies

## License

[Add your license here]

## Contact

- Discord: [Add link]
- WhatsApp: [Add link]
- Email: [Add email]

---

Built with optimism for the Global South. Liberation infrastructure, not corporate portfolios.
