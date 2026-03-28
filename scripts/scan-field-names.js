#!/usr/bin/env node
/**
 * Field Name Scanner
 *
 * Scans the codebase for database field references and validates against schema.sql.
 * Detects mismatches between code usage and schema definitions.
 *
 * Usage:
 *   npm run db:field-names:check
 *
 * The script will:
 * 1. Parse schema.sql to extract table and column definitions
 * 2. Scan src/ files for Supabase query patterns
 * 3. Extract field names from queries and compare against schema
 * 4. Report mismatches with file path and line number
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, '..', 'schema.sql');
const GENERATED_TYPES_PATH = path.join(__dirname, '..', 'src', 'types', 'generated.ts');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Directories to scan
const SCAN_DIRS = [
  'pages/api',
  'components',
  'lib',
  'pages',
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Tables defined in schema.sql (will be populated dynamically)
let SCHEMA_TABLES = {};

// Common camelCase to snake_case mappings
const COMMON_MISMATCHES = {
  'userId': 'user_id',
  'courseId': 'course_id',
  'lessonId': 'lesson_id',
  'moduleId': 'module_id',
  'cohortId': 'cohort_id',
  'quizId': 'quiz_id',
  'assignmentId': 'assignment_id',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'enrolledAt': 'enrolled_at',
  'completedAt': 'completed_at',
  'startDate': 'start_date',
  'endDate': 'end_date',
  'maxStudents': 'max_students',
  'timeLimitMinutes': 'time_limit_minutes',
  'timeLimit': 'time_limit_minutes',
  'maxAttempts': 'max_attempts',
  'passingScore': 'passing_score',
  'isPublished': 'is_published',
  'orderIndex': 'order_index',
  'dueDate': 'due_date',
  'maxPoints': 'max_points',
  'fileUrl': 'file_url',
  'fileName': 'file_name',
  'fileSize': 'file_size_bytes',
  'fileSizeBytes': 'file_size_bytes',
  'fileType': 'file_type',
  'submissionNumber': 'submission_number',
  'submittedAt': 'submitted_at',
  'gradedAt': 'graded_at',
  'gradedBy': 'graded_by',
  'isLate': 'is_late',
  'attemptNumber': 'attempt_number',
  'startedAt': 'started_at',
  'questionType': 'question_type',
  'questionText': 'question_text',
  'correctAnswer': 'correct_answer',
  'answerExplanation': 'answer_explanation',
  'fullName': 'full_name',
  'displayName': 'display_name',
  'avatarUrl': 'avatar_url',
  'thumbnailUrl': 'thumbnail_url',
  'videoUrl': 'video_url',
  'durationMinutes': 'duration_minutes',
  'isPreview': 'is_preview',
  'isCohortBased': 'is_cohort_based',
  'enrollmentType': 'enrollment_type',
  'defaultDurationWeeks': 'default_duration_weeks',
  'allowLateSubmissions': 'allow_late_submissions',
  'allowResubmission': 'allow_resubmission',
  'maxSubmissions': 'max_submissions',
  'latePenaltyPercent': 'late_penalty_percent',
  'maxFileSizeMb': 'max_file_size_mb',
  'allowedFileTypes': 'allowed_file_types',
  'randomizeQuestions': 'randomize_questions',
  'showCorrectAnswers': 'show_correct_answers',
  'showResultsImmediately': 'show_results_immediately',
  'availableFrom': 'available_from',
  'availableUntil': 'available_until',
  'totalPoints': 'total_points',
  'pointsEarned': 'points_earned',
  'timeTakenSeconds': 'time_taken_seconds',
  'answersJson': 'answers_json',
  'gradingStatus': 'grading_status',
  'rubricScores': 'rubric_scores',
  'submissionText': 'submission_text',
  'completedLessons': 'completed_lessons',
  'lastActivityAt': 'last_activity_at',
  'progressPercentage': 'progress_percentage',
  'unlockDate': 'unlock_date',
  'lockDate': 'lock_date',
  'videoPositionSeconds': 'video_position_seconds',
  'timeSpentSeconds': 'time_spent_seconds',
  'watchCount': 'watch_count',
  'lastAccessedAt': 'last_accessed_at',
};

// Fields to ignore (TypeScript keywords, common variables, etc.)
const IGNORE_FIELDS = new Set([
  'id', 'data', 'error', 'count', 'message', 'success', 'result', 'response',
  'status', 'type', 'value', 'key', 'index', 'item', 'items', 'length',
  'name', 'title', 'description', 'content', 'text', 'body', 'headers',
  'params', 'query', 'path', 'url', 'method', 'code', 'details',
  'true', 'false', 'null', 'undefined', 'string', 'number', 'boolean',
  'any', 'void', 'never', 'unknown', 'object', 'array', 'function',
  'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
  'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super',
  'class', 'interface', 'type', 'enum', 'export', 'import', 'from',
  'default', 'extends', 'implements', 'public', 'private', 'protected',
  'static', 'readonly', 'abstract', 'as', 'is', 'in', 'of', 'instanceof',
  'typeof', 'keyof', 'infer', 'satisfies', 'module', 'namespace',
  'declare', 'global', 'asserts', 'package', 'yield', 'debugger',
  'with', 'switch', 'case', 'break', 'continue', 'do', 'finally',
  'rows', 'row', 'cols', 'col', 'column', 'columns', 'table', 'tables',
  'select', 'insert', 'update', 'delete', 'from', 'where', 'order',
  'limit', 'offset', 'join', 'left', 'right', 'inner', 'outer', 'on',
  'and', 'or', 'not', 'in', 'is', 'like', 'between', 'exists', 'all',
  'score', 'points', 'options', 'answers', 'passed', 'feedback',
  'progress', 'metadata', 'preferences', 'resources', 'rubric_scores',
  'answers_json', 'file_urls', // JSONB fields are more flexible
]);

// Patterns that look like field names but are not database columns
const IGNORE_PATTERNS = [
  /^on[A-Z]/, // Event handlers like onClick, onChange
  /^handle[A-Z]/, // Handler functions
  /^get[A-Z]/, // Getter functions
  /^set[A-Z]/, // Setter functions
  /^is[A-Z][a-z]/, // Boolean checks like isValid
  /^has[A-Z]/, // Boolean checks like hasError
  /^use[A-Z]/, // React hooks
  /^render[A-Z]/, // Render functions
  /^fetch[A-Z]/, // Fetch functions
  /^create[A-Z]/, // Create functions
  /^update[A-Z]/, // Update functions
  /^delete[A-Z]/, // Delete functions
  /^load[A-Z]/, // Load functions
  /^save[A-Z]/, // Save functions
  /^[A-Z][a-z]+Component$/, // Component names
  /^[A-Z][a-z]+Props$/, // Props types
  /^[A-Z][a-z]+State$/, // State types
  /^_/, // Private/internal variables
  /^\$/, // Special variables
  /^\w+!\w+$/, // Supabase join modifiers like modules!inner, courses!left
];

/**
 * Parse schema.sql to extract table and column definitions
 */
