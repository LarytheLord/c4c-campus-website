# Application Review Guide

## Overview

The Application Review interface enables admins to manage program applications, review applicant information, and make approval decisions. This is the primary workflow for onboarding new students into C4C programs.

**Access URL:** `/admin/applications`

## Dashboard Statistics

### Application Status Overview

Four key metrics at the top:

- **Total Applications:** All applications in system
- **Pending:** Awaiting review decision
- **Approved:** Accepted applicants
- **Rejected:** Denied applicants

These update in real-time as applications are processed.

## Application Filtering

### Search Applications

1. Use the **"Search by name or email..."** field
2. Search is case-insensitive
3. Matches both applicant name and email
4. Results update instantly as you type

### Filter by Status

1. Click **Status Filter** dropdown
2. Choose from:
   - All Statuses (default)
   - Pending
   - Approved
   - Rejected
   - Waitlisted
3. Table updates to show only selected status

### Filter by Program

1. Click **Program Filter** dropdown
2. Choose from:
   - All Programs (default)
   - Bootcamp
   - Accelerator
   - Hackathon
3. Combine with status filter for specific cohorts

### Combined Filtering

- Use search + status + program filters together
- Example: Find all pending bootcamp applications
- Filters work together to narrow results

## Application Listing

### Application Card Layout

Each application shows:

**Header Section:**
- Applicant name (large, bold)
- Email address
- WhatsApp number (if provided)
- Program badge (Bootcamp, Accelerator, Hackathon)
- Status badge (colored indicator)

**Motivation Section:**
- Short preview of applicant's motivation (truncated to 2 lines)
- Click "View Details" for full text

**Metadata:**
- Applied date
- Reviewed date (if already reviewed)

**Action Buttons:**
- View Details - Opens full application modal
- Approve (if pending) - Quick approve button
- Reject (if pending) - Quick reject button

## Application Details

### Opening Detailed View

1. Click "View Details" button on any application
2. Modal opens showing complete application
3. All fields displayed with full text
4. Take notes while reviewing

### Detailed Information

Applications show:

- **Basic Info:**
  - Name
  - Email
  - WhatsApp
  - Location
  - Discord handle

- **Program Info:**
  - Selected program
  - Program-specific fields

- **Bootcamp Applicants See:**
  - Motivation statement
  - Technical experience
  - Time commitment
  - Areas of interest
  - Why joining bootcamp

- **Accelerator Applicants See:**
  - Project name
  - Project description
  - Prototype link
  - Tech stack
  - Target users
  - Production requirements
  - Team size
  - Current stage
  - Funding needs

### Modal Actions

From the detailed view, you can:

- **Approve:** Accept the application
- **Reject:** Deny the application
- **Waitlist:** Place on waitlist
- **Close:** Exit without changes

## Application Review Workflow

### Quick Review (Single Application)

1. Scan application card info
2. Click "Approve" or "Reject" if decision is clear
3. Move to next application
4. Confirmation dialog appears before action

### Detailed Review

1. Click "View Details" for full information
2. Read complete application text
3. Add internal notes if needed
4. Click appropriate action button
5. Application updates immediately

### Bulk Review Process

1. **Filter Applications:**
   - Use status/program filters to find group
   - Example: All pending bootcamp applications

2. **Select Applications:**
   - Check boxes next to applications to review
   - Selection counter updates
   - Or select all with header checkbox

3. **Bulk Actions:**
   - Click "Approve Selected" - Approve all checked
   - Click "Reject Selected" - Reject all checked
   - Click "Waitlist Selected" - Waitlist all checked

4. **Confirmation:**
   - Dialog confirms count and action
   - Review before proceeding
   - Cannot be undone

## Application Status

### Status Options

- **Pending:** Awaiting review decision
- **Approved:** Application accepted, user can access platform
- **Rejected:** Application denied
- **Waitlisted:** Application good but no spots available

### Changing Application Status

1. From quick buttons in card (if pending)
2. From modal detailed view
3. From bulk operations
4. Status updates with current timestamp
5. Your admin ID recorded as reviewer

## Selection Management

### Individual Selection
- Click checkbox next to application
- Row highlights when selected
- Uncheck to deselect

