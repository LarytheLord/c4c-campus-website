# Page Structure Reference Guide

Quick visual reference for the current teacher/admin UI structure and consolidation plan.

## Current Architecture

```
C4C Campus Platform
│
├── Teacher Dashboard (/teacher)
│   ├── Header [REUSABLE]
│   │   ├── Logo + Title
│   │   ├── Nav Links (Admin, Courses)
│   │   └── Logout
│   ├── Stats Grid [REUSABLE]
│   │   ├── My Courses
│   │   ├── Published
│   │   ├── Total Students
│   │   └── Drafts
│   ├── Course Grid
│   │   └── Course Card (Multiple)
│   │       ├── Title + Status Badge
│   │       ├── Description
│   │       ├── Meta (Track, Difficulty)
│   │       └── Actions (Manage, Edit, Delete)
│   └── Create/Edit Course Modal [REUSABLE]
│       ├── Course Name
│       ├── Description
│       ├── Track
│       ├── Difficulty
│       ├── Hours
│       ├── Slug
│       ├── Published Toggle
│       └── Actions (Save, Cancel)
│
├── Admin Dashboard (/admin)
│   ├── Header [REUSABLE] (variant: admin)
│   │   ├── Logo + Title
│   │   ├── Nav Links (Courses)
│   │   └── Logout
│   ├── Stats Grid [REUSABLE]
│   │   ├── Pending
│   │   ├── Approved
│   │   ├── Rejected
│   │   └── Total
│   ├── Filter Section [REUSABLE]
│   │   ├── Status Dropdown
│   │   ├── Program Dropdown
│   │   └── Refresh Button
│   ├── Applications Table [REUSABLE]
│   │   ├── Header Row
│   │   ├── Data Rows
│   │   │   ├── Name
│   │   │   ├── Email
│   │   │   ├── Program
│   │   │   ├── Status Badge
│   │   │   ├── Applied Date
│   │   │   ├── n8n Status
│   │   │   └── View Action
│   │   └── Empty State [REUSABLE]
│   └── Detail Modal [REUSABLE]
│       ├── Application Info
│       ├── Contact Details
│       ├── Program-specific Fields
│       ├── Status Display
│       └── Actions (Approve, Reject)
│
├── Student Dashboard (/dashboard)
│   ├── Header [REUSABLE] (variant: student)
│   │   ├── Logo + Title
│   │   ├── Language Selector
│   │   └── Logout
│   ├── Welcome Card
│   ├── My Courses Section
│   │   ├── Loading State [REUSABLE]
│   │   ├── Course List
│   │   │   └── Course Item (Enrolled)
│   │   └── Empty State [REUSABLE]
│   ├── Stats Grid [REUSABLE]
│   │   ├── Enrolled Courses
│   │   ├── Completed
│   │   └── Total Hours
│   └── Workflows Section (n8n)
│       ├── Loading State [REUSABLE]
│       ├── Workflows List
│       │   └── Workflow Item
│       └── Empty State [REUSABLE]
│
├── Browse Courses (/courses)
│   ├── Header [REUSABLE] (variant: student)
│   │   ├── Logo + Title
│   │   ├── Language Selector
│   │   └── Logout
│   ├── Tab Filters [REUSABLE]
│   │   ├── All Courses
│   │   ├── My Courses
│   │   └── Available
│   ├── Track Filters [REUSABLE]
│   │   ├── All Tracks (Chip)
│   │   ├── Animal Advocacy
│   │   ├── Climate
│   │   ├── AI Safety
│   │   └── General
│   ├── Loading State [REUSABLE]
│   ├── Course Grid
│   │   └── Course Card (Published)
│   │       ├── Thumbnail
│   │       ├── Title
│   │       ├── Description
│   │       ├── Meta
│   │       ├── Enrollment Badge
│   │       └── Enroll Button
│   └── Empty State [REUSABLE]
│
└── Course Detail (/courses/[slug])
    ├── Header [REUSABLE]
    │   ├── Logo + Course Title
    │   ├── Breadcrumb
    │   ├── Back to Courses
    │   └── Logout
    ├── Course Info Card
    │   ├── Course Title + Meta
    │   ├── Description
    │   └── Teacher Actions [conditional]
    ├── Modules Section
    │   ├── Module List
    │   │   └── Module (Multiple)
    │   │       ├── Module Title + Order
    │   │       ├── Description
    │   │       ├── Lessons List
    │   │       │   └── Lesson Item
    │   │       │       ├── Title + Order
    │   │       │       ├── Duration
    │   │       │       └── Teacher Actions [conditional]
    │   │       └── Teacher Actions [conditional]
    │   └── Empty State [REUSABLE]
    ├── Add Module Modal [REUSABLE]
    │   ├── Module Name
    │   ├── Description
    │   ├── Order
    │   └── Actions
    └── Add Lesson Modal [REUSABLE]
        ├── Lesson Name
        ├── Slug
        ├── Video Type (YouTube/Upload)
        ├── Video URL/Path
        ├── Duration
        ├── Content (Markdown)
        ├── Order
        └── Actions
```

