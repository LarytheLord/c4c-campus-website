/**
 * File upload utilities for C4C Campus
 * @module lib/file-upload
 */

import { supabase } from './supabase';

export interface FileValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileExtension?: string;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface DownloadUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Map of file extensions to allowed MIME types
 */
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  // Documents
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  txt: ['text/plain'],
  rtf: ['application/rtf', 'text/rtf'],
  odt: ['application/vnd.oasis.opendocument.text'],
  // Spreadsheets
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  csv: ['text/csv', 'application/csv'],
  ods: ['application/vnd.oasis.opendocument.spreadsheet'],
  // Presentations
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  odp: ['application/vnd.oasis.opendocument.presentation'],
  // Images
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  svg: ['image/svg+xml'],
  bmp: ['image/bmp'],
  // Archives
  zip: ['application/zip', 'application/x-zip-compressed'],
  rar: ['application/vnd.rar', 'application/x-rar-compressed'],
  '7z': ['application/x-7z-compressed'],
  tar: ['application/x-tar'],
  gz: ['application/gzip', 'application/x-gzip'],
};

/**
 * List of dangerous file extensions that should always be blocked (without leading dot)
 * These are blocked if they appear as any segment in a multi-extension filename
 * (e.g., "report.pdf.exe" has segments ["pdf", "exe"], and "exe" triggers a block)
 */
const DANGEROUS_EXTENSIONS = [
  'exe', 'scr', 'bat', 'cmd', 'com', 'pif', 'vbs', 'js',
  'jar', 'app', 'deb', 'rpm', 'dmg', 'pkg', 'sh'
];

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Validate a file against size, type, MIME, and security constraints
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFile(file: File, options: FileValidationOptions): FileValidationResult {
  const { maxSizeMB, allowedTypes } = options;
  const fileName = file.name;
  const fileNameLower = fileName.toLowerCase();

  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  // Check for files without extension (no dot in filename)
  if (!fileName.includes('.')) {
    return {
      valid: false,
      error: 'File must have an extension',
    };
  }

  // Check for hidden files (starting with .)
  if (fileName.startsWith('.')) {
    return {
      valid: false,
      error: 'Hidden files are not allowed',
    };
  }

  const fileExtension = getExtension(fileName);

  // Check for dangerous extensions by splitting filename into dot-separated segments
  // This catches double-extension attacks (e.g., "report.pdf.exe") while avoiding
  // false positives on benign filenames that contain extension substrings
  // (e.g., "executable_report.pdf" should be allowed)
  const segments = fileNameLower.split('.');
  // Skip the first segment (it's the base filename, not an extension)
  const extensionSegments = segments.slice(1);

  for (const segment of extensionSegments) {
    const segmentLower = segment.toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(segmentLower)) {
      return {
        valid: false,
        error: `Security error: File contains dangerous extension ".${segmentLower}"`,
        fileExtension,
      };
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${maxSizeMB}MB)`,
      fileExtension,
    };
  }

  // Check file type against allowed types
  const normalizedTypes = allowedTypes.map(t => t.toLowerCase().replace('.', ''));
  if (!normalizedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type ".${fileExtension}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      fileExtension,
    };
  }

  // Validate MIME type matches extension (when file.type is available)
  if (file.type) {
    const expectedMimeTypes = EXTENSION_MIME_MAP[fileExtension];
    if (expectedMimeTypes && !expectedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Security error: File MIME type "${file.type}" does not match extension ".${fileExtension}"`,
        fileExtension,
      };
    }
  }

  return {
    valid: true,
    fileExtension,
  };
}

/**
 * Format bytes to human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Get icon/emoji for file type
 * @param filename - Filename or extension
 * @returns Icon string
 */
