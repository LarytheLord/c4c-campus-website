# n8n Integration Setup Guide

## Overview

This guide explains how to set up the n8n integration for C4C Campus, which automatically creates n8n accounts for approved students and embeds the n8n editor in the student dashboard.

## Architecture

- **Single n8n Instance** with multi-user support
- **PostgreSQL Database** for n8n data persistence
- **Docker Compose** for easy deployment
- **Automatic User Creation** via Supabase webhooks
- **Embedded Editor** in student dashboard

---

## Setup Steps

### 1. Configure Environment Variables

Update the following in your `.env` file:

```bash
# Generate a secure random password
N8N_POSTGRES_PASSWORD=<generate-secure-password>

# Generate a 32-character encryption key (CRITICAL - DO NOT LOSE THIS)
N8N_ENCRYPTION_KEY=<generate-32-char-random-string>

# Will be generated after n8n is running
N8N_API_KEY=<leave-empty-for-now>

# API endpoint
N8N_API_URL=http://localhost:5678/api/v1

# Public URLs (update for production)
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://localhost:5678
N8N_EDITOR_BASE_URL=http://localhost:5678

# SMTP Configuration (for n8n to send emails)
N8N_SMTP_HOST=smtp.resend.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=resend
N8N_SMTP_PASS=<your-resend-api-key>
N8N_SMTP_SENDER=noreply@codeforcompassion.com

# Webhook secret for Supabase
SUPABASE_WEBHOOK_SECRET=<generate-random-string>
```

**To generate secure random strings:**

```bash
# For passwords and secrets (32 chars)
openssl rand -base64 32

# For the encryption key (exactly 32 chars)
openssl rand -hex 16
```

---

### 2. Start n8n with Docker

```bash
# Start n8n and PostgreSQL
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f n8n
```

n8n will be available at http://localhost:5678

---

### 3. Initial n8n Setup

1. **Open n8n in browser**: http://localhost:5678
2. **Create owner account**:
   - Email: your-admin-email@codeforcompassion.com
   - Password: (secure password)
   - First Name: Admin
   - Last Name: C4C
3. **Enable API Key**:
   - Go to Settings → API
   - Generate a new API key
   - Copy the key and add it to `.env`:
     ```
     N8N_API_KEY=n8n_your_generated_api_key_here
     ```
4. **Restart your Astro dev server** to pick up the new env var

---

### 4. Configure Supabase Database

Run the updated schema in Supabase SQL Editor:

```bash
# The schema adds n8n tracking fields to applications table
```

Execute the SQL from `supabase-schema.sql` (it now includes n8n fields).

---

### 5. Set Up Supabase Webhook

Go to Supabase Dashboard → Database → Webhooks:

1. **Create New Webhook**
   - Name: `Create n8n user on approval`
   - Table: `applications`
   - Events: `UPDATE`
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: `https://your-domain.com/api/supabase-webhook`
     - For local dev: Use ngrok to expose localhost
   - HTTP Headers:
     ```
     Authorization: Bearer <your-SUPABASE_WEBHOOK_SECRET>
     Content-Type: application/json
     ```

2. **Add Conditions** (optional but recommended):
   ```sql
   record.status = 'approved' AND (old_record.status IS NULL OR old_record.status != 'approved')
   ```

---

### 6. Production Deployment

#### Update Environment Variables for Production:

```bash
N8N_HOST=n8n.codeforcompassion.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.codeforcompassion.com
N8N_EDITOR_BASE_URL=https://n8n.codeforcompassion.com
N8N_API_URL=https://n8n.codeforcompassion.com/api/v1
```

#### Set up SSL/TLS:

Add to `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - n8n
```

Or use a reverse proxy like Cloudflare Tunnel, Caddy, or Traefik.

---

## How It Works

### User Flow:

1. **Student applies** via `/apply` page
   - Account created in Supabase Auth (`auth.users`)
   - Application saved to `applications` table with status `pending`

2. **Admin approves application**
   - Update `applications.status` to `approved` in Supabase

3. **Supabase webhook triggers**
   - Calls `/api/supabase-webhook`
   - Webhook verifies secret
   - Calls `/api/create-n8n-user` internally
   - n8n user created via n8n Public API
   - `applications` table updated with `n8n_user_id` and `n8n_invite_sent`

4. **Student logs in**
   - Redirected to `/dashboard`
   - Dashboard shows n8n editor in iframe
   - Student can build workflows directly in the platform

### API Endpoints:

- **`/api/apply`** - Creates Supabase user and application
- **`/api/supabase-webhook`** - Handles Supabase webhooks (protected)
- **`/api/create-n8n-user`** - Creates n8n user account (internal)

---

## Testing the Integration

### 1. Test Application Flow:

```bash
# Start dev server
npm run dev

# Apply as a test user at http://localhost:4321/apply
# Use a test email like test@example.com
```

### 2. Manually Approve in Supabase:

Go to Supabase → Table Editor → applications:
- Find your test application
- Change `status` from `pending` to `approved`
- Check your application logs for webhook activity

### 3. Verify n8n User Created:

Go to http://localhost:5678:
- Settings → Users
- Your test user should appear in the list

### 4. Test Dashboard:

- Login at http://localhost:4321/login
- Should redirect to `/dashboard`
- Click "Workflow Builder" tab
- n8n editor should load in iframe

---

## Troubleshooting

### n8n Won't Start:

```bash
# Check logs
docker-compose logs n8n

# Common issues:
# - Port 5678 already in use
# - PostgreSQL not healthy
# - Invalid encryption key

# Reset and try again
docker-compose down -v
docker-compose up -d
```

### Webhook Not Triggering:

```bash
# Check webhook logs in Supabase Dashboard
# Verify Authorization header matches SUPABASE_WEBHOOK_SECRET
# Check your API endpoint is publicly accessible (use ngrok for local dev)
```

### n8n User Creation Fails:

```bash
# Verify N8N_API_KEY is correct
# Check n8n logs: docker-compose logs n8n
# Ensure n8n Public API is enabled (N8N_PUBLIC_API_DISABLED=false)
# Check API URL is correct in .env
```

### iframe Not Loading:

```bash
# Check browser console for iframe errors
# n8n may block iframe embedding by default
# Add to n8n environment in docker-compose.yml:
#   N8N_SECURE_COOKIE: 'false'  # for local dev only
#   N8N_EDITOR_BASE_URL: http://localhost:5678
```

---

## Security Notes

1. **NEVER commit `.env` file** - It contains secrets
2. **Change all default passwords** before production
3. **Use HTTPS in production** - Required for secure cookies
4. **Protect webhook endpoint** - Verify Authorization header
5. **Keep encryption key safe** - All n8n data is encrypted with it

---

## Advanced Configuration

### Custom n8n Nodes:

Place custom nodes in `./n8n_data/custom-nodes/`

### Backup n8n Data:

```bash
# Backup PostgreSQL database
docker-compose exec postgres-n8n pg_dump -U n8n n8n > n8n-backup.sql

# Backup n8n data volume
docker run --rm -v c4c-website_n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-data-backup.tar.gz /data
```

### Scale n8n:

For production, consider:
- Multiple n8n workers
- Redis for queue management
- Kubernetes deployment

See: https://docs.n8n.io/hosting/scaling/

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Public API](https://docs.n8n.io/api/)
- [Supabase Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Docker Compose](https://docs.docker.com/compose/)
