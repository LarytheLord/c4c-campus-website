# C4C Campus Monitoring & Alerting Setup

**Complete guide for setting up production monitoring**

---

## Overview

This guide covers setting up comprehensive monitoring for:
- Application errors and performance
- Database health and queries
- Infrastructure (CPU, memory, disk)
- User activity and engagement
- Availability and uptime

---

## 1. Error Tracking with Sentry

### Installation

```bash
npm install @sentry/astro
```

### Configuration

Create `src/lib/sentry.ts`:

```typescript
import * as Sentry from "@sentry/astro";

export function initializeSentry() {
  Sentry.init({
    dsn: import.meta.env.SENTRY_DSN,
    environment: import.meta.env.NODE_ENV,
    enabled: import.meta.env.NODE_ENV === 'production',

    // Performance monitoring
    tracesSampleRate: 1.0,
    profilesSampleRate: 0.1,

    // Release tracking
    release: process.env.GIT_COMMIT_SHA,

    // Ignore known errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],

    // Sample errors in high-traffic scenarios
    beforeSend(event) {
      // Ignore client-side errors in development
      if (import.meta.env.DEV) return null;

      // Sample 10% of normal errors (keep 100% of crashes)
      if (event.level === 'error' && Math.random() > 0.1) return null;

      return event;
    },
  });
}
```

### Alert Configuration

In Sentry Dashboard → Alerts → Create Alert Rule:

**Alert 1: High Error Rate**
```
When: Error count
Condition: > 100 in the last 5 minutes
Actions: Send to Slack #incidents
```

**Alert 2: New Issue**
```
When: A new issue is created
For: Only fatal errors
Actions: Send to Slack #incidents + PagerDuty
```

**Alert 3: Release Health**
```
When: Crash-free sessions
Condition: < 95% in the last 24 hours
Actions: Send to Slack #incidents
```

### Monitoring Dashboard

Create custom Sentry dashboard with:
- Error rate (5-minute rolling average)
- Top 10 errors
- Affected users count
- Browser/device distribution
- Geographic error distribution

---

## 2. Database Monitoring

### Setup Query Monitoring

```sql
-- Enable extended statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create monitoring view
CREATE OR REPLACE VIEW db_health_metrics AS
SELECT
  'database_size' as metric,
  pg_database_size(current_database()) as value,
  'bytes' as unit,
  NOW() as measured_at
UNION ALL
SELECT
  'connection_count',
  (SELECT count(*) FROM pg_stat_activity)::bigint,
  'connections',
  NOW()
UNION ALL
SELECT
  'idle_transactions',
  (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle in transaction')::bigint,
  'transactions',
  NOW()
UNION ALL
SELECT
  'slow_queries',
  (SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 1000)::bigint,
  'queries',
  NOW();

-- Create alerts table
CREATE TABLE IF NOT EXISTS database_alerts (
  id SERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- critical, warning, info
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### Supabase Monitoring

In Supabase Dashboard → Monitoring:

Enable alerts for:
1. **Database**: Disk usage > 80%
2. **Database**: Connections > 80 (out of max)
3. **Database**: CPU usage > 80%
4. **Postgres**: Query duration > 5 seconds (count)
5. **Postgres**: Cache hit ratio < 99%

### Performance Monitoring

```sql
-- Monitor slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
AND mean_exec_time > 100  -- > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Monitor table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  ROUND(100 * pg_relation_size(schemaname||'.'||tablename) /
        pg_total_relation_size(schemaname||'.'||tablename)) as index_ratio
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 3. Application Performance Monitoring (APM)

### Option A: Using Sentry (Recommended)

```typescript
// src/middleware.ts
import * as Sentry from "@sentry/astro";

export function middleware(context) {
  const transaction = Sentry.startTransaction({
    op: "http.server",
    name: context.request.url,
  });

  return new Promise((resolve) => {
    const startTime = Date.now();

    const response = context.next();

    response.then(() => {
      const duration = Date.now() - startTime;

      transaction.setTag('status_code', response.status);
      transaction.setMeasurement('duration', duration);
      transaction.setData('url', context.request.url);

      transaction.finish();
    });

    resolve(response);
  });
}
```

### Option B: Using Custom Web Vitals

```typescript
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  const vitals = {
    cls: undefined as number | undefined,
    fid: undefined as number | undefined,
    fcp: undefined as number | undefined,
    lcp: undefined as number | undefined,
    ttfb: undefined as number | undefined,
  };

  getCLS((metric) => {
    vitals.cls = metric.value;
    sendMetric('cls', metric.value);
  });

  getFID((metric) => {
    vitals.fid = metric.value;
    sendMetric('fid', metric.value);
  });

  getFCP((metric) => {
    vitals.fcp = metric.value;
    sendMetric('fcp', metric.value);
  });

  getLCP((metric) => {
    vitals.lcp = metric.value;
    sendMetric('lcp', metric.value);
  });

  getTTFB((metric) => {
    vitals.ttfb = metric.value;
    sendMetric('ttfb', metric.value);
  });

  return vitals;
}

async function sendMetric(name: string, value: number) {
  // Send to monitoring service
  if (!navigator.sendBeacon) return;

  const data = JSON.stringify({
    metric: name,
    value,
    timestamp: Date.now(),
    url: window.location.href,
  });

  navigator.sendBeacon('/api/metrics', data);
}
```

