/**
 * Database Schema Validation Script
 *
 * Connects to the live database and validates that the actual schema
 * matches the expected schema defined in schema.sql.
 *
 * Usage:
 *   npm run db:validate
 *
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string (required)
 *                  Format: postgresql://user:pass@host:port/dbname
 *
 * Exit Codes:
 *   0 - Validation passed (no errors)
 *   1 - Validation failed (errors found)
 *
 * The script checks:
 *   - All expected tables exist
 *   - All expected columns exist with correct data types
 *   - Foreign key constraints are properly defined
 *   - Indexes are created (warning only if missing)
 *
 * This complements 'npm run db:types:check' which validates TypeScript
 * types against schema.sql (without connecting to the database).
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type normalization map for comparing SQL types
const TYPE_NORMALIZATION = {
  'bigserial': 'bigint',
  'serial': 'integer',
  'timestamptz': 'timestamp with time zone',
  'timestamp with time zone': 'timestamp with time zone',
  'timestamp without time zone': 'timestamp without time zone',
  'varchar': 'character varying',
  'int': 'integer',
  'int4': 'integer',
  'int8': 'bigint',
  'bool': 'boolean',
  'float8': 'double precision',
  'float4': 'real',
  'text': 'text',
  'uuid': 'uuid',
  'jsonb': 'jsonb',
  'json': 'json',
  'date': 'date',
  'time': 'time without time zone',
  'timetz': 'time with time zone',
  'numeric': 'numeric',
  'decimal': 'numeric',
  'bytea': 'bytea',
  'inet': 'inet',
  'cidr': 'cidr',
  'macaddr': 'macaddr',
  'interval': 'interval',
  'point': 'point',
  'line': 'line',
  'lseg': 'lseg',
  'box': 'box',
  'path': 'path',
  'polygon': 'polygon',
  'circle': 'circle',
};

/**
 * Split column definitions on commas, but only at parentheses depth zero.
 * This prevents breaking on commas inside type definitions like numeric(10,2) or point(0,0).
 */
function splitColumnsPreservingParens(block) {
  const parts = [];
  let current = '';
  let depth = 0;

  for (const char of block) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Push any remaining text
  if (current) {
    parts.push(current);
  }

  return parts;
}

/**
 * Normalize SQL type for comparison
 */
function normalizeType(type) {
  if (!type) return '';
  const lower = type.toLowerCase().trim();

  // Handle array types
  if (lower.endsWith('[]')) {
    const baseType = lower.slice(0, -2);
    return (TYPE_NORMALIZATION[baseType] || baseType) + '[]';
  }

  // Handle types with precision/scale like varchar(255) or numeric(10,2)
  const baseMatch = lower.match(/^(\w+)(?:\s*\([^)]+\))?$/);
  if (baseMatch) {
    const baseType = baseMatch[1];
    return TYPE_NORMALIZATION[baseType] || lower;
  }

  return TYPE_NORMALIZATION[lower] || lower;
}

/**
 * Fetch actual database schema from information_schema
 */
