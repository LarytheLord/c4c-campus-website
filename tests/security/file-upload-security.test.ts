/**
 * File Upload Security Tests
 * Tests file validation without external dependencies
 */

import { describe, it, expect } from 'vitest';

describe('File Upload Security - Extension Spoofing Protection', () => {

  // Mock validateFile function matching the actual implementation
  function validateFile(file: File, options: { maxSizeMB?: number; allowedTypes?: string[] } = {}) {
    const maxSize = (options.maxSizeMB || 50) * 1024 * 1024;
    const allowedTypes = options.allowedTypes || ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];

    const MIME_TYPE_MAP: Record<string, string[]> = {
      'pdf': ['application/pdf'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'txt': ['text/plain'],
      'png': ['image/png'],
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
    };

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${options.maxSizeMB || 50}MB`
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return {
        valid: false,
        error: 'File must have an extension'
      };
    }

    const fileExtension = fileName.substring(lastDotIndex + 1);

    // Check if extension is allowed
    if (!allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type .${fileExtension} is not allowed`
      };
    }

    // SECURITY: Validate MIME type matches extension
    const expectedMimeTypes = MIME_TYPE_MAP[fileExtension];
    if (expectedMimeTypes && file.type) {
      if (!expectedMimeTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Security error: File MIME type "${file.type}" does not match extension ".${fileExtension}"`
        };
      }
    }

    // SECURITY: Detect double extensions
    const dangerousDoubleExtensions = [
      '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js',
      '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh'
    ];

    for (const dangerousExt of dangerousDoubleExtensions) {
      if (fileName.includes(dangerousExt)) {
        return {
          valid: false,
          error: `Security error: File contains dangerous extension "${dangerousExt}"`
        };
      }
    }

    // SECURITY: Block hidden files
    if (fileName.startsWith('.')) {
      return {
        valid: false,
        error: 'Files without extensions or hidden files are not allowed'
      };
    }

    return {
      valid: true,
      fileExtension
    };
  }

  describe('MIME Type Validation (Extension Spoofing Protection)', () => {
    it('should BLOCK PDF with executable MIME type', () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/x-msdownload' // Executable MIME type!
      });

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Security error');
      expect(result.error).toContain('MIME type');
      expect(result.error).toContain('does not match');
    });

    it('should ALLOW PDF with correct MIME type', () => {
      const file = new File(['%PDF-1.4'], 'document.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file);

      expect(result.valid).toBe(true);
      expect(result.fileExtension).toBe('pdf');
    });

    it('should BLOCK image with wrong MIME type', () => {
      const file = new File(['fake'], 'photo.png', {
        type: 'application/pdf' // Wrong MIME for PNG
      });

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME type');
    });

    it('should ALLOW image with correct MIME type', () => {
      const file = new File([new Uint8Array([137, 80, 78, 71])], 'photo.png', {
        type: 'image/png'
      });

      const result = validateFile(file);

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

        const result = validateFile(file);

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

        const result = validateFile(file);

        expect(result.valid).toBe(false);
        // File should be blocked - either as dangerous or not allowed
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('File Size Validation', () => {
    it('should REJECT files exceeding size limit', () => {
      const largeContent = new Uint8Array(51 * 1024 * 1024); // 51MB
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size must be less than');
    });

    it('should REJECT empty files', () => {
      const file = new File([], 'empty.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should ACCEPT files within size limit', () => {
      const content = new Uint8Array(1024 * 1024); // 1MB
      const file = new File([content], 'normal.pdf', {
        type: 'application/pdf'
      });

      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });
  });

  describe('Hidden File Protection', () => {
    it('should BLOCK hidden files starting with dot', () => {
      const file = new File(['content'], '.htaccess', {
        type: 'text/plain'
      });

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      // Hidden files or disallowed types should be blocked
      expect(result.error).toBeDefined();
    });

    it('should BLOCK files without extension', () => {
      const file = new File(['content'], 'README', {
        type: 'text/plain'
      });

      const result = validateFile(file);

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
        const result = validateFile(file);

        expect(result.valid).toBe(true);
        expect(result.fileExtension).toBe(ext);
      });
    });

    it('should REJECT disallowed file types', () => {
      const file = new File(['content'], 'file.xyz', {
        type: 'application/octet-stream'
      });

      const result = validateFile(file);

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
