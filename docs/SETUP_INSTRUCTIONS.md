# C4C Campus - Complete Setup Instructions

## 🎯 What You Have Now

Your C4C Campus platform is fully built with:

✅ **Application System** - Students apply, admins approve
✅ **User Authentication** - Supabase Auth integration
✅ **Application Status Page** - Pending users see their status & can edit
✅ **Student Dashboard** - Approved users access n8n workflow builder
✅ **Admin Dashboard** - Review and manage applications
✅ **n8n Integration** - Automatic user provisioning
✅ **Contact Form** - Email integration
✅ **Mock User Generator** - Testing script

---

## 🚀 Quick Start (5 Steps)

### Step 1: Run Database Schema in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. **Create new query**
3. **Copy and paste** the entire content of `supabase-schema.sql`
4. **Click "Run"**

This creates the `applications` table and all necessary views/functions.

### Step 2: Verify Environment Variables

Check your `.env` file has:
- ✅ `PUBLIC_SUPABASE_URL`
- ✅ `PUBLIC_SUPABASE_ANON_KEY`
- ✅ `RESEND_API_KEY` (get from resend.com)
- ⚠️ n8n variables (optional for basic testing)

###Step 3: Create Test Users

```bash
node create-test-users.js
```

This creates 3 test students with pending applications.

### Step 4: Test the Admin Dashboard

1. **Open**: http://localhost:4321/admin
2. **See**: 3 pending applications
3. **Click "View"** on any application
4. **Click "Approve Application"**

### Step 5: Test Student Login

1. **Open**: http://localhost:4321/login
2. **Use credentials**:
   - Email: priya.test@codeforcompassion.com
   - Password: TestStudent123!
3. **If approved**: Redirects to `/dashboard` (student portal)
4. **If pending**: Redirects to `/application-status` (view only)

---

## 📋 Complete User Flows

### Flow 1: Student Applies

```
User visits /apply
       ↓
Fills out bootcamp/accelerator form
       ↓
Submits with email + password
       ↓
Account created in Supabase Auth (status: pending)
       ↓
Application saved in applications table
       ↓
User gets confirmation
```

### Flow 2: Pending Student Logs In

```
Student logs in at /login
       ↓
System checks application status
       ↓
Status = "pending" → Redirect to /application-status
       ↓
Student sees: "Application Under Review"
       ↓
Can edit application details
       ↓
Cannot access /dashboard yet
```

### Flow 3: Admin Approves Application

```
Admin visits /admin
       ↓
Sees pending applications list
       ↓
Clicks "View" → Reviews details
       ↓
Clicks "Approve Application"
       ↓
Status changed to "approved" in database
       ↓
Supabase webhook fires (if configured)
       ↓
n8n user created automatically (if configured)
```

### Flow 4: Approved Student Accesses Dashboard

```
Student logs in at /login
       ↓
System checks application status
       ↓
Status = "approved" → Redirect to /dashboard
       ↓
Student sees full portal:
  - Overview tab
  - Workflow Builder (n8n iframe)
  - My Projects
  - Progress tracking
```

---

## 🎨 Pages Overview

| URL | Purpose | Access |
|-----|---------|--------|
| `/` | Homepage | Public |
| `/apply` | Application forms | Public |
| `/login` | Student/admin login | Public |
| `/application-status` | View pending application | Pending students only |
| `/dashboard` | Student portal with n8n | Approved students only |
| `/admin` | Manage applications | Any logged-in user* |
| `/contact` | Contact form | Public |

*To restrict admin access, see admin.astro line 155

---

## 🔑 Test User Credentials

After running `node create-test-users.js`:

| Name | Email | Password | Status |
|------|-------|----------|--------|
| Priya Sharma | priya.test@codeforcompassion.com | TestStudent123! | pending |
| Arjun Patel | arjun.test@codeforcompassion.com | TestStudent123! | pending |
| Zara Khan | zara.test@codeforcompassion.com | TestStudent123! | pending |

---

## ⚙️ Optional: n8n Setup

For full n8n integration (auto-provisioning):

1. **Follow N8N_SETUP.md** for complete guide
2. **Start n8n**:
   ```bash
   docker-compose up -d
   ```
3. **Configure** at http://localhost:5678
4. **Generate API key** in n8n Settings
5. **Add to .env**: `N8N_API_KEY=your_key_here`
6. **Set up Supabase webhook** (see N8N_SETUP.md)

