# Backup and Restore Procedures

## Overview

Regular backups are critical for protecting platform data and enabling recovery from failures. This guide documents how to backup and restore C4C Campus data.

## Database Backup Strategy

### Backup Types

#### Automatic Backups (Daily)
- Supabase performs automatic daily backups
- Stored in secure cloud storage
- Retained for 30 days
- No admin action required

#### Manual Backups (As-Needed)
- Created before major changes
- Created before code deployments
- Created before data migrations
- Taken by admin or DBA

#### Full System Backups (Weekly)
- Complete database export
- Includes all tables and data
- Stored locally and in cloud
- Taken by technical team

### Backup Schedule

| Frequency | Type | Storage | Retention |
|-----------|------|---------|-----------|
| Daily | Automatic | Supabase | 30 days |
| Weekly | Manual Full | Local + Cloud | 12 weeks |
| Monthly | Archive | Cold storage | 1 year |
| Before Deploy | Pre-deployment | Local | Until deployed |
| Before Migration | Pre-migration | Cloud | Until verified |

## Automatic Backup Verification

### Checking Automatic Backups (Supabase)

Supabase automatically backs up your database. To verify backups:

1. **Access Supabase Console**
   - Visit https://supabase.com
   - Login with project credentials
   - Select project

2. **Navigate to Backups**
   - Click project name
   - Go to Settings > Backups
   - See backup list

3. **Review Backup Details**
   - List shows all backups
   - Each shows:
     - Creation date and time
     - Size of backup
     - Backup status
   - Most recent at top

4. **Verify Backup Success**
   - Status should show "Completed"
   - Not "In Progress" or "Failed"
   - Recent backups should exist
   - Check dates make sense

### Backup Frequency

- Backups taken automatically
- Typically once daily
- Time varies by day/load
- You don't need to trigger

### Recovery from Automatic Backup

Supabase allows recovery from automatic backups:

1. **Log Issues with Team**
   - Document data loss/corruption
   - Note exact time issue occurred
   - Contact technical support
   - Provide context

2. **Restore from Backup**
   - Technical team initiates restore
   - They select backup timestamp
   - Database restored to that point
   - May take 15-60 minutes

3. **Verification**
   - Test platform after restore
   - Verify all data recovered
   - Check for data loss
   - Confirm operations normal

## Manual Database Export

For important backups before major changes, export the database:

### Exporting via Supabase CLI

1. **Install Supabase CLI** (if not already)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **List Projects**
   ```bash
   supabase projects list
   ```

4. **Dump Database**
   ```bash
   supabase db dump --db-url "postgresql://user:password@db.host/database" > backup_2025-10-29.sql
   ```

5. **Verify Export**
   - Check file created
   - File should be >1MB
   - Contains SQL statements
   - Timestamped filename

### Exporting via Supabase Dashboard

1. **Access Supabase Console**
   - Login to supabase.com
   - Select project

2. **Go to SQL Editor**
   - Click "SQL Editor"
   - Click "New Query"

3. **Create Dump**
   ```bash
   pg_dump --version
   ```

4. **Schedule Dump** (in database)
   - Go to Database section
   - Click "Backups"
   - Use "Backup Now" button
   - Wait for completion
   - Download if needed

### Storing Backups

**Local Storage:**
- Save .sql files to `/backups/database/` directory
- Include date in filename
- Format: `backup_YYYY-MM-DD.sql`
- Keep at least 4 weeks

**Cloud Storage:**
- Upload to cloud backup service
- Consider: Google Drive, AWS S3, Azure Blob
- Encrypt sensitive backups
- Verify upload successful

**Physical/Offsite:**
- Quarterly hard copies
- Store physically secure
- Multiple locations
- Document storage location

## Restore Procedures

### Restoring from Automatic Backup

**Contact Technical Team:**
1. Email support@c4c-campus.com
2. Subject: "Database Restore Request"
3. Include:
   - Reason for restore
   - Target restore point (date/time)
   - Data loss details
   - Impact on operations

**After Restore:**
1. Test all functionality
2. Verify user access
3. Check recent data
4. Document any data loss
5. Update team

### Restoring from Manual Backup (SQL File)

**Caution:** This is a destructive operation. Only restore if needed.

#### Step 1: Prepare Environment

1. **Verify Backup File**
   - Locate backup file
   - Confirm file integrity
   - Check file size (should be large)
   - Verify it's readable

