const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.js',

    timeout: 30000,
    retries: 0,
    workers: 1,
    fullyParallel: false,

    use: {
        baseURL: 'https://www.saucedemo.com',
        headless: false,

        viewport: null,

        actionTimeout: 10000,
        navigationTimeout: 30000,

        trace: 'on-first-retry',

        launchOptions: {
            slowMo: 500,
            args: ['--start-maximized']
        },

        testIdAttribute: 'data-test'
    },

    projects: [
        {
            name: 'chromium',
            use: {},
        }
    ]
});