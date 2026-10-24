import { test, expect } from './helpers/test';
import { conceptRoutes } from '../scripts/concept-routes.mjs';

test('en catalog shows live and soon cards', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.locator('h1')).toHaveText('Visual math');
	await expect(page.getByRole('heading', { level: 2, name: 'High School' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'University' })).toBeVisible();
	const card = page.locator('a[data-testid="concept-card"]');
	await expect(card).toHaveCount(conceptRoutes().length);
	await expect(card.first()).toHaveAttribute('href', '/en/high-school/unit-circle/');
	await expect(card.first()).toContainText('Unit circle');
	await expect(card.first().locator('svg').first()).toBeVisible();
	const soon = page.locator('[data-testid="soon-card"]');
	await expect(soon).toHaveCount(3);
	for (const [i, name] of ['Functions', 'Limits', 'Derivatives'].entries()) {
		const s = soon.nth(i);
		await expect(s).toContainText(name);
		await expect(s).toContainText('Soon');
		await expect(s).not.toHaveAttribute('aria-disabled');
		await expect(s.locator('a')).toHaveCount(0);
		await expect(s.locator('xpath=ancestor::a')).toHaveCount(0);
		await expect(s.locator('svg').first()).toBeVisible();
	}
	await expect(page.locator('[data-testid="later-card"]')).toContainText('Coming later');
});

test('card opens concept and back link returns', async ({ page }) => {
	await page.goto('/en/');
	await page.locator('a[data-testid="concept-card"]').first().click();
	await expect(page).toHaveURL(/\/en\/high-school\/unit-circle\/$/);
	await expect(page.locator('h1')).toHaveText('Unit circle');
	await page.locator('header').getByRole('link', { name: 'Catalog' }).locator('visible=true').click();
	await expect(page).toHaveURL(/\/en\/$/);
	await expect(page.locator('h1')).toHaveText('Visual math');
});

test('de catalog is translated', async ({ page }) => {
	await page.goto('/de/');
	await expect(page.getByRole('heading', { level: 2, name: 'Oberstufe' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Universität' })).toBeVisible();
	await expect(page.locator('[data-testid="soon-card"]').first()).toContainText('Bald');
	const card = page.locator('a[data-testid="concept-card"]');
	await expect(card.first()).toContainText('Einheitskreis');
	await expect(card.first()).toHaveAttribute('href', '/de/high-school/unit-circle/');
});

test('grid layout adapts', async ({ page }) => {
	await page.goto('/en/');
	const vw = page.viewportSize()!.width;
	const tops = await page
		.locator('[data-testid="concept-card"], [data-testid="soon-card"]')
		.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
	expect(tops.length).toBeGreaterThanOrEqual(4);
	if (vw >= 1024) {
		for (const t of tops.slice(0, 4)) expect(Math.abs(t - tops[0])).toBeLessThanOrEqual(2);
	} else if (vw < 640) {
		for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
	}
});
