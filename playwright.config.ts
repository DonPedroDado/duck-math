import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: BASE,
		trace: 'retain-on-failure',
		launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}
	},
	webServer: {
		command: `npm run build && node scripts/serve-build.mjs ${PORT}`,
		url: `${BASE}/en/`,
		reuseExistingServer: false,
		timeout: 180_000
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{
			name: 'mobile',
			use: { ...devices['Pixel 7'] },
			testMatch: ['skeleton.spec.ts', 'catalog.spec.ts', 'notfound.spec.ts', 'mobile.spec.ts']
		}
	]
});
