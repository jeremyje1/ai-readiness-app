import { defineConfig } from "cypress"

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3001",
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
        supportFile: "cypress/support/e2e.ts"
    },
    video: false
})
