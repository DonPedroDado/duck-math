import { test, expect, type Page } from '@playwright/test';

async function drag(page: Page, fromDeg: number, toDeg: number) {
	const b = (await page.locator('[data-testid="stage"]').boundingBox())!;
	const R = b.width / 3;
	const cx = b.x + b.width / 2;
	const cy = b.y + b.height / 2;
	const at = (d: number) => ({
		x: cx + R * Math.cos((d * Math.PI) / 180),
		y: cy - R * Math.sin((d * Math.PI) / 180)
	});
	const a = at(fromDeg);
	const z = at(toDeg);
	await page.mouse.move(a.x, a.y);
	await page.mouse.down();
	await page.mouse.move(z.x, z.y, { steps: 10 });
	await page.mouse.up();
}

test('makes no cross-origin requests', async ({ page }) => {
	const origin = new URL(test.info().project.use.baseURL!).origin;
	const urls: string[] = [];
	page.on('request', (r) => urls.push(r.url()));
	await page.goto('/en/');
	await page.goto('/en/high-school/unit-circle/angle/');
	await page.waitForLoadState('networkidle');
	for (const u of urls) {
		if (u.startsWith('data:') || u.startsWith('blob:')) continue;
		expect(new URL(u).origin).toBe(origin);
	}
});

test('catalog links to the unit circle', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.locator('h1')).toHaveText('Visual math');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('link', { name: /Unit circle/ }).click();
	await expect(page).toHaveURL(/\/en\/high-school\/unit-circle\/$/);
	await expect(page.locator('[data-testid="stage"]')).toBeVisible();
});

test('dragging the point updates the readout (EN)', async ({ page }) => {
	await page.goto('/en/high-school/unit-circle/angle/');
	const readout = page.locator('[data-testid="theta-readout"]');
	await expect(readout).toHaveText('60°');
	await drag(page, 60, 135);
	await expect(readout).toHaveText(/^13[456]°$/);
});

test('dragging uses locale formatting (DE)', async ({ page }) => {
	await page.goto('/de/high-school/unit-circle/angle/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('h1')).toHaveText('Einheitskreis');
	await drag(page, 60, 100.4);
	const readout = page.locator('[data-testid="theta-readout"]');
	await expect(readout).toHaveText(/^\d{2,3}(,\d)?°$/);
	expect(await readout.textContent()).not.toContain('.');
});

test('locale switcher navigates and stores dm-locale', async ({ page }) => {
	await page.goto('/de/');
	await expect(page.locator('h1')).toHaveText('Mathe sehen');
	await page.getByTestId('locale-en').click();
	await expect(page).toHaveURL(/\/en\/$/);
	expect(await page.evaluate(() => localStorage.getItem('dm-locale'))).toBe('en');
});
