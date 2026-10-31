import { defineConfig, devices } from '@playwright/test'

// Point at a real deployment with E2E_BASE_URL=https://… npm run test:e2e.
// Without it, the test builds the app and runs it locally with `vite preview`.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173'

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
      },
})
