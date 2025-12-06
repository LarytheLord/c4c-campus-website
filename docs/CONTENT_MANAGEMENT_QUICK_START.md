# Content Management System - Quick Start Guide

## 5-Minute Setup

### Step 1: Apply Database Schema (2 min)

```bash
# Via Supabase CLI
supabase db push schema-content-management.sql

# Or via Dashboard
# 1. Go to SQL Editor
# 2. Paste schema-content-management.sql
# 3. Click Run
```

### Step 2: Access Dashboard (1 min)

Navigate to: `https://your-domain.com/teacher/content-manager`

### Step 3: Try a Quick Action (2 min)

Choose any quick action:
- 📤 Bulk Upload lessons
- 📋 Clone an existing course
- 📚 Apply a template
- 🖼️ Upload media

---

## Common Workflows

### Workflow 1: Create Course from Template (30 seconds)

1. Go to **Templates** tab
2. Click on a course template
3. Template creates new course automatically
4. Edit course name and publish

**API Version:**
```typescript
const response = await fetch('/api/content/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    applyTemplateId: 123
  })
});
```

---

### Workflow 2: Bulk Import 50 Lessons (2 minutes)

1. Prepare CSV file:
```csv
module_id,name,slug,video_path,youtube_url,video_duration_seconds,text_content,order_index
1,Lesson 1,lesson-1,,,600,Content here,1
1,Lesson 2,lesson-2,,,600,Content here,2
```

2. Click **Bulk Upload** action
3. Select CSV file
4. Click Upload

**Result:** 50 lessons imported in seconds instead of hours!

---

### Workflow 3: Clone and Customize Course (1 minute)

1. Find course to clone
2. Click **Clone** button
3. Enter new name: "Advanced Version"
4. Choose customizations:
   - ✓ Include content
   - Track: Advanced
   - Published: No
5. Click Clone

**Use Case:** Create semester-specific versions of courses

---

### Workflow 4: A/B Test Lesson Format (5 minutes setup)

1. Go to **A/B Tests** tab
2. Click **Create A/B Test**
3. Configure:
   - Name: "Video vs Interactive"
   - Lesson: Select lesson
   - Variant B: Upload alternative version
   - Traffic Split: 50/50
   - Metric: Completion Rate
4. Click **Start Experiment**

**After 100+ students:** View results showing which version performs better!

---

### Workflow 5: Organize Media Assets (2 minutes)

1. Go to **Media** tab
2. Upload multiple files:
   - Drag and drop 10-20 files
   - Auto-extracts metadata
3. Add tags for easy search:
   - "ai", "beginner", "video"
4. Organize into folders:
   - /videos/introductions
   - /images/diagrams

**Use Case:** Quick access to any media across all courses

---

### Workflow 6: Version Control and Rollback (30 seconds)

Before making major changes:

1. Go to **Versions** tab
2. Select course
3. Click **Create Version** (takes snapshot)
4. Make your changes

If something breaks:
1. Go back to **Versions** tab
2. Find previous version
3. Click **Rollback**
4. Content restored instantly!

---

## CSV Import Templates

### Basic Lesson Import

```csv
module_id,name,slug,order_index
1,Introduction,intro,1
1,Getting Started,getting-started,2
1,First Steps,first-steps,3
```

### Full Lesson Import with Videos

```csv
module_id,name,slug,video_path,youtube_url,video_duration_seconds,text_content,order_index
1,Intro to AI,intro-ai,videos/intro.mp4,,600,Welcome to AI,1
1,AI Basics,ai-basics,,https://youtube.com/watch?v=xxx,900,Learn the basics,2
```

### With Resources

```csv
module_id,name,slug,text_content,order_index,resources
1,Lesson 1,lesson-1,Content,1,"[{""name"":""slides.pdf"",""path"":""res/slides.pdf""}]"
```

---

## API Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Get auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// 1. Bulk Upload
const uploadLessons = async (csvData, courseId) => {
  const response = await fetch('/api/content/bulk-upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ csvData, courseId })
  });
  return response.json();
};

// 2. Clone Course
const cloneCourse = async (sourceCourseId, newName, newSlug) => {
  const response = await fetch('/api/content/clone-course', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sourceCourseId,
      newName,
      newSlug,
      includeContent: true
    })
  });
  return response.json();
};

// 3. Create Version
const createVersion = async (contentType, contentId, summary) => {
  const response = await fetch('/api/content/versions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType,
      contentId,
      changeSummary: summary
    })
  });
  return response.json();
};

// 4. Start A/B Test
const startABTest = async (lessonId, variantBData) => {
  const response = await fetch('/api/content/ab-testing', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My A/B Test',
      lessonId,
      variantBData,
      trafficSplit: 50,
      primaryMetric: 'completion_rate'
    })
  });
  return response.json();
};

// 5. Upload Media
const registerMedia = async (fileInfo) => {
  const response = await fetch('/api/content/media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fileInfo)
  });
  return response.json();
};

