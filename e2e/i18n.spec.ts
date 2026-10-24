import { test, expect } from './helpers/test';

test('/en/ has lang en and English UI', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.locator('h1')).toHaveText('Visual math');
});

test('/de/ has lang de, German title and description', async ({ page }) => {
	await page.goto('/de/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('h1')).toHaveText('Mathe sehen');
	await expect(page).toHaveTitle(/Mathe sehen/);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		'content',
		'Mathe-Konzepte, die du sehen, ziehen und verstehen kannst.'
	);
});

test('switcher keeps the step URL across locales', async ({ page }) => {
	await page.goto('/en/high-school/unit-circle/cosine/');
	await page.getByTestId('locale-de').click();
	await page.waitForURL('**/de/high-school/unit-circle/cosine/');
	await expect(page.locator('h1')).toHaveText('Einheitskreis');
	expect(await page.evaluate(() => localStorage.getItem('dm-locale'))).toBe('de');
	await page.getByTestId('locale-en').click();
	await page.waitForURL('**/en/high-school/unit-circle/cosine/');
});
