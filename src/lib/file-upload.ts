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
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Validate a file against size and type constraints
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFile(file: File, options: FileValidationOptions): FileValidationResult {
  const { maxSizeMB, allowedTypes } = options;
  const fileExtension = getExtension(file.name);

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${maxSizeMB}MB)`,
      fileExtension,
    };
  }

  // Check file type
  const normalizedTypes = allowedTypes.map(t => t.toLowerCase().replace('.', ''));
  if (!normalizedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type ".${fileExtension}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      fileExtension,
    };
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
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param userId - User ID
 * @param assignmentId - Assignment ID
 * @param bucket - Storage bucket name (default: 'assignment-submissions')
 * @returns Upload result
 */
export async function uploadFile(
  file: File,
  userId: string,
  assignmentId: string,
  bucket: string = 'assignment-submissions'
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Get a signed download URL for a file
 * @param filePath - Path to file in storage
 * @param bucket - Storage bucket name
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Download URL result
 */
export async function getSignedDownloadUrl(
  filePath: string,
  bucket: string = 'assignment-submissions',
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
 * @param bucket - Storage bucket name
 * @returns Success boolean
 */
export async function deleteFile(
  filePath: string,
  bucket: string = 'assignment-submissions'
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