function parseSchema(content) {
  const tables = {};

  // Match CREATE TABLE statements
  const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;

  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];

    const columns = new Set();

    // Parse column definitions
    const lines = columnsBlock.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip constraints, comments, etc.
      if (!trimmed ||
          trimmed.startsWith('--') ||
          trimmed.startsWith('CONSTRAINT') ||
          trimmed.startsWith('PRIMARY KEY') ||
          trimmed.startsWith('FOREIGN KEY') ||
          trimmed.startsWith('UNIQUE') ||
          trimmed.startsWith('CHECK')) {
        continue;
      }

      // Parse column: name type [constraints]
      const colMatch = trimmed.match(/^(\w+)\s+([A-Za-z_]+)/i);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        // Skip SQL keywords that look like column names
        if (!['primary', 'foreign', 'unique', 'check', 'constraint', 'references', 'on', 'cascade', 'set', 'null', 'default'].includes(colName)) {
          columns.add(colName);
        }
      }
    }

    if (columns.size > 0) {
      tables[tableName] = columns;
    }
  }

  return tables;
}

/**
 * Get all columns across all tables
 */
function getAllColumns(tables) {
  const allColumns = new Set();
  for (const columns of Object.values(tables)) {
    for (const col of columns) {
      allColumns.add(col);
    }
  }
  return allColumns;
}

/**
 * Parse generated.ts to extract column names from Database['public']['Tables'] definitions
 * Returns a Set of column names (lowercase) and a Map of table -> columns for comparison
 */
