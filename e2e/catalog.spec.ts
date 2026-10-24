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
	await expect(soon).toHaveCount(1);
	for (const [i, name] of ['Derivatives'].entries()) {
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

const ORDER = ['unit-circle', 'tangent', 'sine-cosine-graphs', 'trig-identities', 'function-shifts', 'function-stretches', 'function-combine', 'limit-approach', 'limit-infinity'];
const TITLES = {
	en: ['Unit circle', 'Tangent & friends', 'Sine & cosine graphs', 'Identities & special angles', 'Shifting graphs', 'Stretching & reflecting', 'Combining transformations', 'Approaching a value', 'Limits & infinity'],
	de: ['Einheitskreis', 'Tangens & Co.', 'Sinus- und Kosinuskurve', 'Identitäten & besondere Winkel', 'Graphen verschieben', 'Strecken & Spiegeln', 'Transformationen kombinieren', 'Annäherung an einen Wert', 'Grenzwerte & Unendlich']
};

for (const l of ['en', 'de'] as const) {
	test(`high school order (${l})`, async ({ page }) => {
		await page.goto(`/${l}/`);
		const items = page.locator('.grid').first().locator(':scope > *');
		await expect(items).toHaveCount(ORDER.length + 1);
		for (const [i, id] of ORDER.entries()) {
			const card = items.nth(i);
			await expect(card).toHaveAttribute('data-testid', 'concept-card');
			await expect(card).toHaveAttribute('href', `/${l}/high-school/${id}/`);
			await expect(card).toContainText(TITLES[l][i]);
		}
		for (let i = ORDER.length; i < ORDER.length + 1; i++) {
			await expect(items.nth(i)).toHaveAttribute('data-testid', 'soon-card');
		}
	});
}