async function fetchDatabaseSchema(client) {
  const schema = { tables: {} };

  // Query tables
  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  for (const row of tablesResult.rows) {
    const tableName = row.table_name;
    schema.tables[tableName] = {
      columns: {},
      foreignKeys: [],
      indexes: []
    };

    // Query columns for this table
    const columnsResult = await client.query(`
      SELECT
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    for (const col of columnsResult.rows) {
      schema.tables[tableName].columns[col.column_name] = {
        dataType: col.data_type,
        udtName: col.udt_name,
        isNullable: col.is_nullable,
        hasDefault: col.column_default !== null
      };
    }
  }

  // Query foreign keys
  const fkResult = await client.query(`
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);

  for (const fk of fkResult.rows) {
    if (schema.tables[fk.table_name]) {
      schema.tables[fk.table_name].foreignKeys.push({
        constraintName: fk.constraint_name,
        column: fk.column_name,
        referencesTable: fk.foreign_table_name,
        referencesColumn: fk.foreign_column_name,
        onDelete: fk.delete_rule
      });
    }
  }

  // Query indexes
  const indexResult = await client.query(`
    SELECT
      indexname,
      tablename,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);

  for (const idx of indexResult.rows) {
    if (schema.tables[idx.tablename]) {
      schema.tables[idx.tablename].indexes.push({
        name: idx.indexname,
        definition: idx.indexdef
      });
    }
  }

  return schema;
}

/**
 * Parse schema.sql to extract expected schema
 */
function parseSchemaSQL(content) {
  const schema = { tables: {} };

  // Remove comments
  const cleanContent = content
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Parse CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(cleanContent)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];

    schema.tables[tableName] = {
      columns: {},
      foreignKeys: [],
      indexes: []
    };

    // Parse column definitions using parentheses-aware splitting
    const lines = splitColumnsPreservingParens(columnsBlock).map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      // Skip constraint definitions
      if (/^\s*(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT)/i.test(line)) {
        // Parse standalone FOREIGN KEY constraints
        const fkMatch = line.match(/FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)(?:\s+ON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION))?/i);
        if (fkMatch) {
          schema.tables[tableName].foreignKeys.push({
            column: fkMatch[1],
            referencesTable: fkMatch[2],
            referencesColumn: fkMatch[3],
            onDelete: fkMatch[4] ? fkMatch[4].toUpperCase().replace(/\s+/g, ' ') : 'NO ACTION'
          });
        }
        continue;
      }

      // Parse column definition
      const colMatch = line.match(/^(\w+)\s+([A-Za-z0-9_\s()[\],]+?)(?:\s+(NOT\s+NULL|NULL))?(?:\s+(DEFAULT\s+.+?))?(?:\s+(PRIMARY\s+KEY))?(?:\s+REFERENCES\s+(\w+)\s*\((\w+)\)(?:\s+ON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION))?)?$/i);

      if (colMatch) {
        const columnName = colMatch[1];
        let dataType = colMatch[2].trim();
        const notNull = colMatch[3] && /NOT\s+NULL/i.test(colMatch[3]);
        const hasDefault = !!colMatch[4];
        const referencesTable = colMatch[6];
        const referencesColumn = colMatch[7];
        const onDelete = colMatch[8];

        schema.tables[tableName].columns[columnName] = {
          dataType: normalizeType(dataType),
          isNullable: notNull ? 'NO' : 'YES',
          hasDefault: hasDefault || /SERIAL/i.test(dataType)
        };

        // Inline foreign key reference
        if (referencesTable) {
          schema.tables[tableName].foreignKeys.push({
            column: columnName,
            referencesTable: referencesTable,
            referencesColumn: referencesColumn,
            onDelete: onDelete ? onDelete.toUpperCase().replace(/\s+/g, ' ') : 'NO ACTION'
          });
        }
      }
    }
  }

  // Parse CREATE INDEX statements
  const indexRegex = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(?:public\.)?(\w+)/gi;

  while ((match = indexRegex.exec(cleanContent)) !== null) {
    const indexName = match[1];
    const tableName = match[2];

    if (schema.tables[tableName]) {
      schema.tables[tableName].indexes.push({
        name: indexName,
        definition: match[0]
      });
    }
  }

  return schema;
}

/**
 * Compare actual database schema with expected schema from schema.sql
 */
function compareSchemas(actualSchema, expectedSchema) {
  const errors = [];
  const warnings = [];

  // Check for missing tables
  for (const tableName of Object.keys(expectedSchema.tables)) {
    if (!actualSchema.tables[tableName]) {
      errors.push({
        type: 'MISSING_TABLE',
        table: tableName,
        message: `Table "${tableName}" expected but not found in database`
      });
      continue;
    }

    const expectedTable = expectedSchema.tables[tableName];
    const actualTable = actualSchema.tables[tableName];

    // Check for missing columns
    for (const columnName of Object.keys(expectedTable.columns)) {
      if (!actualTable.columns[columnName]) {
        errors.push({
          type: 'MISSING_COLUMN',
          table: tableName,
          column: columnName,
          message: `Column "${columnName}" expected in table "${tableName}" but not found in database`
        });
        continue;
      }

      const expectedCol = expectedTable.columns[columnName];
      const actualCol = actualTable.columns[columnName];

      // Check data type mismatch
      // For USER-DEFINED types (e.g., enums), use udtName instead of dataType
      const expectedType = normalizeType(expectedCol.dataType);
      const actualTypeString = actualCol.dataType.toLowerCase() === 'user-defined'
        ? actualCol.udtName
        : actualCol.dataType;
      const actualType = normalizeType(actualTypeString);

      if (expectedType !== actualType) {
        // Allow some flexibility for serial types which become integer/bigint in DB
        const isSerialMatch =
          (expectedType === 'bigint' && actualType === 'bigint') ||
          (expectedType === 'integer' && actualType === 'integer');

        if (!isSerialMatch) {
          errors.push({
            type: 'TYPE_MISMATCH',
            table: tableName,
            column: columnName,
            expected: expectedType,
            actual: actualType,
            message: `Column "${tableName}.${columnName}" has type "${actualType}" but expected "${expectedType}"`
          });
        }
      }

      // Check nullability mismatch
      if (expectedCol.isNullable !== actualCol.isNullable) {
        warnings.push({
          type: 'NULLABILITY_MISMATCH',
          table: tableName,
          column: columnName,
          expected: expectedCol.isNullable,
          actual: actualCol.isNullable,
          message: `Column "${tableName}.${columnName}" nullability is "${actualCol.isNullable}" but expected "${expectedCol.isNullable}"`
        });
      }
    }

    // Check for extra columns in database (not in schema.sql)
    for (const columnName of Object.keys(actualTable.columns)) {
      if (!expectedTable.columns[columnName]) {
        warnings.push({
          type: 'EXTRA_COLUMN',
          table: tableName,
          column: columnName,
          message: `Column "${columnName}" found in table "${tableName}" but not defined in schema.sql`
        });
      }
    }

    // Check for missing foreign keys
    for (const expectedFk of expectedTable.foreignKeys) {
      const actualFk = actualTable.foreignKeys.find(
        fk => fk.column === expectedFk.column &&
              fk.referencesTable === expectedFk.referencesTable &&
              fk.referencesColumn === expectedFk.referencesColumn
      );

      if (!actualFk) {
        errors.push({
          type: 'MISSING_FOREIGN_KEY',
          table: tableName,
          column: expectedFk.column,
          referencesTable: expectedFk.referencesTable,
          referencesColumn: expectedFk.referencesColumn,
          message: `Missing FK constraint on "${tableName}.${expectedFk.column}" -> "${expectedFk.referencesTable}(${expectedFk.referencesColumn})"`
        });
      } else if (actualFk.onDelete !== expectedFk.onDelete) {
        warnings.push({
          type: 'ON_DELETE_MISMATCH',
          table: tableName,
          column: expectedFk.column,
          expected: expectedFk.onDelete,
          actual: actualFk.onDelete,
          message: `FK on "${tableName}.${expectedFk.column}" has ON DELETE "${actualFk.onDelete}" but expected "${expectedFk.onDelete}"`
        });
      }
    }

    // Check for missing indexes
    for (const expectedIdx of expectedTable.indexes) {
      const actualIdx = actualTable.indexes.find(idx => idx.name === expectedIdx.name);

      if (!actualIdx) {
        warnings.push({
          type: 'MISSING_INDEX',
          table: tableName,
          index: expectedIdx.name,
          message: `Index "${expectedIdx.name}" expected on table "${tableName}" but not found`
        });
      }
    }
  }

  // Check for extra tables in database (not in schema.sql)
  for (const tableName of Object.keys(actualSchema.tables)) {
    if (!expectedSchema.tables[tableName]) {
      // Skip system/internal tables
      if (!tableName.startsWith('_') && !tableName.startsWith('pg_')) {
        warnings.push({
          type: 'EXTRA_TABLE',
          table: tableName,
          message: `Table "${tableName}" found in database but not defined in schema.sql`
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Report validation results to console
 */
function reportResults(comparison, actualSchema, expectedSchema) {
  console.log('\nDatabase Schema Validation');
  console.log('='.repeat(60));

  const actualTableCount = Object.keys(actualSchema.tables).length;
  const expectedTableCount = Object.keys(expectedSchema.tables).length;

  console.log(`\n--- Tables Check ---`);
  console.log(`Database tables: ${actualTableCount}`);
  console.log(`Expected tables: ${expectedTableCount}`);

  // Group errors and warnings by type
  const missingTables = comparison.errors.filter(e => e.type === 'MISSING_TABLE');
  const missingColumns = comparison.errors.filter(e => e.type === 'MISSING_COLUMN');
  const typeMismatches = comparison.errors.filter(e => e.type === 'TYPE_MISMATCH');
  const missingFKs = comparison.errors.filter(e => e.type === 'MISSING_FOREIGN_KEY');

  if (missingTables.length > 0) {
    console.log(`\n--- Missing Tables (${missingTables.length}) ---`);
    for (const err of missingTables) {
      console.log(`  \x1b[31m✗ ERROR:\x1b[0m ${err.message}`);
    }
  }

  if (missingColumns.length > 0) {
    console.log(`\n--- Missing Columns (${missingColumns.length}) ---`);
    for (const err of missingColumns) {
      console.log(`  \x1b[31m✗ ERROR:\x1b[0m ${err.table}.${err.column} - Column missing in database`);
    }
  }

  if (typeMismatches.length > 0) {
    console.log(`\n--- Type Mismatches (${typeMismatches.length}) ---`);
    for (const err of typeMismatches) {
      console.log(`  \x1b[31m✗ ERROR:\x1b[0m ${err.message}`);
    }
  }

  if (missingFKs.length > 0) {
    console.log(`\n--- Missing Foreign Keys (${missingFKs.length}) ---`);
    for (const err of missingFKs) {
      console.log(`  \x1b[31m✗ ERROR:\x1b[0m ${err.message}`);
    }
  }

  // Report warnings
  const missingIndexes = comparison.warnings.filter(w => w.type === 'MISSING_INDEX');
  const nullabilityMismatches = comparison.warnings.filter(w => w.type === 'NULLABILITY_MISMATCH');
  const onDeleteMismatches = comparison.warnings.filter(w => w.type === 'ON_DELETE_MISMATCH');
  const extraColumns = comparison.warnings.filter(w => w.type === 'EXTRA_COLUMN');
  const extraTables = comparison.warnings.filter(w => w.type === 'EXTRA_TABLE');

  if (missingIndexes.length > 0) {
    console.log(`\n--- Missing Indexes (${missingIndexes.length}) ---`);
    for (const warn of missingIndexes) {
      console.log(`  \x1b[33m⚠ WARNING:\x1b[0m ${warn.message}`);
    }
  }

  if (nullabilityMismatches.length > 0) {
    console.log(`\n--- Nullability Mismatches (${nullabilityMismatches.length}) ---`);
    for (const warn of nullabilityMismatches) {
      console.log(`  \x1b[33m⚠ WARNING:\x1b[0m ${warn.message}`);
    }
  }

  if (onDeleteMismatches.length > 0) {
    console.log(`\n--- ON DELETE Mismatches (${onDeleteMismatches.length}) ---`);
    for (const warn of onDeleteMismatches) {
      console.log(`  \x1b[33m⚠ WARNING:\x1b[0m ${warn.message}`);
    }
  }

  if (extraColumns.length > 0) {
    console.log(`\n--- Extra Columns in Database (${extraColumns.length}) ---`);
    for (const warn of extraColumns) {
      console.log(`  \x1b[33m⚠ WARNING:\x1b[0m ${warn.message}`);
    }
  }

  if (extraTables.length > 0) {
    console.log(`\n--- Extra Tables in Database (${extraTables.length}) ---`);
    for (const warn of extraTables) {
      console.log(`  \x1b[33m⚠ WARNING:\x1b[0m ${warn.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  const errorCount = comparison.errors.length;
  const warningCount = comparison.warnings.length;

  if (errorCount === 0 && warningCount === 0) {
    console.log('\x1b[32m✓ Schema validation passed!\x1b[0m');
  } else {
    console.log(`Summary: ${errorCount} error(s), ${warningCount} warning(s)`);
  }

  if (errorCount > 0) {
    console.log(`
To fix schema mismatches:
1. Backup database: npm run db:backup
2. Apply migration: npm run db:migrate
   OR
3. Reset database (DESTRUCTIVE): npm run db:reset

Run 'npm run db:types' after fixing to regenerate TypeScript types.`);
  }

  console.log('');
}

/**
 * Main validation function
 * Returns exit code: 0 for success, 1 for failure
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('\x1b[31mError: DATABASE_URL environment variable is not set.\x1b[0m');
    console.error('');
    console.error('Set DATABASE_URL to your PostgreSQL connection string:');
    console.error('  export DATABASE_URL="postgresql://user:pass@host:port/dbname"');
    console.error('');
    console.error('Or create a .env file with DATABASE_URL defined.');
    return 1;
  }

  // Mask password in URL for display
  const maskedUrl = databaseUrl.replace(/:([^@:]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUrl}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false }
  });

  let exitCode = 0;

  try {
    await client.connect();
    console.log('Connected to database.');

    // Fetch actual database schema
    console.log('Fetching database schema...');
    const actualSchema = await fetchDatabaseSchema(client);

    // Read and parse schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error(`\x1b[31mError: schema.sql not found at ${schemaPath}\x1b[0m`);
      exitCode = 1;
      return exitCode;
    }

    console.log('Parsing schema.sql...');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const expectedSchema = parseSchemaSQL(schemaContent);

    // Compare schemas
    console.log('Comparing schemas...');
    const comparison = compareSchemas(actualSchema, expectedSchema);

    // Report results
    reportResults(comparison, actualSchema, expectedSchema);

    // Set exit code based on validation results
    exitCode = comparison.errors.length > 0 ? 1 : 0;

  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to the database. Is PostgreSQL running?');
    } else if (error.code === '28P01') {
      console.error('Authentication failed. Check your DATABASE_URL credentials.');
    }
    exitCode = 1;
  } finally {
    await client.end();
  }

  return exitCode;
}

main().then(code => process.exit(code)).catch(() => process.exit(1));