function parseGeneratedTypes(content) {
  const tables = {};
  const allColumns = new Set();

  // Match table definitions in the format: tableName: { Row: { ... } }
  // We look for patterns like:  column_name: type;
  const tableBlockRegex = /(\w+):\s*\{\s*Row:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;

  let tableMatch;
  while ((tableMatch = tableBlockRegex.exec(content)) !== null) {
    const tableName = tableMatch[1];
    const rowBlock = tableMatch[2];

    const columns = new Set();

    // Extract column names from the Row block
    // Matches patterns like: column_name: type; or column_name?: type;
    const columnRegex = /^\s*(\w+)\??\s*:/gm;
    let colMatch;
    while ((colMatch = columnRegex.exec(rowBlock)) !== null) {
      const colName = colMatch[1].toLowerCase();
      columns.add(colName);
      allColumns.add(colName);
    }

    if (columns.size > 0) {
      tables[tableName] = columns;
    }
  }

  return { tables, allColumns };
}

/**
 * Compare schema.sql columns with generated.ts columns
 * Returns discrepancies found
 */
function compareSchemaWithGeneratedTypes(schemaTables, generatedTables) {
  const discrepancies = [];

  // Check for columns in schema but not in generated types
  for (const [tableName, schemaColumns] of Object.entries(schemaTables)) {
    const generatedColumns = generatedTables[tableName];

    if (!generatedColumns) {
      discrepancies.push({
        type: 'missing_table_in_generated',
        table: tableName,
        message: `Table "${tableName}" exists in schema.sql but not in generated.ts`,
      });
      continue;
    }

    for (const col of schemaColumns) {
      if (!generatedColumns.has(col)) {
        discrepancies.push({
          type: 'missing_column_in_generated',
          table: tableName,
          column: col,
          message: `Column "${col}" in table "${tableName}" exists in schema.sql but not in generated.ts`,
        });
      }
    }
  }

  // Check for columns in generated types but not in schema
  for (const [tableName, generatedColumns] of Object.entries(generatedTables)) {
    const schemaColumns = schemaTables[tableName];

    if (!schemaColumns) {
      // Table in generated.ts but not in schema - could be a view or extension
      continue;
    }

    for (const col of generatedColumns) {
      if (!schemaColumns.has(col)) {
        discrepancies.push({
          type: 'extra_column_in_generated',
          table: tableName,
          column: col,
          message: `Column "${col}" in table "${tableName}" exists in generated.ts but not in schema.sql`,
        });
      }
    }
  }

  return discrepancies;
}

/**
 * Check if a field name should be ignored
 */
function shouldIgnoreField(field) {
  if (IGNORE_FIELDS.has(field)) return true;
  if (IGNORE_FIELDS.has(field.toLowerCase())) return true;

  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(field)) return true;
  }

  return false;
}

/**
 * Compute Levenshtein distance between two strings
 * Used for suggesting closest column name matches
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Find the closest matching column name using Levenshtein distance
 */
function findClosestColumn(field, allColumns, maxDistance = 3) {
  const fieldLower = field.toLowerCase();
  let closest = null;
  let minDistance = Infinity;

  for (const column of allColumns) {
    const distance = levenshteinDistance(fieldLower, column);
    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      closest = column;
    }
  }

  return closest;
}

/**
 * Validate a single field against schema and return issue if found
 */
function validateField(field, allColumns, filePath, lineNumber, type, context) {
  // Skip if field should be ignored
  if (shouldIgnoreField(field)) {
    return null;
  }

  const fieldLower = field.toLowerCase();

  // Check for known camelCase → snake_case mismatches first
  if (COMMON_MISMATCHES[field]) {
    return {
      file: filePath,
      line: lineNumber,
      field,
      suggestion: COMMON_MISMATCHES[field],
      type,
      issueType: 'camelCase',
      context,
    };
  }

  // Check if field exists in schema (case-insensitive)
  if (!allColumns.has(fieldLower)) {
    // Field does not exist in schema - try to suggest a close match
    const suggestion = findClosestColumn(field, allColumns);
    return {
      file: filePath,
      line: lineNumber,
      field,
      suggestion: suggestion || '(no close match found)',
      type,
      issueType: 'notInSchema',
      context,
    };
  }

  return null;
}

/**
 * Parse Supabase select string with nested relations and join modifiers
 *
 * Examples:
 *   'id, name, courses(title, slug)'
 *     → ['id', 'name', 'title', 'slug']
 *
 *   'id, modules!inner(title, order_index, lessons(name))'
 *     → ['id', 'title', 'order_index', 'name']
 *
 *   '*, courses!left(title, id), cohorts(name, start_date)'
 *     → ['title', 'id', 'name', 'start_date']  (excludes '*')
 *
 * @param {string} selectStr - The select string from .select('...')
 * @returns {string[]} - Array of field names to validate
 */
