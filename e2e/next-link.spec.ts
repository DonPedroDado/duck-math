import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { conceptRoutes } from '../scripts/concept-routes.mjs';

/** Catalog order for high-school concepts: `order:` from each index.ts, as the registry sorts them. */
function ordered() {
	return conceptRoutes()
		.filter((r) => r.category === 'high-school')
		.map((r) => {
			const src = fs.readFileSync(`src/concepts/${r.category}/${r.id}/index.ts`, 'utf8');
			const order = Number(src.match(/order:\s*(\d+)/)?.[1] ?? 0);
			return { ...r, order };
		})
		.sort((a, b) => a.order - b.order);
}

const U = '/high-school/unit-circle/';

test('last step offers the next concept or back to catalog (en)', async ({ page }) => {
	await page.goto(`/en${U}sine/`);
	const link = page.getByTestId('next-link');
	await expect(link).toBeVisible();
	const list = ordered();
	const next = list[list.findIndex((r) => r.id === 'unit-circle') + 1];
	if (next) {
		await expect(link).toHaveAttribute('href', `/en${next.path}`);
	} else {
		await expect(link).toHaveAttribute('href', '/en/');
		await expect(link).toContainText('Back to catalog');
	}
});

test('earlier steps reserve the row without a link', async ({ page }) => {
	await page.goto(`/en${U}cosine/`);
	await expect(page.getByTestId('next-row')).toBeAttached();
	await expect(page.getByTestId('next-link')).toHaveCount(0);
});

test('de link text', async ({ page }) => {
	await page.goto(`/de${U}sine/`);
	const link = page.getByTestId('next-link');
	await expect(link).toBeVisible();
	const text = (await link.textContent())?.trim() ?? '';
	expect(text.startsWith('Weiter:') || text.startsWith('Zurück zum Katalog')).toBe(true);
});