Without n8n setup, students can still:
- Apply and login
- See application status
- Access dashboard (n8n iframe won't load)

---

## 🧪 Testing Scenarios

### Test 1: Application → Pending → Approval → Dashboard

```bash
# 1. Create test user
node create-test-users.js

# 2. Login as Priya (pending)
# Visit: http://localhost:4321/login
# Email: priya.test@codeforcompassion.com
# Password: TestStudent123!
# Result: Redirected to /application-status

# 3. Approve Priya
# Visit: http://localhost:4321/admin
# Click "View" on Priya → "Approve Application"

# 4. Login as Priya again
# Visit: http://localhost:4321/login
# Result: Redirected to /dashboard
```

### Test 2: Edit Pending Application

```bash
# 1. Login as pending user
# Visit: http://localhost:4321/login
# Use any test user credentials

# 2. Click "Edit Application" button

# 3. Modify WhatsApp, location, or text fields

# 4. Click "Save Changes"

# 5. Changes reflected in admin dashboard
```

### Test 3: Contact Form

```bash
# 1. Visit: http://localhost:4321/contact

# 2. Fill out form

# 3. Submit

# 4. If RESEND_API_KEY configured: Email sent
# 5. If not: Helpful error message shown
```

---

## 📂 Key Files Reference

### Database
- `supabase-schema.sql` - Main database schema
- `setup-mock-users.sql` - SQL helpers and views
- `supabase-n8n-trigger.sql` - n8n webhook trigger (optional)

### Application Flow
- `src/pages/apply.astro` - Application forms
- `src/pages/api/apply.ts` - Create user + save application
- `src/pages/login.astro` - Login with status-based redirect
- `src/pages/application-status.astro` - Pending user view
- `src/pages/dashboard.astro` - Approved student portal

### Admin
- `src/pages/admin.astro` - Application management dashboard
- Can approve/reject applications
- View all details
- Filter by status/program

### n8n Integration
- `docker-compose.yml` - n8n + PostgreSQL setup
- `src/pages/api/create-n8n-user.ts` - Create n8n accounts
- `src/pages/api/supabase-webhook.ts` - Auto-provision on approval

### Testing
- `create-test-users.js` - Generate mock applicants
- `TESTING.md` - Complete testing guide

### Documentation
- `N8N_SETUP.md` - n8n integration guide
- `SETUP_INSTRUCTIONS.md` - This file
- `TESTING.md` - Testing scenarios

---

## 🐛 Troubleshooting

### "Unexpected end of JSON input"
**Problem**: `applications` table doesn't exist
**Solution**: Run `supabase-schema.sql` in Supabase SQL Editor

### Test users creation fails
**Problem**: Same as above
**Solution**: Create database table first

### Can't access /admin
**Problem**: Not logged in
**Solution**: Login at `/login` with any Supabase user

### n8n iframe not loading
**Problem**: n8n not running
**Solution**: Start with `docker-compose up -d`

### Contact form doesn't send email
**Problem**: `RESEND_API_KEY` not configured
**Solution**: Get API key from resend.com and add to `.env`

---

## 🎯 Next Steps

After basic setup works:

1. ✅ **Test the full flow** - Apply → Approve → Dashboard
2. ✅ **Customize dashboard tabs** - Add real Projects/Progress features
3. ✅ **Set up n8n** (optional) - Follow N8N_SETUP.md
4. ✅ **Configure email** - Add Resend API key
5. ✅ **Add admin role check** - Restrict `/admin` access
6. ✅ **Deploy to production** - Vercel, Netlify, or your choice

---

## 📞 Support

- **Supabase Issues**: Check dashboard → Database → tables
- **n8n Issues**: See N8N_SETUP.md troubleshooting
- **Testing**: See TESTING.md for scenarios
- **General**: Check browser console for errors

---

## 🎨 Customization Guide

### Change Application Form Fields

Edit `src/pages/apply.astro`:
1. Add new form fields (lines 50-150)
2. Update JavaScript handler (lines 200-250)
3. Update `src/pages/api/apply.ts` to save new fields
4. Add columns to `applications` table in Supabase

### Modify Dashboard Tabs

Edit `src/pages/dashboard.astro`:
1. Add tab button (line 25-35)
2. Add tab content section (line 50-100)
3. Update `switchTab()` function

### Customize Application Status Page

Edit `src/pages/application-status.astro`:
1. Modify status cards (lines 80-150)
2. Change "What Happens Next" steps (lines 120-140)
3. Update edit modal fields (lines 180-220)

---

## ✅ You're Ready!

Run these commands to start:

```bash
# 1. Make sure dev server is running
npm run dev

# 2. Run Supabase schema (in Supabase Dashboard SQL Editor)

# 3. Create test users
node create-test-users.js

# 4. Open admin dashboard
open http://localhost:4321/admin

# 5. Approve a user and test login
open http://localhost:4321/login
```

Happy coding! 🚀
