import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/function-shifts/';
const concept = (page: Page) => page.getByTestId('concept');
const curve = (page: Page) => page.getByTestId('curve');

/** Pixel of math point (u, v) on the stage (window [-6, 6]²). */
async function at(page: Page, u: number, v: number) {
	const s = (await page.getByTestId('stage').boundingBox())!;
	return { x: s.x + ((u + 6) / 12) * s.width, y: s.y + ((6 - v) / 12) * s.height };
}

test('catalog lists shifts after the trig concepts, Functions soon card gone', async ({ page }) => {
	await page.goto('/en/');
	const card = page.getByTestId('concept-card').nth(4);
	await expect(card).toHaveAttribute('href', B);
	await expect(card).toContainText('Shifting graphs');
	await expect(page.getByTestId('soon-card')).toHaveCount(1);
});

test('vertical: d lifts the graph; slider and drag both write d', async ({ page }) => {
	await page.goto(B + 'vertical/');
	await expect(curve(page)).toHaveAttribute('data-d', '2.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-y', '4.500');
	const slider = page.getByRole('slider', { name: 'Vertical shift d' });
	await slider.focus();
	await page.keyboard.press('ArrowLeft');
	await expect(curve(page)).toHaveAttribute('data-d', '1.90');
	const a = await at(page, -2.5, 4.5);
	const b = await at(page, -2.5, 2.5);
	await page.mouse.move(a.x, a.y);
	await page.mouse.down();
	await page.mouse.move(b.x, b.y, { steps: 6 });
	await page.mouse.up();
	await expect(curve(page)).toHaveAttribute('data-d', /^-?0\.\d0$|^0\.00$/);
	await expect(curve(page)).toHaveAttribute('data-c', '0.00');
});

test('predict: which way does f(x + 2) move, then reveal left', async ({ page }) => {
	await page.goto(B + 'vertical/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
	await expect(page.getByTestId('predict-question')).toContainText('f(x + 2)');
	await expect(curve(page)).toHaveAttribute('data-c', '0.00');
	const gm = page.getByTestId('guess-marker');
	const g = (await gm.boundingBox())!;
	await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
	await page.mouse.down();
	await page.mouse.move(g.x + g.width / 2 + 80, g.y + g.height / 2, { steps: 5 });
	await page.mouse.up();
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	await expect(curve(page)).toHaveAttribute('data-c', '-2.00');
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-x', '-4.500');
	await expect(page.getByTestId('guess-connector')).toBeAttached();
	await expect(page.getByTestId('caption')).toContainText('Left');
});

test('deep link to lookup never blocks and shows where f is read', async ({ page }) => {
	await page.goto(B + 'opposite/');
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(curve(page)).toHaveAttribute('data-c', '-2.00');
	await page.goto(B + 'lookup/');
	await expect(page.getByTestId('lookup-2.5')).toHaveAttribute('data-u', '4.500');
	await expect(page.getByTestId('formula')).toContainText('x−(−2)');
});

test('horizontal: dragging sideways changes only c', async ({ page }) => {
	await page.goto(B + 'horizontal/');
	const a = await at(page, -4.5, 2.5);
	const b = await at(page, -1.5, 3.5);
	await page.mouse.move(a.x, a.y);
	await page.mouse.down();
	await page.mouse.move(b.x, b.y, { steps: 8 });
	await page.mouse.up();
	await expect(curve(page)).toHaveAttribute('data-c', '1.00');
	await expect(curve(page)).toHaveAttribute('data-d', '0.00');
});

test('hover linking: the c term dims the ghost', async ({ page }) => {
	await page.goto(B + 'horizontal/');
	await page.locator('[data-testid="formula"] .link-c').first().hover();
	await expect(page.locator('[data-link="ghost"]').first()).toHaveCSS('opacity', '0.25');
	await page.mouse.move(0, 0);
	await expect(page.locator('[data-link="ghost"]').first()).toHaveCSS('opacity', '1');
});

test('German labels', async ({ page }) => {
	await page.goto('/de/high-school/function-shifts/both/');
	await expect(page.locator('h1')).toHaveText('Graphen verschieben');
	await expect(page.getByRole('slider', { name: 'Verschiebung in x-Richtung c' })).toBeVisible();
	await expect(page.getByTestId('formula')).toContainText('1,5');
});
