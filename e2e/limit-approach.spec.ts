import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/limit-approach/';
const STEPS = ['intro', 'predict', 'approach', 'zoom', 'value', 'jump', 'oscillate'];
const concept = (page: Page) => page.getByTestId('concept');
const num = async (page: Page, testid: string, attr: string) =>
	Number(await page.getByTestId(testid).getAttribute(attr));

test('predict: f(1) is 0/0, and nothing at x = 1 shows before the reveal (L-11)', async ({ page }) => {
	await page.goto(B + 'intro/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
	await expect(page.getByTestId('predict-question')).toContainText('f(1)');
	await expect(page.getByTestId('hole')).toHaveCount(0);
	await expect(page.getByTestId('handle-left')).toHaveCount(0);
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	await expect(page.getByTestId('hole')).toHaveAttribute('data-y', '2');
	await expect(page.getByTestId('hole')).toHaveAttribute('data-open', 'true');
	await expect(page.getByTestId('caption')).toContainText('0/0');
});

test('approach: both outputs close in on 2, and the limit is stated (L-01)', async ({ page }) => {
	await page.goto(B + 'approach/');
	for (const side of ['left', 'right']) {
		expect(Math.abs((await num(page, `tick-${side}`, 'data-y')) - 2)).toBeLessThan(0.1);
	}
	expect(await num(page, 'handle-left', 'data-hx')).toBeLessThan(1);
	expect(await num(page, 'handle-right', 'data-hx')).toBeGreaterThan(1);
	await expect(page.locator('[data-role="lim"]')).toContainText('2');
});

test('a handle can creep up on a but never reach it (L-06)', async ({ page }) => {
	await page.goto(B + 'approach/');
	const h = page.getByRole('slider', { name: 'x from the left' });
	const box = (await h.boundingBox())!;
	const stage = (await page.getByTestId('stage').boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	// Far past a, to the right edge of the stage.
	await page.mouse.move(stage.x + stage.width - 4, box.y + box.height / 2, { steps: 8 });
	await page.mouse.up();
	const x = await num(page, 'handle-left', 'data-hx');
	expect(x).toBeLessThan(1);
	expect(x).toBeGreaterThan(0.8);
	await h.focus();
	for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
	expect(await num(page, 'handle-left', 'data-hx')).toBeLessThan(1);
});

test('zoom: the control changes the window around a (L-08)', async ({ page }) => {
	await page.goto(B + 'zoom/');
	const grid = page.locator('[data-layer="grid"]');
	await expect(page.getByTestId('zoom')).toHaveAttribute('data-z', '2.00');
	await expect(grid).toHaveAttribute('data-xstep', '0.01');
	const out = page.getByRole('button', { name: 'Zoom out' });
	for (let i = 0; i < 4; i++) await out.click();
	await expect(page.getByTestId('zoom')).toHaveAttribute('data-z', '0.00');
	await expect(grid).toHaveAttribute('data-xstep', '1');
	await expect(page.getByTestId('hole')).toHaveAttribute('data-x', '1');
});

test('value: a filled f(1) = 3 above the hole; the limit is still 2 (L-02)', async ({ page }) => {
	await page.goto(B + 'value/');
	await expect(page.getByTestId('hole')).toHaveAttribute('data-y', '2');
	await expect(page.getByTestId('value')).toHaveAttribute('data-y', '3');
	await expect(page.getByTestId('value')).toHaveAttribute('data-open', 'false');
	await expect(page.locator('[data-role="lim"]')).toContainText('≠');
});

test('jump: the sides disagree, so the limit does not exist (L-03)', async ({ page }) => {
	await page.goto(B + 'jump/');
	expect(Math.abs((await num(page, 'tick-left', 'data-y')) - 2)).toBeLessThan(0.2);
	expect(Math.abs(await num(page, 'tick-right', 'data-y'))).toBeLessThan(0.2);
	await expect(page.locator('[data-role="lim"]')).toContainText('does not exist');
	await page.goto('/de/high-school/limit-approach/jump/');
	await expect(page.locator('[data-role="lim"]')).toContainText('existiert nicht');
});

test('oscillate: sin(1/x) never settles, zoomed in x only', async ({ page }) => {
	await page.goto(B + 'oscillate/');
	await expect(page.getByTestId('curve')).toHaveAttribute('data-sc', 'osc');
	await expect(page.getByTestId('band')).toBeAttached();
	await expect(page.locator('[data-role="left"]')).toContainText('does not exist');
	await expect(page.locator('[data-layer="grid"]')).toHaveAttribute('data-ystep', '1');
	await expect(page.locator('[data-layer="grid"]')).toHaveAttribute('data-xstep', '0.01');
});

test('every step deep-links', async ({ page }) => {
	for (const id of STEPS) {
		await page.goto(`${B}${id}/`);
		await expect(concept(page)).toHaveAttribute('data-step', id);
	}
});
