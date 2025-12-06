/**
 * Accessibility Audit Script
 * Runs axe-core tests on all pages and generates a report
 *
 * Usage: node scripts/accessibility-audit.js
 * Note: Requires dev server to be running on http://localhost:4321
 */

const fs = require('fs');
const path = require('path');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');

// Pages to audit
const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/apply', name: 'Apply Page' },
  { path: '/about', name: 'About Page' },
  { path: '/programs', name: 'Programs Page' },
  { path: '/tracks', name: 'Tracks Page' },
  { path: '/framework', name: 'Framework Page' },
  { path: '/faq', name: 'FAQ Page' },
  { path: '/contact', name: 'Contact Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/application-status', name: 'Application Status Page' },
];

const baseUrl = 'http://localhost:4321';

// WCAG 2.1 AA standards
const axeOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  }
};

async function auditPage(browser, pageObj, pageName) {
  console.log(`\nAuditing: ${pageName}`);
  console.log('─'.repeat(50));

  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}${pageObj.path}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run axe
    const results = await new AxePuppeteer(page)
      .options(axeOptions)
      .analyze();

    // Summary
    console.log(`✓ Passed: ${results.passes.length} rules`);
    console.log(`✗ Violations: ${results.violations.length} rules`);
    console.log(`⚠ Incomplete: ${results.incomplete.length} rules`);
    console.log(`ℹ Inapplicable: ${results.inapplicable.length} rules`);

    await page.close();

    return {
      page: pageName,
      path: pageObj.path,
      url: `${baseUrl}${pageObj.path}`,
      passes: results.passes.length,
      violations: results.violations,
      incomplete: results.incomplete,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error auditing ${pageName}:`, error.message);
    await page.close();
    return {
      page: pageName,
      path: pageObj.path,
      error: error.message
    };
  }
}

async function generateReport(results) {
  const timestamp = new Date().toISOString();
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const totalIncomplete = results.reduce((sum, r) => sum + (r.incomplete?.length || 0), 0);

  // Create markdown report
  let report = `# Accessibility Audit Report\n\n`;
  report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
  report += `**WCAG Level:** 2.1 AA\n\n`;
  report += `## Summary\n\n`;
  report += `- **Pages Audited:** ${results.length}\n`;
  report += `- **Total Violations:** ${totalViolations}\n`;
  report += `- **Total Incomplete Tests:** ${totalIncomplete}\n`;
  report += `- **Overall Status:** ${totalViolations === 0 ? '✓ PASS' : '✗ FAIL'}\n\n`;

  report += `## Results by Page\n\n`;

  for (const result of results) {
    if (result.error) {
      report += `### ${result.page}\n\n`;
      report += `**Error:** ${result.error}\n\n`;
      continue;
    }

    report += `### ${result.page}\n\n`;
    report += `- **URL:** ${result.url}\n`;
    report += `- **Passed Rules:** ${result.passes}\n`;
    report += `- **Violations:** ${result.violations.length}\n`;
    report += `- **Incomplete Tests:** ${result.incomplete.length}\n\n`;

    if (result.violations.length > 0) {
      report += `#### Violations (${result.violations.length})\n\n`;

      for (const violation of result.violations) {
        report += `**${violation.id}** - ${violation.help}\n`;
        report += `- **Impact:** ${violation.impact}\n`;
        report += `- **Description:** ${violation.description}\n`;
        report += `- **WCAG:** ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}\n`;
        report += `- **Affected Elements:** ${violation.nodes.length}\n`;

        // Show first 3 affected elements
        const nodesToShow = violation.nodes.slice(0, 3);
        for (const node of nodesToShow) {
          report += `  - \`${node.html}\`\n`;
          if (node.failureSummary) {
            report += `    - ${node.failureSummary.split('\n')[0]}\n`;
          }
        }

        if (violation.nodes.length > 3) {
          report += `  - ... and ${violation.nodes.length - 3} more\n`;
        }

        report += `\n`;
      }
    }

    if (result.incomplete.length > 0) {
      report += `#### Incomplete Tests (${result.incomplete.length})\n\n`;
      report += `These require manual review:\n\n`;

      for (const incomplete of result.incomplete) {
        report += `- **${incomplete.id}**: ${incomplete.help}\n`;
      }
      report += `\n`;
    }

    report += `---\n\n`;
  }

  // Add recommendations
  report += `## Common Issues & Fixes\n\n`;
  report += `### Color Contrast\n`;
  report += `- Ensure text has at least 4.5:1 contrast ratio\n`;
  report += `- Large text (18pt+/14pt+ bold) needs at least 3:1\n`;
  report += `- Use tools like WebAIM Contrast Checker\n\n`;

  report += `### Keyboard Navigation\n`;
  report += `- All interactive elements must be keyboard accessible\n`;
  report += `- Provide visible focus indicators\n`;
  report += `- Ensure logical tab order\n\n`;

  report += `### ARIA Labels\n`;
  report += `- All form inputs need associated labels\n`;
  report += `- Buttons need descriptive accessible names\n`;
  report += `- Use ARIA landmarks for page structure\n\n`;

  report += `### Images\n`;
  report += `- Provide alt text for content images\n`;
  report += `- Use empty alt="" for decorative images\n`;
  report += `- Describe the function for linked images\n\n`;

  return report;
}

async function main() {
  console.log('Starting Accessibility Audit...\n');
  console.log(`Auditing ${pages.length} pages against WCAG 2.1 AA standards\n`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];

    for (const pageInfo of pages) {
      const result = await auditPage(browser, pageInfo, pageInfo.name);
      results.push(result);
    }

    // Generate report
    const report = await generateReport(results);

    // Ensure docs directory exists
    const docsDir = path.join(__dirname, '..', 'docs', 'accessibility');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save report
    const reportPath = path.join(docsDir, 'audit-report.md');
    fs.writeFileSync(reportPath, report);

    console.log('\n' + '='.repeat(50));
    console.log('Audit Complete!');
    console.log('='.repeat(50));
    console.log(`\nReport saved to: ${reportPath}`);

    // Also save JSON for programmatic access
    const jsonPath = path.join(docsDir, 'audit-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`JSON results saved to: ${jsonPath}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { auditPage, generateReport };
