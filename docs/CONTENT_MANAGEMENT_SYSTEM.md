# Content Management System - Complete Documentation

## Overview

The C4C Campus Content Management System (CMS) is a comprehensive platform for creating, organizing, and optimizing educational content. It provides teachers and administrators with powerful tools to manage courses 10x faster.

## Features

### 1. Bulk Lesson Upload (CSV Import)

Import multiple lessons at once using CSV files, saving hours of manual data entry.

#### CSV Format

```csv
module_id,name,slug,video_path,youtube_url,video_duration_seconds,text_content,order_index,resources
1,Introduction to AI,intro-to-ai,videos/ai-intro.mp4,,600,Welcome to AI basics,1,"[{""name"":""slides.pdf"",""path"":""resources/slides.pdf""}]"
```

#### API Endpoint

**POST** `/api/content/bulk-upload`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "csvData": [
    {
      "module_id": "1",
      "name": "Introduction to AI",
      "slug": "intro-to-ai",
      "video_path": "videos/ai-intro.mp4",
      "order_index": "1"
    }
  ],
  "courseId": 123
}
```

**Response:**
```json
{
  "success": true,
  "bulkOperationId": 456,
  "results": {
    "total": 10,
    "successful": 9,
    "failed": 1,
    "lessons": [...],
    "errors": ["Row 5: Module not found"]
  }
}
```

#### Usage Example

```typescript
// Parse CSV file
const csvData = parseCSV(fileContent);

// Upload lessons
const response = await fetch('/api/content/bulk-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ csvData, courseId: 123 })
});

