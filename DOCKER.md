# Docker Setup for C4C Campus Website

This document provides instructions for running the C4C Campus Website using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- `.env` file configured (copy from `.env.example`)

## Quick Start

### Production Deployment

```bash
# Build and start the containers
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop containers
docker-compose down
```

### Development Mode

```bash
# Run with hot-reload enabled
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or in detached mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Email
RESEND_API_KEY=your_resend_key

# Database (if using local Postgres)
DB_USER=c4c_user
DB_PASSWORD=your_secure_password
DB_NAME=c4c_db
DB_PORT=5432

# Application
PORT=4321
NODE_ENV=production
```

## Docker Images

### Node.js SSR Build (Default)

The default `Dockerfile` builds the Astro application with Node.js adapter for server-side rendering.

```bash
docker build -t c4c-website:latest .
docker run -p 4321:4321 --env-file .env c4c-website:latest
```

### Static Build with Nginx

For static deployment with Nginx (better performance for static sites):

```bash
docker build -f Dockerfile.nginx -t c4c-website:nginx .
docker run -p 80:80 c4c-website:nginx
```

## Services

### Web Application

- **Port**: 4321 (Node.js) or 80 (Nginx)
- **Health Check**: `http://localhost:4321/health`
- **Restart Policy**: unless-stopped

### PostgreSQL (Optional)

- **Port**: 5432
- **User**: Configured via environment variables
- **Data**: Persisted in Docker volume `postgres_data`

## Commands

### Build Only

```bash
# Build the image
docker-compose build

# Build without cache
docker-compose build --no-cache
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f postgres
```

### Execute Commands in Container

```bash
# Open shell in running container
docker-compose exec web sh

# Run npm commands
docker-compose exec web npm run check
docker-compose exec web npm run test
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U c4c_user -d c4c_db

# Backup database
docker-compose exec postgres pg_dump -U c4c_user c4c_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U c4c_user c4c_db < backup.sql
```

## Volumes

- `postgres_data`: PostgreSQL data persistence
- `./data`: Application data files
- `./logs`: Application logs

## Networking

All services run on the `c4c-network` bridge network, allowing inter-container communication.

## Health Checks

The web service includes health checks:

- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

Check health status:

```bash
docker-compose ps
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs web

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Port already in use

Change the port in `.env`:

```env
PORT=4322
```

Or map to different host port:

```bash
docker-compose up -d
# Edit docker-compose.yml ports: "8080:4321"
```

### Permission issues

```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .

# Check container user
docker-compose exec web id
```

### Database connection issues

```bash
# Verify Postgres is running
docker-compose ps postgres

# Check connection from web container
docker-compose exec web nc -zv postgres 5432

# View database logs
docker-compose logs postgres
```

## Production Deployment

### Security Checklist

1. Use strong passwords for database
2. Set secure `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
3. Enable HTTPS (use reverse proxy like Nginx or Traefik)
4. Regularly update base images
5. Scan images for vulnerabilities

### Recommended Setup

```bash
# 1. Set production environment variables
cp .env.example .env.production
# Edit .env.production with production values

# 2. Build production image
docker-compose -f docker-compose.yml build

# 3. Start services
docker-compose -f docker-compose.yml up -d

# 4. Monitor logs
docker-compose logs -f
```

### Using with Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Maintenance

### Update Dependencies

```bash
# Update base image
docker-compose pull

# Rebuild with latest dependencies
docker-compose build --no-cache
```

### Clean Up

```bash
# Remove stopped containers
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Performance Optimization

1. **Multi-stage builds**: Already implemented to reduce image size
2. **Layer caching**: Dependencies are cached separately from source code
3. **Non-root user**: Containers run as unprivileged user for security
4. **Alpine base**: Uses lightweight Alpine Linux images

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review documentation in `/docs`
- Open an issue on the project repository
