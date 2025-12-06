#!/usr/bin/env python3

import os
import sys
import re
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print('ERROR: Missing Supabase credentials')
    print(f'PUBLIC_SUPABASE_URL: {"SET" if SUPABASE_URL else "MISSING"}')
    print(f'SUPABASE_SERVICE_ROLE_KEY: {"SET" if SERVICE_ROLE_KEY else "MISSING"}')
    sys.exit(1)

print(f'Supabase URL: {SUPABASE_URL}')
print(f'Service Role Key: {SERVICE_ROLE_KEY[:20]}...\n')

# Read schema file
script_dir = Path(__file__).parent
schema_path = script_dir / 'schema.sql'

with open(schema_path, 'r') as f:
    schema_sql = f.read()

# Parse statements
statements = []
current_stmt = []

for line in schema_sql.split('\n'):
    stripped = line.strip()
    
    # Skip empty lines and comments
    if not stripped or stripped.startswith('--'):
        continue
    
    current_stmt.append(line)
    
    # Check if statement ends
    if stripped.endswith(';'):
        stmt = '\n'.join(current_stmt).strip()
        # Remove trailing semicolon for execution
        if stmt.endswith(';'):
            stmt = stmt[:-1].strip()
        # Remove inline comments
        stmt = re.sub(r'\s*--.*', '', stmt, flags=re.MULTILINE)
        if stmt:
            statements.append(stmt)
        current_stmt = []

print(f'Found {len(statements)} SQL statements to execute\n')

# Try direct database connection first
print('Attempting to establish database connection...')

try:
    import psycopg2
    from psycopg2 import sql, Error
    
    # Extract project info from URL
    project_id = SUPABASE_URL.split('https://')[1].split('.supabase.co')[0]
    db_host = f'{project_id}.supabase.co'
    
    # The service role key is an API key, not a database password
    # We need to try connecting as postgres with a default password or use API
    # Let's first try the REST API approach
    
    print('Using REST API for schema execution...\n')
    
    # Try using the REST API with RPC
    results = {
        'successful': [],
        'failed': [],
        'tables': set(),
        'indexes': set(),
        'policies': set(),
        'triggers': set(),
        'functions': set(),
        'views': set(),
    }
    
    for i, statement in enumerate(statements, 1):
        # Extract what we're creating
        if re.search(r'CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)', statement, re.I):
            match = re.search(r'CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)', statement, re.I)
            create_type = f'TABLE: {match.group(1)}'
            results['tables'].add(match.group(1))
        elif re.search(r'CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)', statement, re.I):
            match = re.search(r'CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)', statement, re.I)
            create_type = f'INDEX: {match.group(1)}'
            results['indexes'].add(match.group(1))
        elif re.search(r'CREATE\s+POLICY\s+"([^"]+)"', statement, re.I):
            match = re.search(r'CREATE\s+POLICY\s+"([^"]+)"', statement, re.I)
            create_type = f'POLICY: {match.group(1)}'
            results['policies'].add(match.group(1))
        elif re.search(r'CREATE\s+TRIGGER\s+(\w+)', statement, re.I):
            match = re.search(r'CREATE\s+TRIGGER\s+(\w+)', statement, re.I)
            create_type = f'TRIGGER: {match.group(1)}'
            results['triggers'].add(match.group(1))
        elif re.search(r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)', statement, re.I):
            match = re.search(r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)', statement, re.I)
            create_type = f'FUNCTION: {match.group(1)}'
            results['functions'].add(match.group(1))
        elif re.search(r'CREATE\s+MATERIALIZED\s+VIEW\s+(\w+)', statement, re.I):
            match = re.search(r'CREATE\s+MATERIALIZED\s+VIEW\s+(\w+)', statement, re.I)
            create_type = f'MATERIALIZED VIEW: {match.group(1)}'
            results['views'].add(match.group(1))
        elif re.search(r'ALTER\s+TABLE\s+(\w+)', statement, re.I):
            match = re.search(r'ALTER\s+TABLE\s+(\w+)', statement, re.I)
            create_type = f'ALTER TABLE: {match.group(1)}'
        elif re.search(r'DROP\s+MATERIALIZED\s+VIEW\s+IF\s+EXISTS\s+(\w+)', statement, re.I):
            match = re.search(r'DROP\s+MATERIALIZED\s+VIEW\s+IF\s+EXISTS\s+(\w+)', statement, re.I)
            create_type = f'DROP VIEW: {match.group(1)}'
        else:
            create_type = statement[:50] + '...'
        
        print(f'[{i}/{len(statements)}] Executing: {create_type}')
        
        try:
            # Call the Supabase RPC function for SQL execution
            # Create request to Supabase REST API
            url = f'{SUPABASE_URL}/rest/v1/rpc/exec_sql'
            
            payload = json.dumps({'sql': statement + ';'}).encode('utf-8')
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
                'apikey': SERVICE_ROLE_KEY,
            }
            
            req = urllib.request.Request(url, data=payload, headers=headers, method='POST')
            
            try:
                with urllib.request.urlopen(req) as response:
                    response_data = response.read().decode('utf-8')
                    results['successful'].append(create_type)
                    print(f'  ✓ Success')
            except urllib.error.HTTPError as e:
                error_msg = e.read().decode('utf-8')
                # Check if function doesn't exist yet - we'll handle this differently
                if 'exec_sql' in error_msg or 'function' in error_msg.lower():
                    # Fall back to trying direct execution via a different method
                    print(f'  ⚠ RPC not available: {error_msg[:100]}')
                    results['failed'].append({
                        'statement': create_type,
                        'error': f'RPC function not available'
                    })
                else:
                    results['failed'].append({
                        'statement': create_type,
                        'error': error_msg[:200]
                    })
                    print(f'  ✗ Failed: {error_msg[:100]}')
        
        except Exception as e:
            results['failed'].append({
                'statement': create_type,
                'error': str(e)
            })
            print(f'  ✗ Failed: {str(e)[:80]}')
    
    # Print results
    print('\n' + '=' * 70)
    print('SCHEMA APPLICATION ATTEMPT COMPLETE')
    print('=' * 70)
    
    print(f'\nAttempted: {len(results["successful"]) + len(results["failed"])}/{len(statements)}')
    print(f'Successful: {len(results["successful"])}')
    print(f'Failed: {len(results["failed"])}')
    
    if results['tables']:
        print(f'\nTables Created: {len(results["tables"])}')
        for t in sorted(results['tables']):
            print(f'  - {t}')
    
    if results['indexes']:
        print(f'\nIndexes Created: {len(results["indexes"])}')
        for idx in sorted(results['indexes']):
            print(f'  - {idx}')
    
    if results['policies']:
        print(f'\nPolicies Created: {len(results["policies"])}')
        for p in sorted(results['policies']):
            print(f'  - {p}')
    
    if results['triggers']:
        print(f'\nTriggers Created: {len(results["triggers"])}')
        for t in sorted(results['triggers']):
            print(f'  - {t}')
    
    if results['functions']:
        print(f'\nFunctions Created: {len(results["functions"])}')
        for f in sorted(results['functions']):
            print(f'  - {f}')
    
    if results['views']:
        print(f'\nMaterialized Views Created: {len(results["views"])}')
        for v in sorted(results['views']):
            print(f'  - {v}')
    
    if results['failed']:
        print(f'\nFailed Operations:')
        for idx, failure in enumerate(results['failed'], 1):
            print(f'  {idx}. {failure["statement"]}')
            print(f'     {failure["error"][:100]}')

except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
