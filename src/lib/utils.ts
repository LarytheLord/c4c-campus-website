/**
 * General Utility Functions
 */

/**
 * Converts a string to a URL-safe slug.
 * Handles special characters, multiple spaces, and unicode.
 */
export function slugify(text: string): string {
  if (text === null || text === undefined) {
    throw new Error('Input cannot be null or undefined');
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    // Allow unicode letters (\p{L}) and numbers (\p{N}), plus hyphens
    // Remove everything else
    .replace(/[^\p{L}\p{N}\-]+/gu, '') 
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

/**
 * Formats seconds into a human-readable string (e.g., "2h 30m").
 */
export function formatDuration(seconds: number): string {
  if (seconds === null || seconds === undefined) {
    throw new Error('Duration cannot be null or undefined');
  }
  if (seconds < 0) {
    throw new Error('Duration must be non-negative');
  }
  if (!Number.isInteger(seconds)) {
    throw new Error('Duration must be an integer');
  }

  if (seconds === 0) return '0h 0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  // We ignore seconds for this format as per tests (3661 -> 1h 1m)

  return `${hours}h ${minutes}m`;
}

/**
 * Calculates percentage progress.
 */
export function calculateProgress(completed: number, total: number): number {
  if (!Number.isInteger(completed) || !Number.isInteger(total)) {
    throw new Error('Values must be integers');
  }
  if (completed < 0 || total < 0) {
    throw new Error('Values must be non-negative');
  }
  if (completed > total) {
    throw new Error('Completed cannot exceed total');
  }
  if (total === 0) return 0;

  return Math.round((completed / total) * 100);
}

/**
 * Exports data to a CSV file and triggers a download in the browser.
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Determine headers
  const columnHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvRows = [
    columnHeaders.join(','), // Header row
    ...data.map(row => {
      return columnHeaders.map(header => {
        const value = row[header];
        
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        
        // Handle objects/arrays
        let stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        // Escape quotes and wrap in quotes if contains comma, newline or quote
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          stringValue = `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',');
    })
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