## Reusable Components Summary

### Level 1: Highest Priority (Extract First)

```
DashboardHeader.astro
├── Props
│   ├── title: string
│   ├── subtitle?: string
│   ├── variant?: 'teacher' | 'admin' | 'student'
│   └── navItems?: NavItem[]
└── Slots
    └── rightContent?: Slot (for language selector, etc)

Currently Used In: 5 pages (teacher, admin, dashboard, courses, courses/[slug])
Estimated LOC Saved: 250
```

```
StatsGrid.astro
├── Props
│   └── stats: Array<{
│       ├── id: string
│       ├── icon: string
│       ├── label: string
│       ├── value: string|number
│       ├── color?: 'primary' | 'success' | 'warning' | 'error'
│       └── loading?: boolean
│       }>
└── Responsive: 1 col mobile, 4 cols desktop

Currently Used In: 3 pages, 12+ instances
Estimated LOC Saved: 150
```

```
Modal.astro
├── Props
│   ├── id: string
│   ├── maxWidth?: string (default: '2xl')
│   ├── closeOnBackdrop?: boolean
│   └── title?: string
└── Slots
    ├── header: Slot
    ├── content/default: Slot
    └── footer: Slot

Currently Used In: 4+ modals
Estimated LOC Saved: 120
```

```
EmptyState.astro
├── Props
│   ├── icon: string (emoji or icon)
│   ├── title: string
│   ├── description: string
│   └── action?: {
│       ├── text: string
│       └── onClick: () => void
│       }
└── Optional: Custom slot

Currently Used In: 5+ sections
Estimated LOC Saved: 100
```

```
LoadingSpinner.astro
├── Props
│   ├── label?: string
│   └── size?: 'sm' | 'md' | 'lg'
└── Renders: Centered spinner with optional text

Currently Used In: 8+ instances
Estimated LOC Saved: 80
```

### Level 2: Medium Priority (Extract Second)

```
FilterCard.astro
├── Props
│   ├── filters: Array<{
│       ├── id: string
│       ├── label: string
│       ├── type: 'dropdown' | 'chips'
│       ├── options: Array<string|{value, label}>
│       └── onChange: (value) => void
│       }>
│   └── onRefresh?: () => void
└── Handles: Filter state and events

Currently Used In: admin.astro, courses.astro
Estimated LOC Saved: 80
```

```
DataTable.astro
├── Props
│   ├── columns: Array<{
│       ├── key: string
│       ├── label: string
│       ├── render?: (value, row) => HTML
│       └── class?: string
│       }>
│   ├── rows: Array<object>
│   ├── onRowClick?: (row) => void
│   └── emptyMessage?: string
└── Features: Hover effects, status badges, actions

Currently Used In: admin.astro (1)
Reusable For: Future lists, reports
Estimated LOC Saved: 100+
```

### Level 3: Utility Functions (Extract Third)

```
dashboard-utils.ts
├── initializeDashboard(userRole, options)
├── setupModalHandling(modalId, options)
├── setupFilterListeners(selector, callback)
├── setupLogoutButton(buttonId, redirectTo)
└── validateUserAccess(requiredRole)

Replaces: Similar code in 5 pages
Estimated LOC Saved: 150
```

```
dashboard-client.ts (DashboardClient class)
├── Teacher Methods
│   ├── getCourses(userId, filter?)
│   ├── createCourse(data)
│   ├── updateCourse(id, data)
│   └── deleteCourse(id)
├── Admin Methods
│   ├── getApplications(filters?)
│   ├── approveApplication(id)
│   └── rejectApplication(id)
├── Student Methods
│   ├── getEnrollments(userId)
│   └── getWorkflows(userId)
└── Shared
    └── logout()

Centralizes: All dashboard API calls
Estimated LOC Saved: 200+
```

## File Structure After Consolidation

