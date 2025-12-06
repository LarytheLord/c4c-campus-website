# Admin Troubleshooting Guide

## Quick Diagnostics

### Is It a User Problem?

**Check if issue affects:**
- Only you? → Personal/local issue
- All admins? → System/server issue
- Specific users? → Data or permission issue

### Basic Troubleshooting Steps

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Logout and login again**
4. **Try different browser**
5. **Check internet connection**

## Access and Authentication Issues

### Problem: "Access Denied" on Admin Pages

**Symptoms:**
- Redirected to `/admin` from admin pages
- Message: "You need admin privileges"
- Cannot access dashboard, users, applications, or analytics

**Causes:**
- Not authenticated (logged out)
- Not assigned admin role
- Session expired
- Browser cookies disabled

**Solutions:**

1. **Verify You're Logged In**
   - Check browser top-right for user menu
   - If not logged in, visit `/login`
   - Enter credentials and submit

2. **Verify Admin Role**
   - Contact another admin to check your role
   - Have them navigate to `/admin/users`
   - Search for your email
   - Verify your role shows "admin"

3. **Check Browser Cookies**
   - Browser Settings → Privacy/Cookies
   - Ensure cookies enabled for domain
   - Clear cookies for site
   - Logout and login fresh

4. **Check Session**
   - Session may have expired
   - Logout completely
   - Close browser completely
   - Reopen and login fresh

5. **Contact Senior Admin**
   - If still denied after above
   - Another admin needs to verify your access
   - May need to reassign admin role

### Problem: "401 Unauthorized" Error

**Symptoms:**
- Error message: "401 Unauthorized"
- Cannot load any admin pages
- Browser console shows auth errors

**Causes:**
- Invalid session token
- Authentication service down
- Network connectivity issue
- Browser caching old auth

**Solutions:**

1. **Clear Session**
   - Logout from platform
   - Wait 10 seconds
   - Close browser completely
   - Reopen browser
   - Login again

2. **Clear Browser Cache**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)
   - Select "All time"
   - Check: Cookies, cached files
   - Click Clear

3. **Check Internet Connection**
   - Open new tab
   - Visit google.com
   - If can't load, connection issue
   - Restart router/reconnect WiFi
   - Retry admin access

4. **Check Service Status**
   - Visit status page: [status.c4c-campus.com]
   - Look for outages
   - If outage shown, wait for resolution
   - If no outage, continue troubleshooting

5. **Try Incognito/Private Window**
   - Open browser incognito mode
   - Visit c4c-campus.com
   - Login again
   - Test admin access
   - If works, cache is problem
   - Clear cache in regular window

### Problem: Cannot See Other Admins' Changes

**Symptoms:**
- You make a change
- Another admin doesn't see it
- Or vice versa

**Causes:**
- Page not refreshed
- Browser caching
- Database sync delay
- Real-time updates not loading

**Solutions:**

1. **Refresh Page**
   - Press F5 or Ctrl+R
   - Wait for page to reload
   - Check if change visible

2. **Hard Refresh (Clear Cache)**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - Wait for reload
   - Check if change visible

3. **Wait for Sync**
   - Database may take seconds to sync
   - Wait 30 seconds
   - Refresh again
   - Change should appear

4. **Verify Change Saved**
   - Check what you changed
   - Navigate away and back
   - Still shows your change?
   - If yes, change saved
   - Other person may need to refresh

## Dashboard Loading Issues

### Problem: Dashboard Shows "Loading..." Indefinitely

**Symptoms:**
- Spinner keeps spinning
- Never loads dashboard
- No data appears

**Causes:**
- Database connection down
- Network timeout
- JavaScript error
- Service role key invalid

**Solutions:**

1. **Wait Longer**
   - Sometimes takes 5-10 seconds
   - Wait full minute
   - If still loading, proceed

2. **Check Browser Console**
   - Press F12 to open dev tools
   - Click "Console" tab
   - Look for red error messages
   - Note any error text

3. **Check Network Tab**
   - Press F12 for dev tools
   - Click "Network" tab
   - Refresh page
   - Look for red (failed) requests
   - Click failed requests
   - Check response tab for error

