import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3001',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'e2e/support/e2e.ts',
        videosFolder: 'e2e/videos',
        screenshotsFolder: 'e2e/screenshots',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 10000
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
        specPattern: 'components/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'e2e/support/component.ts'
    }
})