---

## 4. Infrastructure Monitoring (Self-Hosted)

### Using Prometheus + Grafana

#### Install Prometheus

```yaml
# docker-compose.yml addition
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana_data:/var/lib/grafana

node-exporter:
  image: prom/node-exporter:latest
  ports:
    - "9100:9100"
  volumes:
    - /proc:/host/proc:ro
    - /sys:/host/sys:ro
    - /:/rootfs:ro
  command:
    - '--path.procfs=/host/proc'
    - '--path.sysfs=/host/sys'
    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
```

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'c4c-campus'
    static_configs:
      - targets: ['localhost:3000']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

rule_files:
  - 'alert-rules.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

#### Alert Rules

```yaml
# alert-rules.yml
groups:
  - name: c4c-campus
    interval: 30s
    rules:
      - alert: HighCPUUsage
        expr: rate(node_cpu_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage > 80%"
          description: "{{ $labels.instance }} CPU usage is {{ $value }}"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage > 85%"
          description: "{{ $labels.instance }} memory usage is {{ $value }}"

      - alert: DiskFull
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk usage > 85%"
          description: "{{ $labels.device }} on {{ $labels.instance }} is {{ $value }}"

      - alert: ApplicationDown
        expr: up{job="c4c-campus"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
```

---

## 5. Uptime Monitoring

### Using Uptime Robot (Free Tier)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add monitor:
   - URL: https://c4ccampus.org
   - Frequency: Every 5 minutes
   - Alert contacts: Email, Slack

### Setup Status Page

Option A: Use Uptime Robot's status page
Option B: Use dedicated service (statuspage.io, incident.io)

```html
<!-- Add to website footer -->
<div class="status-badge">
  <script src="https://api.uptimerobot.com/v1/status-page-script.js?id=1234567890"></script>
</div>
```

---

## 6. Log Aggregation

### Vercel/Netlify Logs

**Vercel:**
```bash
# View logs in real-time
vercel logs --tail

# Filter by type
vercel logs --tail --source output
vercel logs --tail --source error
```

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# View logs
netlify logs:tail

# Filter
netlify logs:tail -f env
```

### Self-Hosted: Using ELK Stack

```yaml
# docker-compose.yml
elasticsearch:
  image: elasticsearch:8.0.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  ports:
    - "9200:9200"

kibana:
  image: kibana:8.0.0
  ports:
    - "5601:5601"

filebeat:
  image: elastic/filebeat:8.0.0
  volumes:
    - /var/log/c4c-campus:/var/log/c4c-campus:ro
    - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
  command: filebeat -e
```

---

## 7. User Activity Monitoring

### Privacy-Friendly Analytics (Plausible)

```html
<!-- In Astro layout -->
<script defer data-domain="c4ccampus.org" src="https://plausible.io/js/script.js"></script>
```

**Plausible Dashboard Metrics:**
- Unique visitors
- Page views
- Top pages
- Top referrers
- Geographic distribution

### Event Tracking

```typescript
// Track custom events
declare global {
  function plausible(eventName: string, options?: Record<string, any>): void;
}

// Usage
export function trackEvent(name: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(name, { props });
  }
}

// Example: Track course enrollment
trackEvent('course_enrolled', { course_id: 'abc123' });
trackEvent('application_submitted', { program: 'bootcamp' });
```

### Alerts in Plausible

Set up email alerts for:
- Spike detection (traffic increase > 2x)
- Significant drop in visitors
- New referrer sources

---

## 8. Build & Deployment Monitoring

### Monitor Build Times

```bash
#!/bin/bash
# monitor-builds.sh

# Log build duration
START_TIME=$(date +%s)
npm run build
END_TIME=$(date +%s)

DURATION=$((END_TIME - START_TIME))
BUILD_SIZE=$(du -sb dist/ | cut -f1)

echo "{
  \"build_duration_seconds\": $DURATION,
  \"build_size_bytes\": $BUILD_SIZE,
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}" > build-metrics.json

# If build took > 5 minutes, alert
if [ $DURATION -gt 300 ]; then
  echo "⚠️  Build took longer than 5 minutes"
fi

# If bundle size > 5MB, alert
if [ $BUILD_SIZE -gt 5242880 ]; then
  echo "⚠️  Bundle size exceeds 5MB"
fi
```

### Deployment Frequency Metrics

Track in spreadsheet or database:
- Deployments per week
- Average time between deployments
- Rollback frequency
- MTTR (Mean Time To Recovery)

```sql
-- Create deployments tracking table
CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_by TEXT,
  status TEXT CHECK (status IN ('success', 'rolled_back', 'failed')),
  build_duration_seconds INT,
  bundle_size_bytes BIGINT,
  notes TEXT
);