### Select All
- Click "Select All" checkbox in filter bar
- All visible applications selected
- Selection counter shows total

### Bulk Actions Requirements
- Select 1+ applications
- Choose bulk action
- Confirm operation
- Changes applied to all selected

### Clear Selection
- Uncheck individual applications
- Click "Select All" again to deselect all
- Selection counter resets to 0

## Application Processing

### Approval Process

**Step 1: Review Application**
- Read motivation and technical background
- Consider program fit
- Check for completeness

**Step 2: Make Decision**
- Click Approve button
- Confirmation appears
- Confirm approval

**Step 3: System Updates**
- Status changes to "Approved"
- Timestamp recorded
- Applicant gets access to platform

**Step 4: Follow Up**
- May send acceptance email (if configured)
- User can login and start courses

### Rejection Process

**Step 1: Review Application**
- Check for issues (incomplete, poor fit, etc.)
- Verify rejection is appropriate

**Step 2: Make Decision**
- Click Reject button
- Confirmation appears
- Confirm rejection

**Step 3: System Updates**
- Status changes to "Rejected"
- Timestamp recorded
- Can optionally send rejection email

### Waitlist Process

**Step 1: Identify Good Candidates**
- Application quality is good
- But program is full
- No immediate spots available

**Step 2: Add to Waitlist**
- Click "Waitlist" from modal
- Application status becomes "Waitlisted"
- Can be approved later when spots open

**Step 3: Monitor Waitlist**
- Filter by "Waitlisted" status
- Review periodically
- Approve when capacity available

## Application History

### Tracking Changes

For each application, the system records:
- Original submission date (created_at)
- Review date (reviewed_at)
- Reviewer ID (reviewed_by)
- Current status

### Finding Recently Reviewed

1. Applications sorted newest first
2. Check "Reviewed" date in application
3. Most recent reviews show at top
4. Filter by status to find group

## Review Notes

While reviewing applications, you can:
- Use browser notes/tabs for personal notes
- Reference any external evaluation tools
- Document decision reasoning (optional)
- Keep notes in your admin workspace

## Best Practices

### Consistent Review

1. **Set Review Criteria:**
   - Establish clear approval standards
   - Document decision factors
   - Apply consistently

2. **Review Systematically:**
   - Start with pending applications
   - Sort by date (oldest first)
   - Process in batches

3. **Quality Checks:**
   - Verify email addresses valid
   - Check for spam/fake accounts
   - Look for complete information

4. **Fairness:**
   - Blind review if possible
   - Don't be influenced by applicant origin
   - Focus on qualifications

5. **Documentation:**
   - Keep decision logs
   - Note reasons for rejections
   - Record approval basis

### Bulk Operations

- Use for similar decisions
- Example: Reject all incomplete applications
- More efficient than individual review
- Always confirm before executing

### Timing

- Process applications frequently
- Reduce decision time for applicants
- Set weekly review schedule
- Communicate timeline to users

## Troubleshooting

### Applications Not Loading

**Problem:** Page shows loading spinner indefinitely

**Solutions:**
- Check internet connection
- Verify Supabase connection
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page (Ctrl+R)
- Check browser console for errors (F12)

### Status Change Not Working

**Problem:** Approve/Reject button doesn't work

**Solutions:**
- Verify you have admin role
- Check network connection
- Try from modal instead of card
- Refresh page and retry
- Check browser console for error messages

### Filtering Not Working

**Problem:** Filter selections don't update results

**Solutions:**
- Ensure at least one application exists
- Verify filter option selected
- Clear multiple filters and try one
- Refresh page
- Check that database has matching records

### Modal Not Opening

**Problem:** "View Details" button doesn't open modal

**Solutions:**
- Try double-clicking button
- Wait for page to fully load
- Check for browser extensions blocking popups
- Clear cache and refresh
- Try different browser

### Bulk Selection Issues

**Problem:** Checkboxes don't work or bulk buttons disabled

**Solutions:**
- Verify at least one checkbox selected
- Refresh page to reload state
- Clear browser cache
- Try selecting one app manually
- Check selection counter shows correct number

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [User Management](./user-management.md)
- [Analytics Guide](./analytics.md)
- [Troubleshooting Guide](./troubleshooting.md)
