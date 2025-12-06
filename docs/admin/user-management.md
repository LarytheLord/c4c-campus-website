# User Management Guide

## Overview

The User Management interface allows admins to manage user roles, permissions, and account status across the platform. This is essential for controlling who has access to different features and capabilities.

**Access URL:** `/admin/users`

## Key Features

### User Listing

Display all registered users with the following information:

- **Name:** User's full name
- **Email:** Account email address
- **Role:** Current role (Student, Teacher, Admin)
- **Status:** Application status (Approved, Pending, Rejected)
- **Joined Date:** Account creation date
- **Actions:** Quick action buttons

### Role Types

The platform supports three user roles:

#### Student
- Access to courses and learning materials
- Can view and submit assignments
- Can participate in cohorts
- Default role for new applicants

#### Teacher
- Can create and manage courses
- Can view student progress
- Can moderate discussions
- Full access to course administration

#### Admin
- Full platform access
- Can manage users and roles
- Can review applications
- Can access analytics and system settings
- Can perform bulk operations

## User Management Tasks

### Viewing Users

1. Navigate to `/admin/users`
2. All users are loaded and displayed in a table
3. View basic information for each user
4. Users are listed with most recent joins first

### Searching Users

1. Use the **Search by name or email** input field
2. Type to filter users in real-time
3. Search is case-insensitive
4. Matches both name and email fields

### Filtering by Role

1. Click the **Role Filter** dropdown
2. Select from:
   - All Roles (default)
   - Students
   - Teachers
   - Admins
3. Table updates immediately to show only selected role

### Changing Individual User Role

1. Locate the user in the table
2. Click the **Role dropdown** in the Actions column
3. Select the new role (Student, Teacher, Admin)
4. Confirmation dialog appears
5. Click "Confirm" to apply the change
6. Role updates immediately in the table

### Bulk Role Assignment

For changing roles for multiple users at once:

1. **Select Users:**
   - Click individual checkboxes to select users
   - Or click "Select All" checkbox to select all visible users
   - Selection count updates at the top

2. **Choose Bulk Action:**
   - Click "Make Students" - Assigns student role to all selected
   - Click "Make Teachers" - Assigns teacher role to all selected
   - Click "Make Admins" - Assigns admin role to all selected

3. **Confirm Bulk Operation:**
   - A confirmation dialog appears
   - Confirms number of users being updated
   - Click "Confirm" to proceed
   - Success message shows when complete

4. **Clear Selection:**
   - Uncheck individual users or click "Select All" again
   - Selection count will update

### Combined Filtering and Selection

1. Use search and role filters to narrow down users
2. Select users from filtered results
3. Perform bulk actions on selected users
4. Useful for:
   - Promoting all students to teachers
   - Managing role changes for specific groups
   - Batch admin promotions

## Selection Management

### Selection Counter
- Shows "X users selected" above the table
- Updates in real-time as users select/deselect
- Zero when no users selected

### Select All Checkbox
- Located in table header
- **Checked:** All visible users selected
- **Unchecked:** No users selected
- **Indeterminate:** Some users selected

### Bulk Action Buttons
- **Disabled** when no users selected
- **Enabled** when 1+ users selected
- Shows clear action (Make Students, Make Teachers, Make Admins)

## User Display Details

Each user row shows:

| Column | Description |
|--------|-------------|
| Select | Checkbox for bulk operations |
| Name | User's full name |
| Email | Account email address |
| Role | Current role badge with color coding |
| Status | Application approval status |
| Joined | Account creation date |
| Actions | Role selector dropdown |

### Role Badge Colors
- **Admin:** Red badge
- **Teacher:** Blue badge
- **Student:** Gray badge

### Status Indicators
- **Approved:** Green text
- **Pending:** Yellow text
- **Rejected:** Red text

## Common Tasks

### Promote Student to Teacher

**Method 1: Individual**
1. Find the student in the table
2. Click role dropdown in Actions
3. Select "Teacher"
4. Confirm in dialog
5. Role changes immediately

**Method 2: Bulk**
1. Filter by role "Students"
2. Select students to promote
3. Click "Make Teachers"
4. Confirm operation
5. All selected students become teachers

### Remove Admin Status

1. Find admin user in table
2. Filter by role "Admins" for easier finding
3. Click role dropdown
4. Select "Student" or "Teacher"
5. Confirm the role change

### Find Inactive Users

1. Use search to find specific users
2. Check join date to identify old accounts
3. Consider their role and activity
4. Manage accordingly

## Data Persistence

- All role changes are immediately saved to database
- Changes persist across page refreshes
- RLS policies ensure only admins can modify roles
- Audit trail tracked with reviewed_by field

## Keyboard Shortcuts

While no keyboard shortcuts are built-in, you can:
- Use Tab to navigate between fields
- Press Enter to confirm selections
- Use Ctrl+F (Cmd+F) for browser search

## API Integration

User management uses these APIs:

**Update Individual Role:**
```
PUT /api/admin/bulk-operations
{
  "operation": "assign_roles",
  "ids": ["user_id"],
  "params": {"role": "teacher"}
}
```

**Bulk Update Roles:**
```
POST /api/admin/bulk-operations
{
  "operation": "assign_roles",
  "ids": ["user_id_1", "user_id_2"],
  "params": {"role": "admin"}
}
```

## Best Practices

1. **Review Before Promoting:** Verify user identity before making admin
2. **Document Changes:** Keep notes of why role was changed
3. **Regular Audits:** Periodically review who has admin access
4. **Use Bulk Operations:** More efficient for multiple changes
5. **Test Filters:** Use filters to verify changes affect correct users

## Troubleshooting

### Users Not Loading
- Check database connection
- Verify Supabase service role key
- Check browser console for errors

### Role Change Failed
- Verify you have admin privileges
- Check for network errors
- Retry the operation

### Selection Not Working
- Clear browser cache
- Refresh the page
- Try individual role change first

### Bulk Operations Not Enabled
- Ensure at least one user is selected
- Check that selection count shows > 0
- Verify admin access

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [Application Review](./application-review.md)
- [Analytics Guide](./analytics.md)
- [Troubleshooting Guide](./troubleshooting.md)
