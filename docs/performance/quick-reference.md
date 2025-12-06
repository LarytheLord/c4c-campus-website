# Performance Optimization - Quick Reference

Quick reference guide for maintaining and monitoring C4C Campus platform performance.

## 🚀 Quick Commands

```bash
# Build with optimizations
npm run build:production

# Optimize images
npm run optimize:images

# Analyze bundle size
npm run analyze:bundle

# Run Lighthouse audit
npm run perf:audit

# Standard build
npm run build

# Development
npm run dev
```

## 📊 Key Metrics to Monitor

### Target Performance Scores

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Lighthouse Performance | 95+ | < 85 |
| First Contentful Paint | < 1.5s | > 3s |
| Time to Interactive | < 2.5s | > 5s |
| Total Bundle Size | < 800KB | > 1.2MB |
| Database Query Time | < 50ms | > 200ms |
| Cache Hit Rate | > 80% | < 60% |

## 🗄️ Database Optimization

### Refresh Materialized Views

```sql
-- Manual refresh
SELECT refresh_analytics_views();

-- Check last refresh
SELECT schemaname, matviewname, ispopulated
FROM pg_matviews
WHERE schemaname = 'public';
```

### Check Slow Queries

```sql
-- View slow queries (if pg_stat_statements enabled)
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Check Index Usage

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%';
```

## 🖼️ Image Optimization

### Using OptimizedImage Component

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  loading="lazy"
/>
```

### Supported Formats
- ✅ WebP (primary)
- ✅ JPEG (fallback)
- ✅ PNG (fallback)

### Responsive Sizes
- Thumbnail: 300px
- Small: 640px
- Medium: 1024px
- Large: 1920px

## 💾 Caching Strategy

### Cache TTL by Data Type

```typescript
// Import cache utilities
import { cache, withCache, cacheInvalidation } from '../lib/cache';

// Cache with custom TTL
const data = await withCache('my-key', fetchData, 300); // 5 minutes

// Invalidate specific caches
cacheInvalidation.courses();
cacheInvalidation.cohorts('cohort-123');
cacheInvalidation.progress('user-abc');
```

### Cache Invalidation Patterns

| Event | Action |
|-------|--------|
| Course updated | `cacheInvalidation.courses()` |
| Cohort created/modified | `cacheInvalidation.cohorts(id)` |
| Lesson completed | `cacheInvalidation.progress(userId)` |
| Discussion posted | `cacheInvalidation.discussions(lessonId)` |

## 🔧 Troubleshooting

### High Bundle Size

```bash
# Analyze bundle
npm run analyze:bundle

# Check for duplicate dependencies
npm ls chart.js
npm ls react

# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

### Slow Database Queries

```sql
-- Analyze table statistics
ANALYZE table_name;

-- Reindex if needed
REINDEX TABLE table_name;

-- Check table bloat
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Low Cache Hit Rate

1. Check cache configuration in `src/lib/cache.ts`
2. Review invalidation patterns
3. Increase cache size or TTL if appropriate
4. Monitor with: `cache.getStats()`

### Image Optimization Failed

```bash
# Check sharp installation
npm list sharp

# Reinstall if needed
npm install sharp --force

# Run optimization with verbose logging
node scripts/optimize-images.js
```

## 📈 Performance Monitoring

### Check Server Timing

```bash
# View response headers
curl -I https://your-domain.com/api/courses

# Look for Server-Timing header
Server-Timing: total;dur=45
```

### Monitor Cache Hit Rates

```typescript
// In your monitoring dashboard
import { cache } from './lib/cache';

const stats = cache.getStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
console.log(`Keys: ${stats.keys.join(', ')}`);
```

## 🚨 Critical Alerts

### Set up alerts for:

1. **Performance < 85** - Investigate bundle size and queries
2. **Query time > 200ms** - Check indexes and query plans
3. **Cache hit rate < 60%** - Review caching strategy
4. **Bundle size > 1.2MB** - Audit dependencies

## 📚 Related Documentation

- [Full Optimization Report](./optimization-report.md)
- [Database Schema](../../schema.sql)
- [Caching Implementation](../../src/lib/cache.ts)
- [Image Optimization Script](../../scripts/optimize-images.js)

## 🔄 Regular Maintenance Schedule

### Daily
- ✅ Monitor performance metrics
- ✅ Check error logs

### Weekly
- ✅ Review slow query logs
- ✅ Check cache hit rates
- ✅ Monitor bundle sizes

### Monthly
- ✅ Run full Lighthouse audit
- ✅ Analyze database indexes
- ✅ Update dependencies
- ✅ Reindex database tables

### Quarterly
- ✅ Full performance audit
- ✅ Review optimization strategies
- ✅ Load testing
- ✅ CDN configuration review

## 🎯 Performance Targets

### Load Time Budgets

| Page Type | Target | Max |
|-----------|--------|-----|
| Homepage | 1.5s | 3s |
| Dashboard | 2.0s | 4s |
| Course Page | 1.8s | 3.5s |
| Lesson Page | 2.2s | 4s |
| Admin Pages | 2.5s | 5s |

### Bundle Size Budgets

| Chunk | Target | Max |
|-------|--------|-----|
| Main | 200KB | 300KB |
| Vendor | 400KB | 600KB |
| Chart.js | 200KB | 250KB |
| Editor | 300KB | 400KB |
| Page-specific | 50KB | 100KB |

## 💡 Quick Tips

1. **Always lazy load heavy components** (Chart.js, TipTap editor)
2. **Use prepared statements** for database queries
3. **Cache expensive computations** with appropriate TTL
4. **Optimize images before uploading** to storage
5. **Monitor cache hit rates** weekly
6. **Keep dependencies up to date** monthly
7. **Run Lighthouse audits** before major releases
8. **Use code splitting** for route-specific code

## 🆘 Getting Help

If you encounter performance issues:

1. Check this quick reference first
2. Review the [full optimization report](./optimization-report.md)
3. Run diagnostics: `npm run analyze:bundle`
4. Check database query plans
5. Monitor cache statistics
6. Review recent code changes

---

**Last Updated:** October 29, 2025
**Version:** 1.1.0
