/**
 * File Upload Security Tests
 * Tests file validation using the real implementation
 */

import { describe, it, expect } from 'vitest';
import { validateFile } from '@/lib/file-upload';

// Default options for tests
const defaultOptions = {
  maxSizeMB: 50,
  allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg']
};

describe('File Upload Security - Extension Spoofing Protection', () => {
  describe('MIME Type Validation (Extension Spoofing Protection)', () => {
    it('should BLOCK PDF with executable MIME type', () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/x-msdownload' // Executable MIME type!
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Security error');
      expect(result.error).toContain('MIME type');
      expect(result.error).toContain('does not match');
    });

    it('should ALLOW PDF with correct MIME type', () => {
      const file = new File(['%PDF-1.4'], 'document.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(true);
      expect(result.fileExtension).toBe('pdf');
    });

    it('should BLOCK image with wrong MIME type', () => {
      const file = new File(['fake'], 'photo.png', {
        type: 'application/pdf' // Wrong MIME for PNG
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME type');
    });

    it('should ALLOW image with correct MIME type', () => {
      const file = new File([new Uint8Array([137, 80, 78, 71])], 'photo.png', {
        type: 'image/png'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(true);
    });
  });

  describe('Double Extension Detection', () => {
    const testCases = [
      { name: 'document.pdf.exe', desc: 'PDF with EXE extension' },
      { name: 'report.doc.scr', desc: 'DOC with SCR extension' },
      { name: 'photo.jpg.exe', desc: 'JPG with EXE extension' },
      { name: 'data.txt.bat', desc: 'TXT with BAT extension' },
      { name: 'archive.zip.exe', desc: 'ZIP with EXE extension' },
    ];

    testCases.forEach(({ name, desc }) => {
      it(`should BLOCK ${desc}`, () => {
        const file = new File(['content'], name, {
          type: 'application/octet-stream'
        });

        const result = validateFile(file, defaultOptions);

        expect(result.valid).toBe(false);
        // File should be blocked either by dangerous extension check or disallowed type
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Dangerous Extension Blocking', () => {
    const dangerousExtensions = [
      '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs',
      '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh'
    ];

    dangerousExtensions.forEach(ext => {
      it(`should BLOCK files containing ${ext}`, () => {
        const file = new File(['content'], `malicious${ext}`, {
          type: 'application/octet-stream'
        });

        const result = validateFile(file, defaultOptions);

        expect(result.valid).toBe(false);
        // File should be blocked - either as dangerous or not allowed
        expect(result.error).toBeDefined();
      });
    });

    // Test uppercase/mixed case dangerous extensions
    it('should BLOCK uppercase dangerous extensions', () => {
      const file = new File(['content'], 'malware.EXE', {
        type: 'application/octet-stream'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous extension');
    });

    it('should BLOCK mixed case dangerous extensions', () => {
      const file = new File(['content'], 'malware.ExE', {
        type: 'application/octet-stream'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous extension');
    });
  });

  describe('Benign Filenames with Dangerous Substrings', () => {
    // These filenames contain dangerous extension substrings but should be ALLOWED
    // because the dangerous string is not an actual extension segment
    const benignCases = [
      { name: 'executable_report.pdf', desc: 'contains "exe" in base name' },
      { name: 'batch_process_results.pdf', desc: 'contains "bat" in base name' },
      { name: 'command_guide.pdf', desc: 'contains "cmd" in base name' },
      { name: 'comparison_chart.pdf', desc: 'contains "com" in base name' },
      { name: 'javascript_notes.pdf', desc: 'contains "js" in base name' },
      { name: 'shell_script_guide.pdf', desc: 'contains "sh" in base name' },
    ];

    benignCases.forEach(({ name, desc }) => {
      it(`should ALLOW ${name} (${desc})`, () => {
        const file = new File(['%PDF-1.4'], name, {
          type: 'application/pdf'
        });

        const result = validateFile(file, defaultOptions);

        expect(result.valid).toBe(true);
        expect(result.fileExtension).toBe('pdf');
      });
    });
  });

  describe('File Size Validation', () => {
    it('should REJECT files exceeding size limit', () => {
      const largeContent = new Uint8Array(51 * 1024 * 1024); // 51MB
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should REJECT empty files', () => {
      const file = new File([], 'empty.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should ACCEPT files within size limit', () => {
      const content = new Uint8Array(1024 * 1024); // 1MB
      const file = new File([content], 'normal.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(true);
    });
  });

  describe('Hidden File Protection', () => {
    it('should BLOCK hidden files starting with dot', () => {
      const file = new File(['content'], '.htaccess', {
        type: 'text/plain'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Hidden files are not allowed');
    });

    it('should BLOCK files without extension', () => {
      const file = new File(['content'], 'README', {
        type: 'text/plain'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must have an extension');
    });
  });

  describe('Allowed File Types', () => {
    const allowedCases = [
      { name: 'document.pdf', type: 'application/pdf', ext: 'pdf' },
      { name: 'photo.png', type: 'image/png', ext: 'png' },
      { name: 'image.jpg', type: 'image/jpeg', ext: 'jpg' },
      { name: 'notes.txt', type: 'text/plain', ext: 'txt' },
    ];

    allowedCases.forEach(({ name, type, ext }) => {
      it(`should ALLOW ${ext} files with correct MIME type`, () => {
        const file = new File(['content'], name, { type });
        const result = validateFile(file, defaultOptions);

        expect(result.valid).toBe(true);
        expect(result.fileExtension).toBe(ext);
      });
    });

    it('should REJECT disallowed file types', () => {
      const file = new File(['content'], 'file.xyz', {
        type: 'application/octet-stream'
      });

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('is not allowed');
    });
  });
});

describe('Malware Scanner - Pattern Detection', () => {

  function detectMalwarePatterns(buffer: ArrayBuffer, fileName: string): { clean: boolean; threat?: string } {
    const content = Buffer.from(buffer).toString('binary');

    // EICAR test file
    if (content.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
      return { clean: false, threat: 'EICAR-Test-File' };
    }

    // PE executable header
    if (content.startsWith('MZ')) {
      return { clean: false, threat: 'PE-Executable-Header' };
    }

    // Double extensions in filename
    const doubleExtensions = ['.pdf.exe', '.doc.exe', '.jpg.exe', '.png.exe', '.txt.exe'];
    for (const ext of doubleExtensions) {
      if (fileName.toLowerCase().includes(ext)) {
        return { clean: false, threat: 'Double-Extension-Attack' };
      }
    }

    return { clean: true };
  }

  describe('EICAR Test File Detection', () => {
    it('should detect EICAR standard test file', () => {
      const eicarString = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
      const buffer = new TextEncoder().encode(eicarString).buffer;

      const result = detectMalwarePatterns(buffer, 'eicar.txt');

      expect(result.clean).toBe(false);
      expect(result.threat).toBe('EICAR-Test-File');
    });

    it('should pass clean text file', () => {
      const cleanContent = 'This is a clean text file with no malware.';
      const buffer = new TextEncoder().encode(cleanContent).buffer;

      const result = detectMalwarePatterns(buffer, 'clean.txt');

      expect(result.clean).toBe(true);
      expect(result.threat).toBeUndefined();
    });
  });

  describe('Executable Header Detection', () => {
    it('should detect PE executable header', () => {
      const mzHeader = 'MZ\x90\x00';
      const buffer = new TextEncoder().encode(mzHeader).buffer;

      const result = detectMalwarePatterns(buffer, 'fake-document.pdf');

      expect(result.clean).toBe(false);
      expect(result.threat).toBe('PE-Executable-Header');
    });

    it('should pass PDF file', () => {
      const pdfHeader = '%PDF-1.4\n';
      const buffer = new TextEncoder().encode(pdfHeader).buffer;

      const result = detectMalwarePatterns(buffer, 'document.pdf');

      expect(result.clean).toBe(true);
    });
  });

  describe('Double Extension in Filename', () => {
    it('should detect .pdf.exe in filename', () => {
      const content = 'fake content';
      const buffer = new TextEncoder().encode(content).buffer;

      const result = detectMalwarePatterns(buffer, 'document.pdf.exe');

      expect(result.clean).toBe(false);
      expect(result.threat).toBe('Double-Extension-Attack');
    });

    it('should detect .jpg.exe in filename', () => {
      const content = 'fake image';
      const buffer = new TextEncoder().encode(content).buffer;

      const result = detectMalwarePatterns(buffer, 'photo.jpg.exe');

      expect(result.clean).toBe(false);
      expect(result.threat).toBe('Double-Extension-Attack');
    });
  });
});
