import { test, expect } from './helpers/test';

test('de unknown step is a localized 404', async ({ page }) => {
	const res = await page.goto('/de/high-school/unit-circle/foo/');
	expect(res!.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('Seite nicht gefunden');
	await expect(page.locator('main')).toContainText('existiert nicht');
	await expect(page.getByRole('link', { name: 'Zurück zum Katalog' })).toHaveAttribute('href', '/de/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('en unknown step and path', async ({ page }) => {
	await page.goto('/en/high-school/unit-circle/foo/');
	await expect(page.locator('h1')).toHaveText('Page not found');
	await expect(page.getByRole('link', { name: 'Back to catalog' })).toHaveAttribute('href', '/en/');
	await page.goto('/en/nope/');
	await expect(page.locator('h1')).toHaveText('Page not found');
});

test('unknown path is not reflected', async ({ page }) => {
	await page.goto('/en/<script>x</script>/');
	await expect(page.locator('h1')).toHaveText('Page not found');
	await expect(page.locator('main script')).toHaveCount(0);
	expect(await page.locator('body').innerText()).not.toContain('<script>');
});
