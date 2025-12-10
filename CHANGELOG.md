# Changelog

This changelog documents bug fixes and improvements made to the C4C Campus platform. Each entry includes the original issue, specific changes made, and testing procedures.

---

## Table of Contents

- [Bug Fixes - December 10, 2025](#bug-fixes---december-10-2025)
  - [Bug #1: Password Length Requirement Not Visible](#bug-1-password-length-requirement-not-visible)
  - [Bug #2: Accelerator Application Details Not Displayed in Admin](#bug-2-accelerator-application-details-not-displayed-in-admin)
  - [Bug #3: Application Status Update API Failures](#bug-3-application-status-update-api-failures)
  - [Bug #4: Teacher Module Edit and Delete Functionality Broken](#bug-4-teacher-module-edit-and-delete-functionality-broken)
  - [Additional Improvements](#additional-improvements)

---

## Bug Fixes - December 10, 2025

### Bug #1: Password Length Requirement Not Visible

#### UX Issue Reported

- Password under 12 characters was rejected by the system
- Error message only visible on hover, not immediately apparent to users
- No visible help text showing the minimum length requirement upfront

#### Changes Made

- Modified `src/pages/apply.astro` lines 104, 260
- Updated help text from "Must include: uppercase..." to "Must be 12+ characters long. Must include: uppercase..."
- Applied to both Bootcamp (line 104) and Accelerator (line 260) application forms
- Help text now explicitly states the minimum length requirement before other criteria

#### Testing Needed

- [ ] Verify help text displays below password fields on both Bootcamp and Accelerator forms
- [ ] Test password validation with <12 characters (should show error)
- [ ] Test password validation with 12+ characters meeting all requirements (should succeed)
- [ ] Check mobile responsiveness of help text

---

### Bug #2: Accelerator Application Details Not Displayed in Admin

#### UX Issue Reported

- Admin application detail modal was missing 10 Accelerator-specific fields
- Fields were submitted via the application form but not visible to reviewers
- Missing fields: track, project_name, project_description, prototype_link, tech_stack, target_users, production_needs, team_size, current_stage, funding

#### Changes Made

- Modified `src/pages/admin/applications-review.astro` lines 461-530
- Added conditional rendering block for `app.program === 'accelerator'`
- Created grid layout for short fields (track, project_name, team_size, current_stage, funding)
- Added full-width sections for long text fields (project_description, tech_stack, target_users, production_needs)
- Formatted prototype_link as clickable hyperlink with `target="_blank"` for external navigation
- Applied defensive null checks (`app.track ? ... : ''`) to prevent empty UI elements
- Used snake_case field names matching the database schema

#### Testing Needed

- [ ] Open admin dashboard → Applications Review
- [ ] Click "View Details" on an Accelerator application
- [ ] Verify all 10 fields display correctly with proper formatting
- [ ] Test with applications having null/missing fields (should not break UI)
- [ ] Verify prototype_link opens in new tab when clicked
- [ ] Check modal scrolling behavior with full Accelerator data

---

### Bug #3: Application Status Update API Failures

#### UX Issue Reported

- "Failed to update application status" error on all approval/rejection attempts
- Affected Quick Approve, modal buttons (Approve/Reject/Waitlist & Email), and bulk actions
- No emails sent, database not updated

#### Changes Made

- Modified `src/pages/api/admin/update-application-status.ts` lines 7-91, 151-266

**Authentication Fix:**
- Replaced `auth.getUser(accessToken)` with `auth.setSession({access_token, refresh_token})` (lines 60-63)
- This properly establishes the session context needed for authenticated database operations

**Token Parsing:**
- Enhanced cookie parsing to extract both access and refresh tokens from `sb-[project]-auth-token` cookie (lines 33-52)
- Handles the base64-encoded JSON structure of Supabase auth cookies

**Configuration Validation:**
- Added `checkConfiguration()` function to verify environment variables before processing (lines 12-26)
- Prevents cryptic errors when RESEND_API_KEY or other required vars are missing

**Role-Based Approval:**
- Implemented two-phase update for approved status (lines 200-255)
- Only sets `role: 'student'` for applications with null role
- Preserves existing admin/teacher roles to avoid accidental demotion

**Error Logging:**
- Added detailed console warnings with error codes and user context (lines 55-56, 66-69, 83-87)
- Helps diagnose authentication and database issues in production

**Defensive Updates:**
- Separated applications by role status before updating to avoid demoting admins

#### Testing Needed

- [ ] **Quick Approve:** Click "Quick Approve" on pending application → verify status changes to approved, email sent
- [ ] **Modal Actions:** Open application details → test "Approve & Email", "Reject & Email", "Waitlist & Email" with decision notes
- [ ] **Bulk Actions:** Select multiple applications → test bulk approve/reject/waitlist
- [ ] **Database Verification:** Check `applications` table for updated `status`, `reviewed_at`, `reviewed_by`, `decision_note` fields
- [ ] **Email Delivery:** Verify emails arrive with correct content and decision notes
- [ ] **Role Preservation:** Approve an admin's application → verify role remains 'admin' not 'student'
- [ ] **Error Scenarios:** Test with invalid session, non-admin user, missing environment variables

---

### Bug #4: Teacher Module Edit and Delete Functionality Broken

#### UX Issue Reported

- Module delete button showed "async()=>{await Y(i)}" instead of "Delete" (minified code leak)
- Module not deleted after pressing the button
- No Edit button or functionality for modules
- Cannot modify module name, description, or order after creation

#### Changes Made

- Modified `src/pages/teacher/courses.astro` lines 424-465, 835-1112

**Module Modal:**
- Added complete modal UI (lines 424-465) with form fields for name, description, order
- Includes proper form validation and error display

**Edit Functionality:**
- Implemented `editModule()` function to populate modal with existing module data (lines 1024-1034)
- Pre-fills all fields when editing an existing module

**Modal Management:**
- Added `showModuleModal()`, `closeModuleModal()` functions for modal lifecycle (lines 1035-1071)
- Handles modal open/close states and form reset

**Form Submission:**
- Created `handleModuleSubmit()` for both create and update operations (lines 1073-1112)
- Detects edit vs create mode and calls appropriate API endpoint

**UI Updates:**
- Added "Edit" button next to each module in the list (lines 984-998)
- Properly styled buttons with consistent hover states

**Event Listeners:**
- Wired up modal open/close and form submit handlers (lines 847-848, 994-998)
- All event bindings properly initialized on page load

**Delete Fix:**
- Preserved existing delete functionality
- Fixed button rendering by properly handling async callbacks
- Button now displays "Delete" text correctly

**State Management:**
- Added `editingModule` and `currentModules` variables to track editing context (lines 477-478)
- Enables proper state tracking for edit operations

#### Testing Needed

- [ ] **Add Module:** Click "Add Module" → fill form → verify new module appears in list
- [ ] **Edit Module:** Click "Edit" on existing module → verify form pre-populates → change values → verify updates persist
- [ ] **Delete Module:** Click "Delete" → verify confirmation shows "Delete" text (not minified code) → confirm → verify module removed
- [ ] **Order Management:** Create multiple modules → edit order values → verify list re-sorts correctly
- [ ] **Validation:** Try submitting empty module name → verify error message displays
- [ ] **Modal UX:** Test modal open/close, cancel button, escape key, click outside to close
- [ ] **Refresh Behavior:** After add/edit/delete → verify modules list refreshes without page reload

---

### Additional Improvements

The following improvements were made alongside the bug fixes:

#### WhatsApp Field Made Optional

- Modified `src/pages/apply.astro` lines 76-78, 232-234
- Changed WhatsApp number from required to optional field
- Added helper text clarifying the field is optional

#### Scholarship System Added

- Modified `src/pages/apply.astro` lines 117-171, 726-743, 775-793
- Added scholarship request checkbox to both application forms
- Added scholarship category selector (full/partial/housing/travel)
- Implemented validation to ensure scholarship category is selected when checkbox is checked
- Scholarship requests now captured in application data

#### Track Selection for Bootcamp

- Modified `src/pages/apply.astro` lines 132-146
- Added track dropdown to Bootcamp application form
- Includes link to tracks page for more information
- Options: Animal Advocacy, Climate, AI Safety, General

#### Interests Validation Fix

- Modified `src/pages/apply.astro` lines 117-130, 697-700, 742-745
- Fixed checkbox selection to exclude scholarship checkbox from interest count
- Added proper validation requiring at least one interest selected
- Prevents form submission with no interests checked

#### Scholarship Filter in Admin

- Modified `src/pages/admin/applications.astro` lines 78-82, 208-217, 266-270, 494-500
- Added scholarship filter dropdown to applications list
- Filter options: All, Requested Scholarship, No Scholarship Request
- Helps admins quickly identify scholarship applicants

#### Legacy URL Compatibility

- Modified `src/pages/apply.astro` lines 568-582
- Added backward compatibility for legacy `#incubator` URLs
- Automatically redirects to `#accelerator` hash
- Prevents broken links from old marketing materials

---

## Pre-Deployment Validation

Run these commands before deploying changes:

```bash
# Type check
npx astro check

# Schema-types sync
npm run db:types:check

# Field name validation
npm run db:field-names:check

# All validation
npm run db:validate:all

# Integration tests
npm run test:integration
```

---

*Last updated: December 10, 2025*
