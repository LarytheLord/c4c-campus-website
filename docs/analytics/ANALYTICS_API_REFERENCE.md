# Analytics API Reference

Complete API documentation for the C4C Campus Analytics System.

## Base URL

```
https://yourdomain.com/api
```

## Authentication

All analytics endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limits

- **Analytics Tracking:** 1000 events/hour per session
- **Query Endpoints:** 100 requests/minute per user
- **Export Endpoints:** 10 requests/hour per user
- **Admin Endpoints:** 500 requests/minute

## Event Tracking

### Track Event

Record an analytics event from client or server.

**Endpoint:** `POST /api/analytics/track`

**Request Body:**
```json
{
  "event_type": "video_play",
  "metadata": {
    "timestamp": 123,
    "playback_rate": 1.0
  },
  "course_id": 1,
  "lesson_id": 42,
  "cohort_id": 5,
  "duration_seconds": 300,
  "screen_width": 1920,
  "screen_height": 1080
}
```

**Event Types:**
- `page_view` - User views a page
- `video_play` - Video playback starts
- `video_pause` - Video paused
- `video_complete` - Video finished
- `lesson_start` - Lesson opened
- `lesson_complete` - Lesson finished
- `quiz_start` - Quiz attempt starts
- `quiz_submit` - Quiz submitted
- `resource_download` - File downloaded
- `discussion_post` - Posted to discussion
- `forum_post` - Posted to forum
- `enrollment` - Enrolled in course
- `course_complete` - Course completed
- `login` - User logged in
- `logout` - User logged out
- `search` - Search performed
- `navigation` - Navigation action
- `export` - Data exported
- `report_generate` - Report created

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
```json
{
  "error": "event_type is required"
}
```

---

## Teacher Analytics

### Get Engagement Heat Map

Retrieve engagement data by day of week and hour of day.

**Endpoint:** `GET /api/analytics/engagement-heatmap`

**Query Parameters:**
- `cohortId` (required) - Cohort ID
- `courseId` (optional) - Filter by course

**Response:**
```json
[
  {
    "day_of_week": 1,
    "hour_of_day": 14,
    "cohort_id": 5,
    "unique_users": 23,
    "total_events": 156,
    "avg_duration": 42.5
  }
]
```

**Field Descriptions:**
- `day_of_week`: 0 = Sunday, 6 = Saturday
- `hour_of_day`: 0-23 (24-hour format)
- `unique_users`: Distinct users active in this slot
- `total_events`: Total events recorded
- `avg_duration`: Average event duration in seconds

---

### Get Dropout Predictions

Retrieve at-risk student predictions for a cohort.

**Endpoint:** `GET /api/analytics/dropout-predictions`

**Query Parameters:**
- `cohortId` (required) - Cohort ID
- `courseId` (required) - Course ID
- `riskLevel` (optional) - Filter by risk level (low, medium, high, critical)
- `recalculate` (optional) - Set to `true` to force recalculation

**Response:**
```json
{
  "total": 42,
  "byRiskLevel": {
    "critical": [
      {
        "id": 1,
        "user_id": "uuid",
        "cohort_id": 5,
        "course_id": 1,
        "engagement_score": 25,
        "risk_level": "critical",
        "last_activity_days": 18,
        "total_events_7d": 2,
        "total_events_30d": 8,
        "lessons_completed": 3,
        "lessons_total": 20,
        "completion_velocity": 0.5,
        "current_progress_percentage": 15,
        "discussion_participation": 0,
        "video_completion_rate": 40,
        "predicted_dropout_probability": 0.85,
        "risk_factors": [...],
        "recommended_actions": [...],
        "user": {
          "email": "student@example.com",
          "raw_user_meta_data": {}
        }
      }
    ],
    "high": [...],
    "medium": [...],
    "low": [...]
  },
  "lastUpdated": "2025-10-31T10:30:00Z"
}
```

**Risk Factors Structure:**
```json
{
  "factor": "Extended Inactivity",
  "weight": 30,
  "description": "No activity for 18 days",
  "value": 18
}
```

---

### Get Lesson Effectiveness

Retrieve detailed analytics for a specific lesson.

**Endpoint:** `GET /api/analytics/lesson-effectiveness/{lessonId}`

**Response:**
```json
{
  "effectiveness": {
    "lesson_id": 42,
    "lesson_name": "Introduction to Python",
    "module_id": 5,
    "course_id": 1,
    "total_views": 85,
    "completions": 72,
    "completion_rate": 84.7,
    "avg_time_spent": 1847,
    "median_time_spent": 1650,
    "video_plays": 85,
    "video_completions": 75,
    "avg_watch_duration": 1230
  },
  "dropoffs": [
    {
      "timestamp": 630,
      "count": 12
    }
  ],
  "timeline": [
    {
      "date": "2025-10-01",
      "count": 15
    }
  ],
  "performanceDistribution": {
    "started": 85,
    "completed": 72,
    "viewed": 85,
    "completion_rate": "84.7"
  },
  "totalEvents": 1847
}
```

---

## Admin Analytics

### Get User Growth

Retrieve user growth trends and projections.

**Endpoint:** `GET /api/admin/analytics/user-growth`