function parseNestedSelect(selectStr) {
  const fields = [];
  let currentToken = '';
  let depth = 0;
  let nestedContent = '';

  for (let i = 0; i < selectStr.length; i++) {
    const char = selectStr[i];

    if (char === '(') {
      if (depth === 0) {
        // Starting a nested selection - currentToken is the table name (possibly with !modifier)
        // We don't add the table name to fields, only the nested fields
        currentToken = '';
      } else {
        nestedContent += char;
      }
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        // End of nested selection - recursively parse the nested content
        const nestedFields = parseNestedSelect(nestedContent);
        fields.push(...nestedFields);
        nestedContent = '';
        currentToken = '';
      } else {
        nestedContent += char;
      }
    } else if (char === ',' && depth === 0) {
      // Top-level comma - process the current token as a field
      const trimmed = currentToken.trim();
      if (trimmed && trimmed !== '*') {
        // Strip join modifiers like !inner, !left from the token
        // If it has a modifier, it's a table reference, not a field
        if (!trimmed.includes('!')) {
          fields.push(trimmed);
        }
      }
      currentToken = '';
    } else if (depth > 0) {
      nestedContent += char;
    } else {
      currentToken += char;
    }
  }

  // Process the last token
  const trimmed = currentToken.trim();
  if (trimmed && trimmed !== '*') {
    // Strip join modifiers - if it has one, it's a table reference
    if (!trimmed.includes('!')) {
      fields.push(trimmed);
    }
  }

  return fields;
}

/**
 * Extract field names from Supabase query patterns
 */
