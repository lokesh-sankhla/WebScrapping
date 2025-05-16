// @ts-check
import { defineConfig, devices } from '@playwright/test';



/**
 * @see https://playwright.dev/docs/test-configuration
 */
const config = ({
  testDir: './tests',
  timeout: 40 *1000,
  expect: {
    timeout: 40 *1000,
  },
  reporter: 'html',
  use: {
   
    browserName : 'chromium',
    headless : true,
    screenshot : 'on',
    trace : 'retain-on-failure'
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
  
  },

});

module.exports = config