-- Query metrics
SELECT
  DATE(deployed_at) as date,
  COUNT(*) as deployment_count,
  AVG(build_duration_seconds) as avg_build_time
FROM deployments
WHERE status = 'success'
GROUP BY DATE(deployed_at)
ORDER BY date DESC
LIMIT 30;
```

---

## 9. Alert Routing & Escalation

### Slack Webhook Configuration

```javascript
// src/lib/alerts.ts
export async function sendAlert(
  message: string,
  severity: 'info' | 'warning' | 'critical'
) {
  const colors = {
    info: '#36a64f',
    warning: '#ff9900',
    critical: '#ff0000',
  };

  const payload = {
    attachments: [
      {
        color: colors[severity],
        title: `${severity.toUpperCase()} Alert`,
        text: message,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  const webhook = process.env.SLACK_WEBHOOK_URL;

  return fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

### PagerDuty Integration (for Critical Alerts)

```javascript
export async function createIncident(
  title: string,
  description: string,
  severity: 'critical' | 'error' | 'warning'
) {
  const response = await fetch('https://api.pagerduty.com/incidents', {
    method: 'POST',
    headers: {
      'Authorization': `Token token=${process.env.PAGERDUTY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      incidents: [
        {
          type: 'incident',
          title,
          description,
          service: {
            id: process.env.PAGERDUTY_SERVICE_ID,
            type: 'service_reference',
          },
          urgency: severity === 'critical' ? 'high' : 'low',
        },
      ],
    }),
  });

  return response.json();
}
```

---

## 10. Monitoring Dashboard

### Grafana Dashboard Template

Create dashboard with panels:

1. **Application Health**
   - Error rate (last 24h)
   - Response time (p50, p95, p99)
   - Request rate
   - Top errors

2. **Database**
   - Connection count
   - Query duration (average, max)
   - Slow queries
   - Disk usage
   - Cache hit ratio

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk usage
   - Network I/O

4. **Deployment**
   - Build duration trend
   - Bundle size trend
   - Deployment frequency
   - Error rate after deployment

### Export JSON

```json
{
  "dashboard": {
    "title": "C4C Campus Production",
    "panels": [
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(errors_total[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 11. On-Call Monitoring Dashboard

Create mobile-friendly monitoring view:

```html
<!-- public/monitoring.html -->
<!DOCTYPE html>
<html>
<head>
  <title>C4C Campus - Production Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 1rem;
    }
    .metric {
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 0.5rem;
      background: #f5f5f5;
    }
    .metric.healthy { border-left: 4px solid #28a745; }
    .metric.warning { border-left: 4px solid #ffc107; }
    .metric.critical { border-left: 4px solid #dc3545; }
  </style>
</head>
<body>
  <h1>Production Status</h1>
  <div id="metrics"></div>

  <script>
    async function updateMetrics() {
      const response = await fetch('/api/monitoring');
      const data = await response.json();

      const html = Object.entries(data).map(([name, value]) => `
        <div class="metric ${getStatus(value)}">
          <strong>${name}</strong>: ${value.display}
        </div>
      `).join('');

      document.getElementById('metrics').innerHTML = html;
    }

    function getStatus(value) {
      if (value.status === 'healthy') return 'healthy';
      if (value.status === 'warning') return 'warning';
      return 'critical';
    }

    updateMetrics();
    setInterval(updateMetrics, 30000); // Update every 30s
  </script>
</body>
</html>
```

---

## 12. Regular Review Schedule

### Daily
- Check error logs (Sentry)
- Monitor alert channels (Slack)
- Verify application uptime

### Weekly
- Review performance trends
- Check database growth
- Analyze slow query logs
- Review user feedback

### Monthly
- Performance baseline comparison
- Database maintenance (VACUUM, ANALYZE)
- Dependency security audit
- Alert rule effectiveness review

### Quarterly
- Disaster recovery drill
- Monitoring infrastructure upgrade
- On-call runbook update
- Team training on monitoring tools

---

## Monitoring Health Checklist

- [ ] Sentry configured with alerts
- [ ] Supabase monitoring enabled
- [ ] Uptime monitoring in place
- [ ] Analytics configured
- [ ] Log aggregation working
- [ ] Performance monitoring active
- [ ] Infrastructure monitoring setup
- [ ] Alert channels configured
- [ ] On-call rotation established
- [ ] Dashboard created and accessible

---

## Quick Reference

| Metric | Target | Alert If |
|--------|--------|----------|
| Error Rate | < 0.5% | > 1% in 5 min |
| P95 Response | < 500ms | > 1s |
| Database Disk | < 80% | > 90% |
| Uptime | 99.9% | < 99.5% |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |

**Document Version**: 1.0.0
**Last Updated**: October 29, 2025