function extractFieldNames(content, filePath, allColumns) {
  const issues = [];
  const lines = content.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lineNumber = lineNum + 1;

    // Pattern 1: .select('field1, field2, table(field3)')
    const selectMatches = line.matchAll(/\.select\s*\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of selectMatches) {
      const selectStr = match[1];
      // Extract field names using parseNestedSelect which handles:
      // - Nested table selections like courses(title, slug)
      // - Supabase join modifiers like modules!inner(...)
      // - Multiple levels of nesting
      const fields = parseNestedSelect(selectStr);

      for (const field of fields) {
        const issue = validateField(field, allColumns, filePath, lineNumber, 'select', line.trim().substring(0, 80));
        if (issue) {
          issues.push(issue);
        }
      }
    }

    // Pattern 2: .eq('field', value), .neq, .gt, .lt, .gte, .lte, .filter, .order
    const filterPatterns = [
      /\.eq\s*\(\s*['"`](\w+)['"`]/g,
      /\.neq\s*\(\s*['"`](\w+)['"`]/g,
      /\.gt\s*\(\s*['"`](\w+)['"`]/g,
      /\.lt\s*\(\s*['"`](\w+)['"`]/g,
      /\.gte\s*\(\s*['"`](\w+)['"`]/g,
      /\.lte\s*\(\s*['"`](\w+)['"`]/g,
      /\.filter\s*\(\s*['"`](\w+)['"`]/g,
      /\.order\s*\(\s*['"`](\w+)['"`]/g,
      /\.is\s*\(\s*['"`](\w+)['"`]/g,
      /\.in\s*\(\s*['"`](\w+)['"`]/g,
      /\.contains\s*\(\s*['"`](\w+)['"`]/g,
      /\.ilike\s*\(\s*['"`](\w+)['"`]/g,
      /\.like\s*\(\s*['"`](\w+)['"`]/g,
      /\.match\s*\(\s*\{[^}]*['"`]?(\w+)['"`]?\s*:/g,
    ];

    for (const pattern of filterPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const field = match[1];
        const issue = validateField(field, allColumns, filePath, lineNumber, 'filter', line.trim().substring(0, 80));
        if (issue) {
          issues.push(issue);
        }
      }
    }

    // Pattern 3: .insert({ field: value }) or .update({ field: value })
    // Look for object keys in insert/update contexts
    const insertUpdateMatch = line.match(/\.(insert|update|upsert)\s*\(\s*\{/);
    if (insertUpdateMatch) {
      // Extract object keys from this line and potentially following lines
      const objContent = extractObjectContent(lines, lineNum);
      const keyMatches = objContent.matchAll(/['"`]?(\w+)['"`]?\s*:/g);
      for (const keyMatch of keyMatches) {
        const field = keyMatch[1];
        const issue = validateField(field, allColumns, filePath, lineNumber, 'insert/update', line.trim().substring(0, 80));
        if (issue) {
          issues.push(issue);
        }
      }
    }

    // Pattern 4: Object destructuring from Supabase response: const { field1, field2 } = data
    // This is tricky because we need context, so we look for patterns near .from() calls
    // Skip this for now as it can have many false positives
  }

  return issues;
}

/**
 * Extract object content starting from a line (handles multi-line objects)
 */
function extractObjectContent(lines, startLine) {
  let content = '';
  let braceCount = 0;
  let started = false;

  for (let i = startLine; i < Math.min(startLine + 20, lines.length); i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === '{') {
        started = true;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
      if (started) {
        content += char;
      }
      if (started && braceCount === 0) {
        return content;
      }
    }
    if (started) {
      content += '\n';
    }
  }

  return content;
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other non-relevant directories
      if (!['node_modules', '.git', 'dist', 'build', '.next', '.astro'].includes(entry.name)) {
        scanDirectory(fullPath, files);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SCAN_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Main function
 */
function main() {
  console.log('Field Name Scanner\n');
  console.log('='.repeat(50));

  // Parse schema.sql
  let schemaContent;
  try {
    schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  } catch (err) {
    console.error(`Error reading schema.sql: ${err.message}`);
    process.exit(1);
  }

  SCHEMA_TABLES = parseSchema(schemaContent);
  const schemaColumns = getAllColumns(SCHEMA_TABLES);

  console.log(`\nParsed ${Object.keys(SCHEMA_TABLES).length} tables from schema.sql`);
  console.log(`Total unique columns from schema: ${schemaColumns.size}`);

  // Parse generated.ts and compare with schema
  let generatedTypes = { tables: {}, allColumns: new Set() };
  let schemaTypeDiscrepancies = [];

  try {
    const generatedContent = fs.readFileSync(GENERATED_TYPES_PATH, 'utf-8');
    generatedTypes = parseGeneratedTypes(generatedContent);
    console.log(`Parsed ${Object.keys(generatedTypes.tables).length} tables from generated.ts`);
    console.log(`Total unique columns from generated.ts: ${generatedTypes.allColumns.size}`);

    // Compare schema.sql with generated.ts
    schemaTypeDiscrepancies = compareSchemaWithGeneratedTypes(SCHEMA_TABLES, generatedTypes.tables);

    if (schemaTypeDiscrepancies.length > 0) {
      console.log(`\nWARNING: Found ${schemaTypeDiscrepancies.length} discrepancies between schema.sql and generated.ts`);
    }
  } catch (err) {
    console.log(`\nNote: Could not read generated.ts (${err.message})`);
    console.log('Continuing with schema.sql columns only...');
  }

  // Combine columns from both sources for validation
  // This creates a unified set of valid column names
  const allColumns = new Set([...schemaColumns, ...generatedTypes.allColumns]);
  console.log(`Combined allowed columns: ${allColumns.size}`);

  // Collect files to scan
  const filesToScan = [];
  for (const subDir of SCAN_DIRS) {
    const fullDir = path.join(SRC_DIR, subDir);
    scanDirectory(fullDir, filesToScan);
  }

  console.log(`\nScanning ${filesToScan.length} files...`);

  // Scan all files
  const allIssues = [];
  let filesWithIssues = 0;

  for (const filePath of filesToScan) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const issues = extractFieldNames(content, filePath, allColumns);

      if (issues.length > 0) {
        filesWithIssues++;
        allIssues.push(...issues);
      }
    } catch (err) {
      console.error(`Error reading ${filePath}: ${err.message}`);
    }
  }

  // Report schema vs generated.ts discrepancies first
  if (schemaTypeDiscrepancies.length > 0) {
    console.log('\n' + '='.repeat(50));
    console.log(`\nSchema-Types Alignment Issues (${schemaTypeDiscrepancies.length}):\n`);
    console.log('Discrepancies between schema.sql and generated.ts:\n');

    for (const disc of schemaTypeDiscrepancies) {
      console.log(`  - ${disc.message}`);
    }

    console.log('\nTo fix: Run "npm run db:types" to regenerate generated.ts from the database.');
  }

  // Report results
  console.log('\n' + '='.repeat(50));

  if (allIssues.length === 0 && schemaTypeDiscrepancies.length === 0) {
    console.log('\n✓ No field name issues found');
    console.log('\nAll Supabase queries use correct snake_case field names that exist in schema.sql.');
    console.log('Schema and generated types are aligned.');
    process.exit(0);
  }

  if (allIssues.length === 0 && schemaTypeDiscrepancies.length > 0) {
    console.log('\n✓ No field name issues in code');
    console.log('However, schema.sql and generated.ts have discrepancies (see above).');
    process.exit(1);
  }

  // Separate issues by type
  const camelCaseIssues = allIssues.filter(i => i.issueType === 'camelCase');
  const notInSchemaIssues = allIssues.filter(i => i.issueType === 'notInSchema');

  console.log(`\n✗ Found ${allIssues.length} field name issues in ${filesWithIssues} files\n`);

  // Group issues by file
  const issuesByFile = {};
  for (const issue of allIssues) {
    const relPath = path.relative(path.join(__dirname, '..'), issue.file);
    if (!issuesByFile[relPath]) {
      issuesByFile[relPath] = [];
    }
    issuesByFile[relPath].push(issue);
  }

  // Print camelCase → snake_case issues
  if (camelCaseIssues.length > 0) {
    console.log('='.repeat(50));
    console.log(`\ncamelCase → snake_case Issues (${camelCaseIssues.length}):\n`);
    console.log('These fields use camelCase but should use snake_case:\n');

    for (const [file, issues] of Object.entries(issuesByFile)) {
      const camelIssues = issues.filter(i => i.issueType === 'camelCase');
      if (camelIssues.length === 0) continue;

      console.log(`  ${file}:`);
      for (const issue of camelIssues) {
        console.log(`    Line ${issue.line}: "${issue.field}" → "${issue.suggestion}" (${issue.type})`);
        if (issue.context) {
          console.log(`      Context: ${issue.context}...`);
        }
      }
      console.log('');
    }
  }

  // Print "not in schema" issues
  if (notInSchemaIssues.length > 0) {
    console.log('='.repeat(50));
    console.log(`\nField Not Found in schema.sql Issues (${notInSchemaIssues.length}):\n`);
    console.log('These fields do not exist in any table in schema.sql:\n');

    for (const [file, issues] of Object.entries(issuesByFile)) {
      const schemaIssues = issues.filter(i => i.issueType === 'notInSchema');
      if (schemaIssues.length === 0) continue;

      console.log(`  ${file}:`);
      for (const issue of schemaIssues) {
        const suggestionText = issue.suggestion !== '(no close match found)'
          ? ` (did you mean: "${issue.suggestion}"?)`
          : '';
        console.log(`    Line ${issue.line}: "${issue.field}" not found in schema${suggestionText} (${issue.type})`);
        if (issue.context) {
          console.log(`      Context: ${issue.context}...`);
        }
      }
      console.log('');
    }
  }

  // Summary
  console.log('='.repeat(50));
  console.log('\nSummary:');
  console.log(`  Total code issues: ${allIssues.length}`);
  console.log(`  Files affected: ${filesWithIssues}`);
  console.log(`  Schema-types discrepancies: ${schemaTypeDiscrepancies.length}`);
  console.log(`\n  By issue type:`);
  console.log(`    camelCase → snake_case: ${camelCaseIssues.length}`);
  console.log(`    Field not in schema: ${notInSchemaIssues.length}`);
  if (schemaTypeDiscrepancies.length > 0) {
    console.log(`    Schema-types misalignment: ${schemaTypeDiscrepancies.length}`);
  }

  // Count by query type
  const byType = {};
  for (const issue of allIssues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  }
  console.log('\n  By query type:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`    ${type}: ${count}`);
  }

  console.log('\nTo fix these issues:');
  console.log('  1. Use snake_case for all database field names in Supabase queries');
  console.log('  2. Example: .eq("userId", x) → .eq("user_id", x)');
  console.log('  3. Example: { userId: x } → { user_id: x }');
  console.log('  4. Verify field names exist in schema.sql before using in queries');

  // Exit with error if issues found
  process.exit(1);
}

// Export for use in other scripts
export {
  parseSchema,
  parseGeneratedTypes,
  extractFieldNames,
  COMMON_MISMATCHES,
  getAllColumns,
  validateField,
  findClosestColumn,
  levenshteinDistance,
  shouldIgnoreField,
  compareSchemaWithGeneratedTypes,
};

main();