export function getFileIcon(filename: string): string {
  const ext = getExtension(filename).toLowerCase();

  const icons: Record<string, string> = {
    // Documents
    pdf: '\uD83D\uDCC4',
    doc: '\uD83D\uDCDD',
    docx: '\uD83D\uDCDD',
    txt: '\uD83D\uDCC3',
    rtf: '\uD83D\uDCC3',
    odt: '\uD83D\uDCDD',

    // Spreadsheets
    xls: '\uD83D\uDCCA',
    xlsx: '\uD83D\uDCCA',
    csv: '\uD83D\uDCCA',
    ods: '\uD83D\uDCCA',

    // Presentations
    ppt: '\uD83D\uDCBD',
    pptx: '\uD83D\uDCBD',
    odp: '\uD83D\uDCBD',

    // Images
    jpg: '\uD83D\uDDBC\uFE0F',
    jpeg: '\uD83D\uDDBC\uFE0F',
    png: '\uD83D\uDDBC\uFE0F',
    gif: '\uD83D\uDDBC\uFE0F',
    webp: '\uD83D\uDDBC\uFE0F',
    svg: '\uD83D\uDDBC\uFE0F',
    bmp: '\uD83D\uDDBC\uFE0F',

    // Video
    mp4: '\uD83C\uDFA5',
    webm: '\uD83C\uDFA5',
    mov: '\uD83C\uDFA5',
    avi: '\uD83C\uDFA5',
    mkv: '\uD83C\uDFA5',

    // Audio
    mp3: '\uD83C\uDFB5',
    wav: '\uD83C\uDFB5',
    ogg: '\uD83C\uDFB5',
    flac: '\uD83C\uDFB5',

    // Archives
    zip: '\uD83D\uDCE6',
    rar: '\uD83D\uDCE6',
    '7z': '\uD83D\uDCE6',
    tar: '\uD83D\uDCE6',
    gz: '\uD83D\uDCE6',

    // Code
    js: '\uD83D\uDCBB',
    ts: '\uD83D\uDCBB',
    py: '\uD83D\uDCBB',
    html: '\uD83D\uDCBB',
    css: '\uD83D\uDCBB',
    json: '\uD83D\uDCBB',
  };

  return icons[ext] || '\uD83D\uDCC1';
}

/**
 * Default private bucket for assignment submissions.
 * This bucket should be configured in Supabase as non-public with RLS policies.
 */
const DEFAULT_PRIVATE_BUCKET = 'assignment-submissions-private';

/**
 * Upload a file to Supabase Storage (private bucket)
 *
 * Files are stored in a private bucket and accessed via signed URLs only.
 * The returned path should be stored in the database; use getSignedDownloadUrl()
 * to generate time-limited download URLs for authorized users.
 *
 * @param file - File to upload
 * @param userId - User ID
 * @param assignmentId - Assignment ID
 * @param bucket - Storage bucket name (default: 'assignment-submissions-private')
 * @returns Upload result with storage path (no public URL)
 */
export async function uploadFile(
  file: File,
  userId: string,
  assignmentId: string,
  bucket: string = DEFAULT_PRIVATE_BUCKET
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${assignmentId}/${timestamp}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Return only the storage path - no public URL for private buckets
    // Use getSignedDownloadUrl() to generate time-limited download URLs
    return {
      success: true,
      path: data.path,
      // url is intentionally omitted for private bucket storage
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Get a signed download URL for a file in private storage
 *
 * This generates a time-limited signed URL for accessing files in private buckets.
 * Authorization must be checked by the caller before generating the URL.
 *
 * @param filePath - Path to file in storage
 * @param bucket - Storage bucket name (default: 'assignment-submissions-private')
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Download URL result with time-limited signed URL
 */
export async function getSignedDownloadUrl(
  filePath: string,
  bucket: string = DEFAULT_PRIVATE_BUCKET,
  expiresIn: number = 3600
): Promise<DownloadUrlResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate download URL',
    };
  }
}

/**
 * Delete a file from storage
 * @param filePath - Path to file
 * @param bucket - Storage bucket name (default: 'assignment-submissions-private')
 * @returns Success boolean
 */
export async function deleteFile(
  filePath: string,
  bucket: string = DEFAULT_PRIVATE_BUCKET
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    return !error;
  } catch {
    return false;
  }
}