2. **Notify Team**
   - Inform all admins
   - Platform will be unavailable
   - Estimate downtime: 15-60 minutes
   - Set maintenance window

3. **Document Current State** (optional)
   - Take screenshots
   - Note current statistics
   - Record data loss estimate
   - For comparison after restore

#### Step 2: Stop Application

1. **Put Platform in Maintenance Mode** (if available)
   - Display maintenance message
   - Prevent new requests
   - Wait for active requests to finish

2. **Verify No Active Operations**
   - Check admin dashboard
   - Ensure no bulk operations running
   - No uploads or migrations in progress
   - Wait for everything to finish

3. **Notify Users** (if public)
   - Send maintenance notice
   - Explain expected downtime
   - Provide estimated restoration time

#### Step 3: Restore Database

**Using Supabase CLI:**

```bash
# Set database URL
export DATABASE_URL="postgresql://user:password@db.host/database"

# Restore from backup
psql $DATABASE_URL < backup_YYYY-MM-DD.sql

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM applications;"
```

**Using Supabase Dashboard:**

1. Go to Database section
2. Click "Restore from Backup"
3. Select backup point
4. Confirm restoration
5. Wait for completion
6. Monitor progress bar

**Using pgAdmin (if available):**

1. Connect to database
2. Right-click database name
3. Select "Restore"
4. Choose backup file
5. Review options
6. Click "Restore"
7. Wait for completion

#### Step 4: Verify Restore

```bash
# Check if data restored
psql $DATABASE_URL << EOF
SELECT
  (SELECT COUNT(*) FROM applications) as apps,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM courses) as courses,
  (SELECT COUNT(*) FROM enrollments) as enrollments;
EOF
```

Expected output should show reasonable numbers based on your backup point.

#### Step 5: Test Application

1. **Restart Application**
   - Restart web servers
   - Restart API servers
   - Wait for startup complete
   - Check logs for errors

2. **Test Core Functions**
   - Login as admin
   - View dashboard
   - Check user counts
   - Review applications
   - Load analytics
   - Check course access

3. **Test User Access**
   - Login as student account
   - Login as teacher account
   - Access course materials
   - Verify permissions working
   - Check cohort access

4. **Run Integration Tests**
   ```bash
   npm run test:integration
   ```
   - Should pass all tests
   - No database errors
   - Data consistency confirmed

5. **Check RLS Policies**
   - Users see only their data
   - No unauthorized access
   - Admins see everything
   - Teachers see their courses

#### Step 6: Restore User Access

1. **Update Environment** (if needed)
   - Database URL may have changed
   - Update .env variables
   - Redeploy if necessary

2. **Enable Public Access**
   - Remove maintenance mode
   - Restore normal operation
   - Public can access again

3. **Notify Team/Users**
   - Send all-clear message
   - Confirm normal operation
   - Thank for patience
   - Note data loss (if any)

4. **Monitor Operations**
   - Watch error logs
   - Check user reports
   - Monitor database performance
   - Track for issues

## Data Loss Assessment

### If Data Was Lost

After restore, determine what was lost:

1. **Identify Missing Data**
   - Compare current vs expected state
   - Note what's missing
   - Document affected users/records
   - Calculate data loss percentage

2. **Impact Analysis**
   - Which users affected
   - What operations lost
   - Revenue impact (if applicable)
   - Service impact

3. **Root Cause**
   - Why was restore needed?
   - When did loss occur?
   - Could it have been prevented?
   - How to prevent future?

4. **Communication**
   - Notify affected users
   - Explain what happened
   - Explain what was recovered
   - Provide guidance on next steps

5. **Documentation**
   - Document incident
   - Root cause analysis
   - Lessons learned
   - Process improvements

## Testing Restores

### Quarterly Restore Test

Every quarter, test restore process:

1. **Schedule Test**
   - Don't impact production
   - Use test database copy
   - Or schedule downtime

2. **Perform Restore**
   - Choose older backup
   - Restore to test database
   - Follow full restore process
   - Time how long it takes

3. **Verify Completeness**
   - Check all tables present
   - Verify record counts reasonable
   - Test sample data queries
   - Confirm RLS working

4. **Test Application**
   - Deploy to test environment
   - Login and test functions
   - Run integration tests
   - Check all features work

5. **Document Results**
   - Note restore duration
   - Document any issues
   - Update procedures if needed
   - File test report

## Disaster Recovery Planning

