import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const IDS = ['intro', 'angle', 'radian', 'radians', 'cosine', 'sine'];
const ENDS = ['2.00', '4.50', '8.50', '10.50', '13.00', '15.50'];
const concept = (page: Page) => page.getByTestId('concept');
const U = '/en/high-school/unit-circle/';

for (const l of ['en', 'de']) {
	IDS.forEach((id, i) => {
		test(`deep link ${l} ${id}`, async ({ page }) => {
			await page.goto(`/${l}/high-school/unit-circle/${id}/`);
			const c = concept(page);
			await expect(c).toHaveAttribute('data-step', id);
			await expect(c).toHaveAttribute('data-playing', 'false');
			await expect(c).toHaveAttribute('data-t', ENDS[i]);
			await expect(page.getByTestId('step-counter')).toHaveText(
				l === 'en' ? `Step ${i + 1} of 6` : `Schritt ${i + 1} von 6`
			);
			expect(fs.existsSync(`build/${l}/high-school/unit-circle/${id}/index.html`)).toBe(true);
		});
	});
}

test('deep link base opens intro', async ({ page }) => {
	await page.goto(U);
	await expect(concept(page)).toHaveAttribute('data-step', 'intro');
});

test('history: next pushes, back/forward restore without reload', async ({ page }) => {
	await page.goto(U);
	await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));
	const c = concept(page);
	await page.getByTestId('player-next').click();
	await expect(page).toHaveURL(/\/en\/high-school\/unit-circle\/angle\/$/);
	await expect(c).toHaveAttribute('data-playing', 'false', { timeout: 8000 });
	await page.getByTestId('player-next').click();
	await expect(page).toHaveURL(/\/radian\/$/);
	await page.goBack();
	await expect(page).toHaveURL(/\/angle\/$/);
	await expect(c).toHaveAttribute('data-step', 'angle');
	await expect(c).toHaveAttribute('data-t', '4.50');
	await expect(c).toHaveAttribute('data-playing', 'false');
	await page.goBack();
	await expect(page).toHaveURL(/\/en\/high-school\/unit-circle\/$/);
	await expect(c).toHaveAttribute('data-step', 'intro');
	await page.goForward();
	await expect(page).toHaveURL(/\/angle\/$/);
	expect(await page.evaluate(() => (window as unknown as { __marker: number }).__marker)).toBe(1);
});

test('history: scrub replaces, tick pushes', async ({ page }) => {
	await page.goto(U);
	const len = () => page.evaluate(() => history.length);
	const h0 = await len();
	await page.getByTestId('scrubber').focus();
	await page.keyboard.press('End');
	await expect(page).toHaveURL(/\/en\/high-school\/unit-circle\/sine\/$/);
	expect(await len()).toBe(h0);
	await page.getByTestId('scrubber-tick-cosine').click();
	await expect(page).toHaveURL(/\/cosine\/$/);
	expect(await len()).toBe(h0 + 1);
});

test('locale switch keeps the step', async ({ page }) => {
	await page.goto(U);
	await page.getByTestId('player-next').click();
	await expect(page).toHaveURL(/\/angle\/$/);
	await page.getByTestId('locale-de').click();
	await expect(page).toHaveURL(/\/de\/high-school\/unit-circle\/angle\/$/);
	await expect(concept(page)).toHaveAttribute('data-step', 'angle');
});

test('reload keeps the step', async ({ page }) => {
	await page.goto('/de/high-school/unit-circle/cosine/');
	await page.reload();
	await expect(concept(page)).toHaveAttribute('data-step', 'cosine');
});