const result = await response.json();
console.log(`Uploaded ${result.results.successful} lessons`);
```

---

### 2. Course Cloning

Duplicate entire courses including all modules and lessons with one click.

#### API Endpoint

**POST** `/api/content/clone-course`

**Request Body:**
```json
{
  "sourceCourseId": 123,
  "newName": "Advanced AI Course",
  "newSlug": "advanced-ai-course",
  "includeContent": true,
  "customizations": {
    "description": "Updated description",
    "track": "ai-safety",
    "difficulty": "advanced",
    "published": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "course": {
    "id": 456,
    "name": "Advanced AI Course",
    "modules": [...]
  },
  "stats": {
    "modulesCloned": 5,
    "sourceCourseId": 123
  }
}
```

#### Features

- **Full Clone**: Copies all modules, lessons, and structure
- **Partial Clone**: Option to exclude video content/text
- **Customization**: Modify course metadata during cloning
- **Tracking**: Records clone relationships for auditing

---

### 3. Content Versioning & Rollback

Track all changes to your content and rollback to any previous version.

#### Create Version

**POST** `/api/content/versions`

```json
{
  "contentType": "course",
  "contentId": 123,
  "changeSummary": "Updated course structure"
}
```

#### List Versions

**GET** `/api/content/versions?type=course&id=123`

**Response:**
```json
{
  "success": true,
  "versions": [
    {
      "id": 1,
      "version_number": 3,
      "change_summary": "Updated course structure",
      "created_at": "2025-10-31T10:00:00Z",
      "created_by": "user-id"
    }
  ]
}
```

#### Rollback

**PUT** `/api/content/versions`

```json
{
  "versionId": 1
}
```

#### Features

- **Automatic Versioning**: Create snapshots before major changes
- **Version Tags**: Mark important versions (v1.0, stable, etc.)
- **Full Rollback**: Restore content to any previous state
- **Audit Trail**: Complete history of changes

---

### 4. A/B Testing for Lessons

Test different lesson variations to optimize learning outcomes.

#### Create Experiment

**POST** `/api/content/ab-testing`

```json
{
  "name": "Video vs Text Introduction",
  "description": "Test if video or text works better for introductions",
  "lessonId": 123,
  "variantBData": {
    "name": "Introduction (Text Only)",
    "text_content": "Alternative text-based content..."
  },
  "trafficSplit": 50,
  "primaryMetric": "completion_rate",
  "successThreshold": 5.0
}
```

#### Get Results

**GET** `/api/content/ab-testing?experimentId=456`

**Response:**
```json
{
  "success": true,
  "experiment": {...},
  "stats": {
    "variantA": {
      "participants": 100,
      "completionRate": 0.85,
      "avgTimeSpent": 450,
      "avgEngagement": 8.2
    },
    "variantB": {
      "participants": 98,
      "completionRate": 0.90,
      "avgTimeSpent": 420,
      "avgEngagement": 8.7
    }
  }
}
```

#### Control Experiment

**PUT** `/api/content/ab-testing`

```json
{
  "experimentId": 456,
  "action": "start" // or "pause", "complete", "cancel"
}
```

#### Features

- **Traffic Splitting**: Control percentage of users seeing each variant
- **Multiple Metrics**: Track completion, engagement, time spent
- **Statistical Significance**: Built-in analysis tools
- **Auto-Assignment**: Users automatically assigned to variants

---

### 5. Template Library

Create and reuse course templates for faster content creation.

#### List Templates

**GET** `/api/content/templates?type=course&category=programming`

#### Create Template

**POST** `/api/content/templates`

```json
{
  "type": "course",
  "sourceId": 123,
  "name": "Introduction Course Template",
  "description": "Standard template for intro courses",
  "category": "programming",
  "isPublic": true
}
```

#### Apply Template

**POST** `/api/content/templates`

```json
{
  "applyTemplateId": 456,
  "parentId": 789 // Optional: courseId for modules, moduleId for lessons
}
```

#### Features

- **Course Templates**: Full course structures with modules and lessons
- **Module Templates**: Reusable module patterns
- **Lesson Templates**: Standard lesson formats
- **Public Sharing**: Share templates with other teachers
- **Usage Tracking**: See most popular templates

---

### 6. Media Library

Centralized management for all media assets.

#### Upload Media

**POST** `/api/content/media`

```json
{
  "fileName": "course-intro.mp4",
  "filePath": "media/videos/course-intro.mp4",
  "fileType": "video",
  "mimeType": "video/mp4",
  "fileSizeBytes": 10485760,
  "folder": "/videos",
  "tags": ["introduction", "ai", "beginner"],
  "altText": "Course introduction video",
  "width": 1920,
  "height": 1080,
  "duration": 300
}
```

#### Search Media

**GET** `/api/content/media?type=image&search=intro&tags=ai,beginner&page=1&limit=20`

#### Update Metadata

**PUT** `/api/content/media`

```json
{
  "mediaId": 123,
  "tags": ["updated", "tags"],
  "caption": "New caption"
}
```

#### Delete Media

**DELETE** `/api/content/media?id=123`

#### Features

- **Multiple File Types**: Images, videos, documents, audio
- **Organization**: Virtual folders and tagging
- **Search**: Full-text search across names, captions, tags
- **Usage Tracking**: See where media is used
- **Access Control**: RLS policies for security

---

### 7. Drag-and-Drop Reordering

Easily reorganize modules and lessons with drag-and-drop.

#### Reorder API

**POST** `/api/content/reorder`

```json
{
  "type": "modules",
  "parentId": 123, // courseId for modules, moduleId for lessons
  "newOrder": [5, 2, 1, 3, 4] // Array of IDs in new order
}
```

#### Features

- **Intuitive UI**: Drag and drop interface
- **Bulk Reordering**: Move multiple items at once
- **History Tracking**: Audit trail of reordering changes
- **Auto-Save**: Changes saved immediately

---

## Content Management Dashboard

Access the full content management interface at `/teacher/content-manager`

### Dashboard Features

1. **Quick Actions Panel**
   - Bulk Upload
   - Clone Course
   - Templates
   - Media Library

2. **Tabbed Interface**
   - Courses: Manage all courses
   - Versions: View and rollback content
   - A/B Tests: Create and monitor experiments
   - Media: Browse media library
   - Templates: Apply pre-built templates

3. **Course Management**
   - List all courses
   - Edit course details
   - Clone courses
   - View version history
   - Drag-and-drop reordering

---

## Database Schema

The CMS extends the existing schema with these new tables:

### Content Versioning
- `content_versions`: Historical versions of content
- `version_tags`: Named tags for important versions

### Templates
- `course_templates`: Reusable course structures
- `module_templates`: Reusable module patterns
- `lesson_templates`: Standard lesson formats

### Media Library
- `media_library`: All media assets with metadata
- `media_collections`: Organized media collections
- `media_collection_items`: Items in collections

### A/B Testing
- `ab_experiments`: Test configurations
- `ab_variants`: Lesson variations
- `ab_assignments`: User-to-variant assignments
- `ab_results`: Experiment metrics

### Operations
- `bulk_operations`: Track bulk import jobs
- `course_clones`: Clone relationships
- `reorder_history`: Audit trail for reordering

---

## Setup Instructions

### 1. Apply Database Schema

```bash
psql -h <host> -U <user> -d <database> -f schema-content-management.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `schema-content-management.sql`
3. Click "Run"

### 2. Configure Storage Buckets

Create storage buckets in Supabase:

- **media**: For all media assets
  - Max file size: 100MB
  - Allowed types: images, videos, documents, audio

### 3. Environment Variables

Already configured in existing `.env` file:
```
PUBLIC_SUPABASE_URL=your-url
PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

---

## Security

All APIs implement:

- **Authentication**: JWT token verification
- **Authorization**: RLS policies ensure users only access their content
- **Validation**: Input validation on all endpoints
- **Rate Limiting**: Protection against abuse
- **Audit Trails**: All changes tracked with user ID and timestamp

### Row Level Security

Teachers can:
- Create, read, update, delete their own content
- View published content from others
- Apply public templates

Students can:
- View published content
- Cannot modify content

---

## Performance Optimizations

1. **Indexes**: All foreign keys and common query fields indexed
2. **Materialized Views**: Pre-aggregated data for dashboards
3. **Pagination**: All list endpoints support pagination
4. **Caching**: Media library responses cached
5. **Lazy Loading**: Content loaded on-demand

---

## API Quick Reference

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Bulk Upload | `/api/content/bulk-upload` | POST | Import lessons from CSV |
| Clone Course | `/api/content/clone-course` | POST | Duplicate entire course |
| List Versions | `/api/content/versions` | GET | View version history |
| Create Version | `/api/content/versions` | POST | Save current state |
| Rollback | `/api/content/versions` | PUT | Restore previous version |
| Create A/B Test | `/api/content/ab-testing` | POST | Start new experiment |
| Get Results | `/api/content/ab-testing` | GET | View experiment data |
| Control Test | `/api/content/ab-testing` | PUT | Start/stop/complete |
| List Templates | `/api/content/templates` | GET | Browse templates |
| Create Template | `/api/content/templates` | POST | Save as template |
| Apply Template | `/api/content/templates` | POST | Use template |
| List Media | `/api/content/media` | GET | Search media library |
| Upload Media | `/api/content/media` | POST | Add new media |
| Update Media | `/api/content/media` | PUT | Edit metadata |
| Delete Media | `/api/content/media` | DELETE | Remove media |
| Reorder Content | `/api/content/reorder` | POST | Change order |

---

## Testing

### Manual Testing Checklist

- [ ] Upload CSV with 10+ lessons
- [ ] Clone a course with 5+ modules
- [ ] Create version and rollback
- [ ] Start A/B test and view results
- [ ] Create and apply template
- [ ] Upload media and search
- [ ] Reorder modules via drag-drop
- [ ] Test all dashboard tabs

### API Testing

```bash
# Test bulk upload
curl -X POST http://localhost:4321/api/content/bulk-upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"csvData": [...], "courseId": 123}'

# Test course cloning
curl -X POST http://localhost:4321/api/content/clone-course \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceCourseId": 123, "newName": "Clone", "newSlug": "clone-123"}'
```

---

## Troubleshooting

### Common Issues

**CSV Import Fails**
- Check CSV format matches specification
- Verify module IDs exist
- Ensure user has permission for target course

**Clone Course Fails**
- Verify source course exists and is accessible
- Check slug doesn't already exist
- Ensure sufficient permissions

**Version Rollback Fails**
- Verify version ID is valid
- Check user owns the content
- Ensure content hasn't been deleted

**A/B Test Not Working**
- Verify lesson exists
- Check experiment status is "running"
- Ensure traffic split is valid (0-100)

### Debug Mode

Enable detailed logging:
```typescript
const DEBUG = true;
if (DEBUG) console.log('API call:', endpoint, data);
```

---

## Roadmap

### Planned Features

- [ ] **Collaborative Editing**: Multiple teachers editing simultaneously
- [ ] **Content Analytics**: Track which content performs best
- [ ] **AI Suggestions**: AI-powered content recommendations
- [ ] **Automated Testing**: Auto-create A/B tests for new content
- [ ] **Advanced Search**: Full-text search across all content
- [ ] **Content Scheduling**: Schedule content publication
- [ ] **Batch Operations**: Edit multiple items at once
- [ ] **Export/Import**: Export courses as packages

---

## Support

For issues or questions:
- Check this documentation
- Review API responses for error messages
- Check browser console for client-side errors
- Review database logs for server-side errors

---

## Changelog

### Version 1.0.0 (2025-10-31)

**Initial Release**
- Bulk lesson upload via CSV
- Course cloning with full module/lesson duplication
- Content versioning with rollback
- A/B testing framework
- Template library system
- Media management library
- Drag-and-drop reordering
- Comprehensive content management dashboard

---

**Content management is now 10x faster!** 🚀
