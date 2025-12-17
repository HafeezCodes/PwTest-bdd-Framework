// ==========================================
// playwright.config.js
// ==========================================

const { defineConfig } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

const testDir = '.features-gen';

const bddConfig = defineBddConfig({
  featuresRoot: './features',
  features: ['**/*.feature'],
  steps: ['./steps/**/*.js'],
  importTestFrom: './Support/fixtures.js',
  outputDir: testDir,
  disableWarnings: { importTestFrom: true },
});

module.exports = defineConfig({
  ...bddConfig,
  testDir: testDir,
  use: {
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],
});