4. **Verify Database Connection**
   - Try accessing `/admin/users`
   - If that loads, database works
   - Dashboard issue specific
   - Try different dashboard

5. **Restart Browser**
   - Close all browser windows
   - Wait 10 seconds
   - Reopen browser
   - Login and try dashboard

6. **Contact Technical Support**
   - If still not loading
   - Provide error messages from console
   - Share screenshot
   - Include your email/user ID

### Problem: Statistics Show "-" (Missing Data)

**Symptoms:**
- Dashboard loads but shows "-" for counts
- Some stats missing
- Or shows "0" when should have data

**Causes:**
- Database tables empty
- RLS policies blocking read
- Service role key not configured
- Data query failing

**Solutions:**

1. **Verify Tables Have Data**
   - Check if applications exist
   - Navigate to Applications page
   - Should show pending applications
   - If applications page empty, no data

2. **Check RLS Policies**
   - Admin or DBA needed
   - Supabase console required
   - Verify RLS policies allow read
   - Service role should bypass RLS
   - Contact technical team if needed

3. **Verify Service Role Key**
   - Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`
   - Should not be empty
   - Check if recently rotated
   - Update if changed
   - Restart application

4. **Check Recent Activity**
   - Go to Applications page
   - Do any applications show?
   - If yes, data exists
   - Dashboard query may have error
   - Try refreshing dashboard

## User Management Issues

### Problem: Cannot Search for Users

**Symptoms:**
- Search field shows but doesn't work
- Typing doesn't filter users
- Always shows all users

**Causes:**
- JavaScript not loaded
- Browser extension blocking
- Users not loaded yet
- Search function not initialized

**Solutions:**

1. **Wait for Load**
   - Users table may still loading
   - See spinner? Wait for completion
   - Then try searching

2. **Clear Search Field**
   - Delete text in search
   - Click elsewhere
   - Try again

3. **Refresh Page**
   - Press F5
   - Wait for users to load
   - Try searching

4. **Disable Browser Extensions**
   - Ad blockers or script blockers
   - Prevent search from working
   - Temporarily disable extensions
   - Try search again

5. **Try Different Approach**
   - Use role filter instead
   - Check "All Roles"
   - Manually find user in table
   - If table shows, search may not be issue

### Problem: Cannot Change User Role

**Symptoms:**
- Click role dropdown
- Select new role
- Nothing happens
- Or shows error

**Causes:**
- Not saved to database
- Permission denied
- Network error
- Invalid role selection

**Solutions:**

1. **Verify You're Admin**
   - You must have admin role
   - Contact another admin to check
   - Go to `/admin/users`
   - Have other admin verify your role

2. **Try Individual Change First**
   - Use role dropdown
   - Select new role
   - Confirmation dialog appears?
   - If yes, click "Confirm"
   - Wait for update

3. **Check for Network Error**
   - Press F12
   - Click Network tab
   - Refresh page
   - Change role again
   - Look for failed requests (red)
   - Click failed request
   - Check response for error details

4. **Try Different User**
   - Search for test user
   - Try changing their role
   - Does it work?
   - If yes, first user may be issue
   - Try first user again

5. **Logout and Login**
   - Your session may be stale
   - Logout completely
   - Wait 10 seconds
   - Login again
   - Try role change

### Problem: Bulk Operation Not Enabled

**Symptoms:**
- Bulk action buttons are grayed out
- Cannot click buttons
- Selection count shows "0 users selected"

**Causes:**
- No users selected
- Selection not registered
- Checkboxes not working

**Solutions:**

1. **Select Users**
   - Click checkbox next to user
   - Check that row highlights
   - Check selection count updates
   - Should show "1 users selected"

2. **Check Selection Counter**
   - Above table shows count
   - If shows "0" no users selected
   - Click checkbox again
   - Verify row highlights

3. **Try Select All**
   - Click "Select All" checkbox in header
   - All rows should highlight
   - Selection count should update
   - Bulk buttons should enable

4. **Refresh and Try Again**
   - Press F5
   - Wait for users to load
   - Try selecting users again
   - Try bulk operation

## Application Review Issues

### Problem: Applications Not Loading

**Symptoms:**
- Applications page shows spinner
- Never loads applications
- No list appears

**Causes:**
- Database connection down
- Service role key invalid
- Network timeout
- Application table missing

**Solutions:**

1. **Wait for Load**
   - May take 10+ seconds
   - Don't refresh yet
   - Wait full minute

2. **Refresh Page**
   - Press F5
   - Wait for reload
   - Should load applications

3. **Clear Cache**
   - Ctrl+Shift+R (hard refresh)
   - Wait for reload

4. **Check Network**
   - F12 for dev tools
   - Network tab
   - Look for failed requests
   - Check error responses

5. **Try Dashboard**
   - Go to admin dashboard
   - Does it load?
   - If yes, database works
   - Applications query specific issue

### Problem: Cannot Approve/Reject Applications

**Symptoms:**
- Approve button doesn't work
- Reject button doesn't respond
- No confirmation dialog appears

**Causes:**
- Not admin role
- Network error
- Application ID missing
- Permission denied

**Solutions:**

1. **Verify Admin Status**
   - Go to `/admin/users`
   - Search for yourself
   - Check your role is "admin"

2. **Try Detail View First**
   - Click "View Details"
   - Opens modal
   - Try approve/reject from modal
   - Does it work?
   - If yes, card buttons may have error

3. **Refresh Page**
   - Press F5
   - Wait for applications to load
   - Try again

4. **Check Browser Console**
   - F12 for dev tools
   - Console tab
   - Look for red errors
   - Copy error text
   - Share with support

5. **Try Different Application**
   - Try approving different app
   - Does it work?
   - If yes, first app may be corrupted
   - Try first app again later

### Problem: Filters Don't Work

**Symptoms:**
- Status filter selected but nothing changes
- Program filter doesn't filter
- Applications still show all

**Causes:**
- Filter not connected to list
- JavaScript not loaded
- Page not refreshed after load
- No matching records

**Solutions:**

1. **Refresh Page**
   - Press F5
   - Wait for full load
   - Try filter again

2. **Clear and Retry**
   - Click filter dropdown
   - Select "All"
   - Wait 2 seconds
   - Select specific status
   - Wait for list update

3. **Check for Matching Records**
   - Filter to "Pending"
   - Check recent statistics
   - Do any pending show?
   - If not, none to filter

4. **Try Other Filter**
   - Try different filter option
   - Does that filter work?
   - If yes, first filter may be empty
   - If no, filter system broken
   - Refresh page

### Problem: Modal Doesn't Open

**Symptoms:**
- "View Details" button doesn't open modal
- No popup appears
- Or modal appears and closes immediately

**Causes:**
- JavaScript error
- Browser popup blocked
- Modal data missing
- Application ID invalid

**Solutions:**

1. **Check Popup Blocker**
   - Browser may block modal
   - Check address bar for popup notification
   - Allow popups for domain
   - Try button again

2. **Try Double-Click**
   - Single click didn't work?
   - Try double-clicking button
   - Sometimes helps

3. **Refresh and Retry**
   - Press F5
   - Wait for applications
   - Try opening different app first
   - Then try original

4. **Check Console for Errors**
   - F12 for dev tools
   - Console tab
   - Look for red errors
   - Note error message

5. **Try Different Browser**
   - Chrome, Firefox, Safari, Edge
   - Try another browser
   - Same issue or different?
   - Helps identify if browser-specific

## Analytics Issues

### Problem: Charts Not Displaying

**Symptoms:**
- Blank chart areas
- No visualizations
- Or chart shows but no data

**Causes:**
- Chart library not loaded
- JavaScript error
- No data to display
- Browser doesn't support

**Solutions:**

1. **Wait for Load**
   - Charts take time to render
   - Wait 10+ seconds
   - Don't refresh yet

2. **Refresh Page**
   - Press F5
   - Wait for analytics load

3. **Check Console**
   - F12 for dev tools
   - Console tab
   - Look for JavaScript errors
   - Check network requests

4. **Try Different Browser**
   - Some browsers don't support Chart.js
   - Try Chrome or Firefox
   - Charts should appear

5. **Clear Cache**
   - Ctrl+Shift+R
   - Wait for reload

### Problem: Metrics Show Wrong Numbers

**Symptoms:**
- Numbers seem incorrect
- Total doesn't match displayed count
- Numbers don't change over time

**Causes:**
- Data not synced
- Old cache data
- Query filtering wrong
- Time zone issue

**Solutions:**

1. **Refresh Page**
   - Press F5
   - Wait for reload
   - Numbers updated?

2. **Clear Cache**
   - Ctrl+Shift+R (hard refresh)
   - Get fresh data

3. **Wait for Sync**
   - Data may take time to update
   - Recent changes take seconds
   - Wait 30 seconds
   - Refresh again

4. **Verify Data Directly**
   - Go to Applications page
   - Count pending manually
   - Does dashboard match?
   - If not, dashboard has error

5. **Check Filters**
   - Analytics query may filter data
   - Example: only active users
   - Manual count may include inactive
   - Check what's included/excluded

## System Health Issues

### Problem: "Database Status" Shows Error

**Symptoms:**
- Health bar red
- Says "Error" instead of "Connected"
- Other data loads fine

**Causes:**
- Health check query failing
- Temporary connection issue
- RLS policy blocking
- Service role key issue

**Solutions:**

1. **Refresh Page**
   - May be temporary
   - Press F5
   - Check status again

2. **Verify Other Pages Work**
   - Applications load?
   - Users visible?
   - If yes, database works
   - Health check specific issue

3. **Wait and Retry**
   - Temporary issue
   - Wait 1 minute
   - Refresh dashboard
   - Status should clear

4. **Contact DBA**
   - If persistent
   - Check Supabase dashboard
   - Verify database is running
   - Check service role key

### Problem: Page Loads Slowly

**Symptoms:**
- Taking 30+ seconds to load
- Spinner spinning long time
- Feels unresponsive

**Causes:**
- Network slow
- Database query slow
- Too much data
- Browser has too many tabs

**Solutions:**

1. **Check Internet Speed**
   - Open speedtest.net
   - Run speed test
   - <5 Mbps? Connection slow
   - Try with better connection

2. **Close Other Tabs**
   - Too many tabs slow browser
   - Close unnecessary tabs
   - Reload admin page
   - Faster?

3. **Clear Browser Cache**
   - Ctrl+Shift+Delete
   - Clear cached files
   - Reload page

4. **Try Different Time**
   - Server may be busy
   - Try at different time
   - Off-peak hours faster
   - Try early morning

5. **Try Different Network**
   - WiFi vs cellular
   - Office network vs home
   - Different location?
   - Helps identify issue

## Contacting Support

### Information to Provide

When contacting technical support, include:

1. **What you were doing**
   - Specific page/feature
   - Exact steps taken
   - What happened

2. **What you expected**
   - What should happen
   - Normal behavior

3. **What actually happened**
   - Error messages
   - Behavior observed
   - Screenshots

4. **System Information**
   - Browser (Chrome, Firefox, etc.)
   - Browser version
   - Operating system (Windows, Mac, Linux)
   - Device (computer, tablet, phone)

5. **Error Details**
   - Error messages verbatim
   - Console errors (F12 > Console)
   - Network errors (F12 > Network)
   - Screenshot of error

### Support Channels

- Email: support@c4c-campus.com
- Slack: #admin-support
- Issues: [GitHub issues URL]

## Escalation Process

### Level 1: Self Help
- Try troubleshooting steps
- Check documentation
- Clear cache/refresh
- Restart browser

### Level 2: Admin Team
- Ask another admin
- Check Slack #admin-channel
- Review admin docs
- Try suggested solutions

### Level 3: Technical Support
- Email support with details
- Provide all information
- Include error messages
- Share screenshots

### Level 4: Engineering Team
- If Level 3 unresolved
- Severe impact issues
- Platform-wide outages
- Database problems

## Prevention

### Regular Maintenance

- **Daily:** Refresh dashboard, process applications
- **Weekly:** Audit user access, check analytics
- **Monthly:** Full platform review, test backup/restore
- **Quarterly:** Major audit, system update check

### Best Practices

- Keep browser updated
- Clear cache weekly
- Regular backups verified
- Document changes made
- Communicate with admin team
- Follow change procedures

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [User Management](./user-management.md)
- [Application Review](./application-review.md)
- [Analytics Guide](./analytics.md)
- [Training Materials](./training-materials.md)
