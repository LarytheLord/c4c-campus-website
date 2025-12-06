/**
 * Tests for CSV Export Utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from '../../src/lib/utils';

describe('exportToCSV', () => {
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock DOM methods
    clickSpy = vi.fn();
    const mockLink = {
      setAttribute: vi.fn(),
      style: { visibility: '' },
      click: clickSpy
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Mock URL methods
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error for empty data array', () => {
    expect(() => exportToCSV([], 'test')).toThrow('No data to export');
  });

  it('throws error for null data', () => {
    expect(() => exportToCSV(null as any, 'test')).toThrow('No data to export');
  });

  it('creates CSV with correct headers from data keys', () => {
    const data = [
      { name: 'John', age: 30, email: 'john@example.com' }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
    const blob = createObjectURLSpy.mock.calls[0][0];
    expect(blob.type).toBe('text/csv;charset=utf-8;');
  });

  it('uses custom column headers when provided', () => {
    const data = [
      { name: 'John', age: 30, email: 'john@example.com', city: 'NYC' }
    ];

    exportToCSV(data, 'test', ['name', 'email']);

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('exports multiple rows correctly', () => {
    const data = [
      { name: 'John', score: 95 },
      { name: 'Jane', score: 87 },
      { name: 'Bob', score: 92 }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('escapes values with commas', () => {
    const data = [
      { name: 'Doe, John', email: 'john@example.com' }
    ];

    exportToCSV(data, 'test');

    // The value with comma should be wrapped in quotes
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('escapes values with quotes', () => {
    const data = [
      { name: 'John "The Boss" Doe', email: 'john@example.com' }
    ];

    exportToCSV(data, 'test');

    // Quotes should be doubled and wrapped
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles null and undefined values', () => {
    const data = [
      { name: 'John', age: null, email: undefined }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles newlines in values', () => {
    const data = [
      { name: 'John', notes: 'Line 1\nLine 2' }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('sets correct filename with .csv extension', () => {
    const data = [{ name: 'John' }];
    const filename = 'student-data';

    exportToCSV(data, filename);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    // The setAttribute call should include the filename
    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('triggers download by clicking link', () => {
    const data = [{ name: 'John' }];

    exportToCSV(data, 'test');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('cleans up DOM and URL after download', () => {
    const data = [{ name: 'John' }];

    exportToCSV(data, 'test');

    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('handles boolean values', () => {
    const data = [
      { name: 'John', active: true, verified: false }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles number values', () => {
    const data = [
      { name: 'John', age: 30, score: 95.5 }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles array values by converting to string', () => {
    const data = [
      { name: 'John', tags: ['student', 'active'] }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles object values by converting to string', () => {
    const data = [
      { name: 'John', metadata: { level: 'intermediate' } }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('maintains column order with custom headers', () => {
    const data = [
      { email: 'john@example.com', name: 'John', age: 30 }
    ];

    exportToCSV(data, 'test', ['name', 'age', 'email']);

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles empty string values', () => {
    const data = [
      { name: '', email: 'john@example.com' }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('handles special characters in values', () => {
    const data = [
      { name: 'José García', email: 'jose@example.com', note: 'Über cool!' }
    ];

    exportToCSV(data, 'test');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });
});