### Recovery Time Objective (RTO)
- Target: Restore within 2 hours
- Backup restore: 30-60 minutes
- Application testing: 20 minutes
- User notification: 10 minutes

### Recovery Point Objective (RPO)
- Maximum acceptable data loss: 24 hours
- Daily backups ensure this
- More frequent for critical systems
- Consider business needs

### Disaster Scenarios

#### Database Corruption
- **Detection:** Error logs, failed queries
- **Response:** Restore from backup
- **Verification:** Data integrity checks
- **Prevention:** Regular testing

#### Accidental Data Deletion
- **Detection:** Missing records, user reports
- **Response:** Restore from backup
- **Verification:** Verify deleted records recovered
- **Prevention:** Admin training, confirmations

#### Data Center Failure
- **Detection:** All services down
- **Response:** Supabase handles failover
- **Verification:** Services restored
- **Prevention:** Use managed database service

#### Ransomware/Security Breach
- **Detection:** Suspicious activity, locked files
- **Response:** Isolate systems, restore clean backup
- **Verification:** Security audit, patch systems
- **Prevention:** Security hardening, monitoring

## Documentation and Logs

### Backup Log Template

Create and maintain backup log:

```
Date: 2025-10-29
Time: 14:30 UTC
Type: Manual - Pre-deployment
File: backup_2025-10-29_pre-deploy.sql
Size: 45.2 MB
Location: /backups/database/ and Google Drive
Reason: Before deploying authentication update
Verified: YES - 287 applications, 45 users, 15 courses
Notes: All tables present, no errors
By: Admin Name
```

### Restore Log Template

```
Date: 2025-10-29
Time: 15:00 UTC
Source Backup: backup_2025-10-29_pre-deploy.sql
Reason: Rollback authentication issue
Duration: 32 minutes
Verification: PASSED
Data Loss: None
Systems Tested: Admin dashboard, User login, Course access
Issues: None
By: Admin Name
Approved By: Senior Admin Name
```

## Automation

### Automated Backup Verification

Create script to verify daily backups:

```bash
#!/bin/bash
# Verify latest Supabase backup exists
# Run daily via cron: 0 2 * * * /opt/scripts/verify-backup.sh

BACKUP_FILE="$(find /backups -name 'backup*.sql' -mtime -1)"
if [ -z "$BACKUP_FILE" ]; then
  echo "ALERT: No backup from last 24 hours" | \
    mail -s "Backup verification failed" admin@c4c-campus.com
else
  echo "Backup verified: $BACKUP_FILE" >> /var/log/backup.log
fi
```

### Automated Export

Weekly automated database export:

```bash
#!/bin/bash
# Weekly database export
# Run via cron: 0 3 * * 0 /opt/scripts/weekly-backup.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/database"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

pg_dump $DATABASE_URL > "$BACKUP_FILE"
gzip "$BACKUP_FILE"
gsutil cp "$BACKUP_FILE.gz" gs://c4c-backups/

echo "Weekly backup completed: $BACKUP_FILE.gz" >> /var/log/backup.log
```

## Best Practices

1. **Regular Testing**
   - Test restore quarterly
   - Confirm backup integrity
   - Document procedures
   - Train team

2. **Secure Storage**
   - Encrypt backups
   - Multiple locations
   - Off-site storage
   - Access control

3. **Documentation**
   - Keep procedure updated
   - Document every backup/restore
   - Maintain runbooks
   - Share with team

4. **Monitoring**
   - Alert on backup failure
   - Verify backups daily
   - Track restore times
   - Monitor storage usage

5. **Access Control**
   - Only admins can restore
   - Senior admin approval
   - Audit all restores
   - Document decisions

## Checklist

### Before Deploying Code
- [ ] Create manual backup
- [ ] Verify backup successful
- [ ] Document reason and timestamp
- [ ] Notify team
- [ ] Deploy

### Quarterly Testing
- [ ] Schedule restore test
- [ ] Restore to test database
- [ ] Verify all data present
- [ ] Test application functions
- [ ] Document results

### Monthly Review
- [ ] Check backup logs
- [ ] Verify recent backups exist
- [ ] Check storage available
- [ ] Audit access logs
- [ ] Update documentation

## Contacts and Escalation

**Technical Support:** support@c4c-campus.com
**DBA Contact:** dba@c4c-campus.com
**Emergency Line:** [Emergency number]

For urgent issues:
1. Call emergency line
2. Email support with backup details
3. Provide affected period
4. Explain impact

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Training Materials](./training-materials.md)