```
src/
├── components/
│   ├── shared/
│   │   ├── DashboardHeader.astro [NEW]
│   │   ├── StatsGrid.astro [NEW]
│   │   ├── Modal.astro [NEW]
│   │   ├── EmptyState.astro [NEW]
│   │   ├── LoadingSpinner.astro [NEW]
│   │   ├── FilterCard.astro [NEW]
│   │   └── DataTable.astro [NEW]
│   └── course/
│       ├── CourseCard.astro [MIGRATED]
│       ├── ProgressBar.tsx
│       ├── VideoPlayer.tsx
│       ├── LessonNav.tsx
│       └── CourseBuilder.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   ├── api-handlers.ts
│   ├── dashboard-utils.ts [NEW]
│   ├── dashboard-client.ts [NEW]
│   └── queries.ts [NEW]
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── teacher.astro [UPDATED]
│   ├── admin.astro [UPDATED]
│   ├── dashboard.astro [UPDATED]
│   ├── dashboard-consolidated.astro [NEW, FUTURE]
│   ├── courses.astro [UPDATED]
│   ├── courses/
│   │   └── [slug].astro [UPDATED]
│   └── api/
│       ├── apply.ts
│       ├── enroll.ts
│       ├── create-n8n-user.ts
│       ├── n8n-workflows.ts
│       └── ...
└── types/
    └── index.ts
```

## Migration Path

### Phase 1: Component Extraction (No Breaking Changes)
```
teacher.astro (475 LOC) ──┐
admin.astro (460 LOC)     ├──> Use shared components
dashboard.astro (477 LOC) │    (add new imports)
courses.astro (475 LOC)   │
courses/[slug].astro      └────────────────────────
(687 LOC)
                           ↓
Result: 30% LOC reduction per page (avg 130 lines saved)
Shipping: Day 1, zero user impact
```

### Phase 2: Utility Extraction (Low Risk)
```
Pages ──────────────────────> Extract common functions
(event handlers, modal logic)      to dashboard-utils.ts
(auth checks)                       & dashboard-client.ts
                           ↓
Result: 150+ more LOC saved, better testing
Shipping: Day 2-3, verified with tests
```

### Phase 3: Unified Dashboard (High Value)
```
Create consolidated dashboard with role-based tabs
├── Teacher Tab (course management)
├── Admin Tab (application review)
└── Student Tab (enrollments + workflows)

Shipping: Behind feature flag, gradual rollout
Old pages remain as fallback for 1-2 months
```

## Code Examples

### Before: Duplicate Header (50 LOC × 5 pages)
```astro
<!-- teacher.astro -->
<div class="sticky top-0 z-50 bg-surface border-b border-border">
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 flex-1">
        <a href="/teacher" class="flex-shrink-0">
          <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg" />
        </a>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Teacher Dashboard</h1>
          <p class="text-text-muted text-sm" id="welcome-text">Welcome back!</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <a href="/admin" class="hidden sm:block btn btn-ghost btn-sm">Applications</a>
        <a href="/courses" class="hidden sm:block btn btn-ghost btn-sm">Browse Courses</a>
        <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button>
      </div>
    </div>
  </div>
</div>

<!-- Repeated in admin.astro, dashboard.astro, courses.astro, courses/[slug].astro with minor changes -->
```

### After: Reusable Component (10 LOC × 5 pages)
```astro
<!-- DashboardHeader.astro -->
<header class="sticky top-0 z-50 bg-surface border-b border-border">
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 flex-1">
        <a href={homeLink} class="flex-shrink-0">
          <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg" />
        </a>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">{title}</h1>
          <p class="text-text-muted text-sm" id="welcome-text">{subtitle}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <slot name="rightContent" />
        <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button>
      </div>
    </div>
  </div>
</header>

<!-- Usage -->
<DashboardHeader
  title="Teacher Dashboard"
  subtitle="Welcome back!"
  navItems={[
    { label: "Applications", href: "/admin" },
    { label: "Browse Courses", href: "/courses" }
  ]}
/>

<!-- Result: 40 LOC removed from each of 5 pages = 200 LOC total saved -->
```

## Testing Strategy

### Unit Tests (New Components)
```typescript
// DashboardHeader.test.ts
- Renders title and subtitle
- Renders nav items correctly
- Handles logout click
- Responsive behavior

// StatsGrid.test.ts
- Renders all stats
- Shows loading state
- Handles empty data

// Modal.test.ts
- Opens/closes correctly
- Closes on backdrop click
- Handles form submission
```

### Integration Tests (Pages)
```typescript
// teacher.astro.test.ts
- Loads courses for teacher
- Can create course
- Can edit course
- Can delete course
- Uses new DashboardHeader component
- Uses new StatsGrid component

// admin.astro.test.ts
- Loads applications
- Filters work correctly
- Can approve/reject
- Uses new DashboardHeader component
- Uses new DataTable component
```

### Visual Regression Tests
- Compare screenshots before/after
- Ensure consistent styling
- Test responsive behavior

---

**Document Version**: 1.0
**Last Updated**: October 29, 2025
**Related**: teacher-ui-consolidation.md, CONSOLIDATION_SUMMARY.md
