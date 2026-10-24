import { test, expect } from '@playwright/test';

test.describe('root redirect', () => {
	test.describe('de browser', () => {
		test.use({ locale: 'de-DE' });
		test('goes to /de/', async ({ page }) => {
			await page.goto('/');
			await page.waitForURL('**/de/');
			expect(new URL(page.url()).pathname).toBe('/de/');
		});
		test('stored en preference wins', async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem('dm-locale', 'en'));
			await page.goto('/');
			await page.waitForURL('**/en/');
			expect(new URL(page.url()).pathname).toBe('/en/');
		});
		test('unknown stored value ignored', async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem('dm-locale', 'xx'));
			await page.goto('/');
			await page.waitForURL('**/de/');
			expect(new URL(page.url()).pathname).toBe('/de/');
		});
		test('prototype-key stored value ignored', async ({ page }) => {
			await page.addInitScript(() => localStorage.setItem('dm-locale', 'constructor'));
			await page.goto('/');
			await page.waitForURL('**/de/');
			expect(new URL(page.url()).pathname).toBe('/de/');
		});
	});

	test.describe('en browser', () => {
		test.use({ locale: 'en-US' });
		test('goes to /en/', async ({ page }) => {
			await page.goto('/');
			await page.waitForURL('**/en/');
			expect(new URL(page.url()).pathname).toBe('/en/');
		});
	});

	test.describe('fr browser', () => {
		test.use({ locale: 'fr-FR' });
		test('falls back to /en/', async ({ page }) => {
			await page.goto('/');
			await page.waitForURL('**/en/');
			expect(new URL(page.url()).pathname).toBe('/en/');
		});
	});

	test('no open redirect, keeps query and hash', async ({ page }) => {
		const origin = new URL(test.info().project.use.baseURL!).origin;
		await page.goto('/?next=//evil.example#top');
		await page.waitForURL('**/en/**');
		const u = new URL(page.url());
		expect(u.origin).toBe(origin);
		expect(u.pathname).toBe('/en/');
		expect(u.search).toBe('?next=//evil.example');
		expect(u.hash).toBe('#top');
	});

	test('noscript fallback present', async ({ request }) => {
		const res = await request.get('/');
		const body = await res.text();
		expect(body).toContain('<noscript>');
		expect(body).toContain('<meta http-equiv="refresh" content="0;url=/en/">');
	});
});
