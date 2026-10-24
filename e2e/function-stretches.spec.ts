import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/function-stretches/';
const concept = (page: Page) => page.getByTestId('concept');
const curve = (page: Page) => page.getByTestId('curve');

async function at(page: Page, u: number, v: number) {
	const s = (await page.getByTestId('stage').boundingBox())!;
	return { x: s.x + ((u + 6) / 12) * s.width, y: s.y + ((6 - v) / 12) * s.height };
}

test('catalog lists stretches after shifts', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.getByTestId('concept-card').nth(5)).toHaveAttribute('href', B);
});

test('vertical: a stretches heights, zeros and the x-axis stay put', async ({ page }) => {
	await page.goto(B + 'vertical/');
	await expect(curve(page)).toHaveAttribute('data-a', '2.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-y', '5.000');
	await expect(page.getByTestId('landmark-zero')).toHaveAttribute('data-x', '1.200');
	await expect(page.getByTestId('landmark-zero')).toHaveAttribute('data-y', '0.000');
	await expect(page.locator('[data-testid="fixed-axis"][data-axis="x"]')).toBeAttached();
	await expect(page.getByTestId('fixed-zero')).toBeAttached();
	// drag the peak handle down to height 2.5: a = 1
	const h = await at(page, -2.5, 5);
	const to = await at(page, -2.5, 2.5);
	await page.mouse.move(h.x, h.y);
	await page.mouse.down();
	await page.mouse.move(to.x, to.y, { steps: 6 });
	await page.mouse.up();
	await expect(curve(page)).toHaveAttribute('data-a', '1.00');
});

test('predict: where does the peak of f(2x) land, then narrower', async ({ page }) => {
	await page.goto(B + 'vertical/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
	await expect(page.getByTestId('predict-question')).toContainText('f(2x)');
	await expect(curve(page)).toHaveAttribute('data-b', '1.00');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	await expect(curve(page)).toHaveAttribute('data-b', '2.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-x', '-1.250');
	await expect(page.getByTestId('landmark-yInt')).toHaveAttribute('data-x', '0.000');
	await expect(page.getByTestId('caption')).toContainText('Narrower');
});

test('reflect-x: the a slider through 0 flips the peak and names −f(x)', async ({ page }) => {
	await page.goto(B + 'reflect-x/');
	await expect(curve(page)).toHaveAttribute('data-a', '-1.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-y', '-2.500');
	await expect(page.getByTestId('formula')).toContainText('g(x)=−f(x)');
	const slider = page.getByRole('slider', { name: 'Vertical stretch a' });
	await slider.fill('0');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-y', '0.000');
	await slider.fill('1');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-y', '2.500');
});

test('reflect-y: f(−x) mirrors in the y-axis; b = 0 stays defined', async ({ page }) => {
	await page.goto(B + 'reflect-y/');
	await expect(curve(page)).toHaveAttribute('data-b', '-1.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-x', '2.500');
	await expect(page.getByTestId('formula')).toContainText('g(x)=f(−x)');
	await page.getByRole('slider', { name: 'Horizontal stretch b' }).fill('0');
	await expect(curve(page)).toHaveAttribute('data-b', '0.00');
	await expect(page.getByTestId('curve').locator('path')).toBeAttached();
});

test('explore: dragging the peak sets a and b together', async ({ page }) => {
	await page.goto(B + 'explore/');
	const h = await at(page, -2.5, 2.5);
	const to = await at(page, -5, 5);
	await page.mouse.move(h.x, h.y);
	await page.mouse.down();
	await page.mouse.move(to.x, to.y, { steps: 8 });
	await page.mouse.up();
	await expect(curve(page)).toHaveAttribute('data-a', '2.00');
	await expect(curve(page)).toHaveAttribute('data-b', '0.50');
});

test('German labels', async ({ page }) => {
	await page.goto('/de/high-school/function-stretches/explore/');
	await expect(page.locator('h1')).toHaveText('Strecken & Spiegeln');
	await expect(page.getByRole('slider', { name: 'Streckung in y-Richtung a' })).toBeVisible();
});