// Usage
await uploadLessons(csvData, 123);
await cloneCourse(123, 'New Course', 'new-course');
await createVersion('course', 123, 'Major update');
await startABTest(456, alternativeContent);
await registerMedia({
  fileName: 'video.mp4',
  filePath: 'media/video.mp4',
  fileType: 'video',
  mimeType: 'video/mp4',
  fileSizeBytes: 10485760
});
```

### Python

```python
import requests
import json

class ContentManager:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def bulk_upload(self, csv_data, course_id):
        response = requests.post(
            f'{self.base_url}/api/content/bulk-upload',
            headers=self.headers,
            json={'csvData': csv_data, 'courseId': course_id}
        )
        return response.json()

    def clone_course(self, source_id, new_name, new_slug):
        response = requests.post(
            f'{self.base_url}/api/content/clone-course',
            headers=self.headers,
            json={
                'sourceCourseId': source_id,
                'newName': new_name,
                'newSlug': new_slug,
                'includeContent': True
            }
        )
        return response.json()

    def create_version(self, content_type, content_id, summary):
        response = requests.post(
            f'{self.base_url}/api/content/versions',
            headers=self.headers,
            json={
                'contentType': content_type,
                'contentId': content_id,
                'changeSummary': summary
            }
        )
        return response.json()

# Usage
cm = ContentManager('https://your-domain.com', 'your-token')
result = cm.bulk_upload(csv_data, 123)
print(f"Uploaded {result['results']['successful']} lessons")
```

---

## Tips & Tricks

### 1. Speed Up Content Creation

**Create a template once, reuse forever:**
```typescript
// Create template from your best course
await createTemplate(courseId, 'My Best Course Template');

// Apply it 10 times for different cohorts
for (let i = 1; i <= 10; i++) {
  await applyTemplate(templateId, `Cohort ${i} Course`);
}
```

### 2. Bulk Operations

**Update 100 lessons at once:**
1. Export to CSV
2. Edit in spreadsheet
3. Re-import via bulk upload
4. Old lessons updated automatically

### 3. Safe Experimentation

**Always create a version before major changes:**
```typescript
// Before making changes
await createVersion('course', courseId, 'Before restructure');

// Make changes...

// If something goes wrong
await rollbackToVersion(versionId);
```

### 4. A/B Test Everything

Test different approaches:
- Video vs Text lessons
- Short vs Long content
- Interactive vs Passive
- Different explanation styles

**Track what works best for your students!**

### 5. Media Management

**Tag everything for easy finding:**
```typescript
await updateMedia(mediaId, {
  tags: ['introduction', 'video', 'ai', 'beginner', 'short'],
  caption: 'Quick intro to AI concepts'
});

// Later: Find all intro videos instantly
const results = await searchMedia({ tags: 'introduction,video' });
```

---

## Performance Tips

### 1. Batch Operations

Instead of:
```typescript
// Slow: 100 API calls
for (const lesson of lessons) {
  await createLesson(lesson);
}
```

Do this:
```typescript
// Fast: 1 API call
await bulkUpload(lessons, courseId);
```

### 2. Use Templates

Creating 5 similar courses?
- Create one perfectly
- Save as template
- Apply 4 more times
- **Saves hours!**

### 3. Clone Instead of Recreate

Don't rebuild courses from scratch:
```typescript
// Clone and customize
const clone = await cloneCourse(originalId, 'New Version', 'new-version');
// Then modify only what's different
```

---

## Keyboard Shortcuts (Dashboard)

- `Ctrl + N` - New course
- `Ctrl + U` - Bulk upload
- `Ctrl + K` - Clone selected course
- `Ctrl + S` - Save changes
- `Ctrl + Z` - Undo (uses versioning)
- `Ctrl + /` - Search media

---

## Troubleshooting One-Liners

**CSV import fails:**
```bash
# Validate CSV format
head -1 your-file.csv
# Should match: module_id,name,slug,order_index
```

**Can't clone course:**
```typescript
// Check if you own the course
const course = await supabase
  .from('courses')
  .select('created_by')
  .eq('id', courseId)
  .single();
console.log('Owner:', course.created_by);
```

**Version not showing:**
```typescript
// List all versions
const versions = await fetch(`/api/content/versions?type=course&id=${courseId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
console.log(await versions.json());
```

---

## Next Steps

1. **Start Simple**: Try bulk upload with 5-10 lessons
2. **Clone a Course**: Duplicate your first course
3. **Create Template**: Save your best structure
4. **A/B Test**: Try one experiment
5. **Organize Media**: Upload and tag 10 files

**Then scale up to managing hundreds of lessons effortlessly!**

---

## Get Help

- **Documentation**: `/docs/CONTENT_MANAGEMENT_SYSTEM.md`
- **API Reference**: See main docs for all endpoints
- **Examples**: Check `/src/pages/api/content/` for implementation

**Ready to manage content 10x faster!** 🚀
