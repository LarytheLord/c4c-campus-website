# Admin Dashboard Guide

## Overview

The Admin Dashboard is the central hub for platform administration in C4C Campus. It provides real-time insights into platform health, user management, application processing, and analytics across all programs.

**Access URL:** `/admin/dashboard`

## Dashboard Sections

### 1. Overview Statistics

The dashboard displays four key metrics at the top:

#### Total Users
- Shows the count of all registered users in the system
- Includes students, teachers, and admin accounts
- Updated in real-time

#### Pending Applications
- Count of applications awaiting review
- Click "View All Applications" to manage pending applications
- Each pending application requires approval, rejection, or waitlisting

#### Total Courses
- Displays the number of courses available on the platform
- Includes published and unpublished courses
- Updates when new courses are created

#### Active Cohorts
- Shows currently active cohorts
- Cohorts manage group-based learning
- Click to view cohort performance analytics

### 2. Recent Applications

The "Recent Applications" widget shows the 5 most recently submitted applications:

- **Name & Email:** Quick identification of applicants
- **Status Badge:** Visual indicator (Pending, Approved, Rejected)
- **Application Date:** When the application was submitted
- **View All Link:** Navigate to the full application review interface

Each application displays:
- Colored status indicator
- Applicant contact information
- Application submission date

### 3. System Health

Real-time system health indicators:

#### Database Status
- Shows connection status (Connected/Error)
- Health percentage bar
- Green = Connected (100%)
- Red = Connection error

#### Storage Used
- Displays current database storage usage
- Shows percentage of allocated storage
- Storage monitoring to prevent database overflow

#### RLS Policies
- Shows if Row-Level Security policies are active
- Critical for data privacy
- Status: "Active" or "Inactive"

### 4. Quick Actions

Fast-access buttons for common admin tasks:

- **Manage Users:** Navigate to user management interface
- **Review Applications:** Go to application review page
- **View Analytics:** Access detailed platform analytics
- **Refresh Stats:** Manually update all dashboard statistics

## Navigation Menu

The sticky header at the top provides navigation between admin sections:

- **Dashboard:** Return to admin overview
- **Users:** User role and permission management
- **Applications:** Review and manage program applications
- **Analytics:** Detailed platform insights and metrics
- **Sign Out:** Logout from admin panel

## Real-Time Updates

The dashboard automatically fetches and displays:
- Current user count
- Pending application count
- Course count
- Active cohort count
- System health status

Data is loaded on page initialization. Use the "Refresh Stats" button to manually update all metrics.

## Access Control

Admin access is verified on page load:
1. Session is checked for active authentication
2. User's role is verified in the applications table
3. Only users with `role = 'admin'` can access
4. Unauthorized users see "Access Denied" message with redirect to dashboard

## Performance Considerations

- Dashboard queries are optimized with `count: 'exact'` for statistics
- Recent applications are limited to 5 most recent entries
- Statistics use SELECT with count() to minimize data transfer
- System health checks are lightweight

## Troubleshooting

### Dashboard Shows "Loading..." Indefinitely
- Check browser console for errors (F12 > Console tab)
- Verify database connection status
- Try refreshing the page
- Clear browser cache and reload

### Missing Statistics
- Ensure tables exist in database (applications, courses, cohorts, enrollments)
- Check RLS policies allow admin reads
- Verify service role key is correctly configured

### Recent Applications Not Loading
- Check network tab for failed requests
- Verify Supabase connection
- Ensure applications table has data

## Related Pages

- [User Management](./user-management.md)
- [Application Review](./application-review.md)
- [Analytics Guide](./analytics.md)