**Query Parameters:**
- `range` (optional) - Time range (default: `30d`)
  - Format: `7d`, `30d`, `90d`, `6m`, `1y`

**Response:**
```json
{
  "historical": [
    {
      "date": "2025-10-01",
      "new_users": 15,
      "total_users": 500,
      "active_users": 320,
      "retention_rate": 64.0
    }
  ],
  "projections": [
    {
      "date": "2025-11-01",
      "total_users": 550,
      "projected": true
    }
  ],
  "metrics": {
    "total_users": 500,
    "new_users_today": 8,
    "active_users_today": 285,
    "retention_rate": 57.0,
    "growth_rate": "12.5%",
    "growth_rate_mom": "8.3%"
  }
}
```

---

### Get Platform Health

Retrieve real-time platform health metrics.

**Endpoint:** `GET /api/admin/analytics/platform-health`

**Response:**
```json
{
  "status": "healthy",
  "uptime": "99.98%",
  "metrics": {
    "active_sessions": 147,
    "events_today": 12483,
    "api_response_time_ms": 125,
    "error_rate_percent": 0.12,
    "storage_used_gb": 2.5,
    "storage_capacity_gb": 10.0,
    "storage_usage_percent": "25.0"
  },
  "alerts": [],
  "timestamp": "2025-10-31T10:30:00Z"
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Performance issues detected
- `down` - Critical systems offline

**Alert Structure:**
```json
{
  "level": "warning",
  "message": "API response time is elevated",
  "metric": "response_time",
  "value": 1250
}
```

---

### Get Device Analytics

Retrieve device and browser distribution data.

**Endpoint:** `GET /api/admin/analytics/device-analytics`

**Response:**
```json
{
  "device_breakdown": [
    {
      "device_type": "desktop",
      "user_count": 285,
      "event_count": 15842
    },
    {
      "device_type": "mobile",
      "user_count": 178,
      "event_count": 8947
    },
    {
      "device_type": "tablet",
      "user_count": 37,
      "event_count": 1256
    }
  ],
  "browser_breakdown": [
    {
      "browser": "Chrome",
      "user_count": 320,
      "event_count": 18456
    },
    {
      "browser": "Safari",
      "user_count": 95,
      "event_count": 5234
    }
  ],
  "os_breakdown": [
    {
      "os": "Windows",
      "user_count": 210,
      "event_count": 12347
    }
  ],
  "engagement_by_device": [
    {
      "device_type": "desktop",
      "avg_session_duration": 1847,
      "completion_rate": 78.5
    }
  ]
}
```

---

### Get Geographic Distribution

Retrieve user distribution by location.

**Endpoint:** `GET /api/admin/analytics/geographic`

**Query Parameters:**
- `groupBy` (optional) - Grouping level: `country`, `region`, `city` (default: `country`)

**Response:**
```json
{
  "data": [
    {
      "country": "United States",
      "user_count": 285,
      "session_count": 1847,
      "total_events": 18947,
      "regions": 42
    },
    {
      "country": "United Kingdom",
      "user_count": 78,
      "session_count": 456,
      "total_events": 5234,
      "regions": 15
    }
  ],
  "total_countries": 35,
  "total_users": 500,
  "groupBy": "country"
}
```

**Region Grouping Response:**
```json
{
  "data": [
    {
      "country": "United States",
      "region": "California",
      "user_count": 95,
      "session_count": 687,
      "total_events": 7234,
      "cities": 12
    }
  ]
}
```

---

## Error Responses

All endpoints use standard HTTP status codes:

**400 Bad Request**
```json
{
  "error": "Missing required parameter: cohortId"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "timestamp": "2025-10-31T10:30:00Z"
}
```

---

## Client Libraries

### JavaScript/TypeScript

```typescript
import { clientTracker } from '@/lib/analytics/tracker';

// Track video play
await clientTracker.trackVideoPlay(lessonId, courseId);

// Track custom event
await clientTracker.track('custom_event', {
  metadata: { key: 'value' }
});

// Fetch engagement heatmap
const response = await fetch('/api/analytics/engagement-heatmap?cohortId=5');
const data = await response.json();
```

### Python

```python
import requests

# Track event
response = requests.post(
    'https://yourdomain.com/api/analytics/track',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'event_type': 'video_play',
        'course_id': 1,
        'lesson_id': 42
    }
)

# Fetch dropout predictions
response = requests.get(
    'https://yourdomain.com/api/analytics/dropout-predictions',
    headers={'Authorization': f'Bearer {token}'},
    params={'cohortId': 5, 'courseId': 1}
)
data = response.json()
```

---

## Webhooks

Coming soon! Subscribe to analytics events:
- Student at-risk threshold crossed
- Cohort completion milestone reached
- Unusual activity detected
- Daily/weekly summary reports

---

## SDKs

Official SDKs planned for:
- JavaScript/TypeScript
- Python
- Ruby
- PHP
- Java
- Go

---

## Support

**Documentation:** https://docs.c4ccampus.org/analytics
**API Status:** https://status.c4ccampus.org
**Support:** support@c4ccampus.org

---

**Version:** 1.0.0
**Last Updated:** 2025-10-31
