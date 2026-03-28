#!/usr/bin/env node

/**
 * Apply Certificate System Migration to Supabase
 * This script reads the SQL migration file and applies it to the database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Required: PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_certificates_system.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Certificate System Migration');
console.log('============================');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Migration file: ${migrationPath}`);
console.log('');

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Applying migration to database...');
    console.log('');

    // Execute the SQL using Supabase's REST API
    // Note: We'll use the query method which executes raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, we need to apply the migration manually
      // through Supabase dashboard SQL editor
      console.log('Direct SQL execution not available via API.');
      console.log('');
      console.log('MANUAL STEPS REQUIRED:');
      console.log('======================');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID');
      console.log('2. Navigate to "SQL Editor"');
      console.log('3. Copy the contents of: supabase/migrations/005_certificates_system.sql');
      console.log('4. Paste into SQL Editor and click "Run"');
      console.log('');
      console.log('Alternative: Use Supabase CLI:');
      console.log('  npx supabase db push --linked');
      console.log('');
      return;
    }

    console.log('Migration applied successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - certificates');
    console.log('  - certificate_templates');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Install dependencies: npm install puppeteer qrcode handlebars');
    console.log('  2. Run certificate generation tests');
    console.log('');

  } catch (err) {
    console.error('Error applying migration:', err.message);
    console.error('');
    console.error('Please apply the migration manually through Supabase dashboard.');
    process.exit(1);
  }
}

applyMigration();
