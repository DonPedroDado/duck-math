import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/limit-infinity/';
const STEPS = ['intro', 'predict', 'both-up', 'at-infinity', 'continuity'];
const concept = (page: Page) => page.getByTestId('concept');
const num = async (page: Page, testid: string, attr: string) =>
	Number(await page.getByTestId(testid).getAttribute(attr));

test('predict: pick a direction per side, then 1/x shoots to −∞ and +∞ (L-12, L-04)', async ({ page }) => {
	await page.goto(B + 'intro/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
	await expect(page.getByTestId('exit-left')).toHaveCount(0);
	await page.getByTestId('guess-gl-up').click();
	await page.getByTestId('guess-gr-up').click();
	await expect(page.getByTestId('guess-gl-up')).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByTestId('guess-left')).toHaveAttribute('data-dir', '1');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	await expect(page.getByTestId('exit-left')).toHaveAttribute('data-dir', '-1');
	await expect(page.getByTestId('exit-right')).toHaveAttribute('data-dir', '1');
	await expect(page.getByTestId('asym-v-0')).toBeAttached();
	await expect(page.locator('[data-role="lim"]')).toContainText('does not exist');
});

test('the 1/x graph breaks at the asymptote: two runs, none crossing 0', async ({ page }) => {
	await page.goto(B + 'predict/');
	await expect(page.getByTestId('plot')).toHaveAttribute('data-runs', '2');
	await expect(page.getByTestId('tick-left')).toHaveAttribute('data-state', 'below');
	await expect(page.getByTestId('tick-right')).toHaveAttribute('data-state', 'above');
});

test('both-up: +∞ from both sides, and the zoom control works', async ({ page }) => {
	await page.goto(B + 'both-up/');
	await expect(page.locator('[data-role="lim"]')).toContainText('∞');
	await page.getByRole('button', { name: 'Zoom in' }).click();
	await expect(page.getByTestId('zoom')).toHaveAttribute('data-z', '0.50');
	expect(await num(page, 'handle-right', 'data-fy')).toBeGreaterThan(100);
});

test('at-infinity: dragging outward zooms the window out while f(x) hugs 2 (L-05, L-09)', async ({ page }) => {
	await page.goto(B + 'at-infinity/');
	const grid = page.locator('[data-layer="grid"]');
	const step = async () => Number(await grid.getAttribute('data-xstep'));
	expect(Math.abs((await num(page, 'tick-right', 'data-y')) - 2)).toBeLessThan(0.01);
	expect(await step()).toBeGreaterThanOrEqual(100);
	// Pull both handles back in: the window fits the widest handle, so it shrinks to the start.
	await page.getByRole('slider', { name: 'x from the left' }).focus();
	for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+ArrowRight');
	const right = page.getByRole('slider', { name: 'x from the right' });
	await right.focus();
	for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+ArrowLeft');
	expect(await step()).toBeLessThanOrEqual(2);
	// Then push the right one out past the edge.
	// u = 0.95 of the half-width stands for x ≈ 77: the labels step up to tens.
	for (let i = 0; i < 19; i++) await page.keyboard.press('Shift+ArrowRight');
	expect(await num(page, 'handle-right', 'data-hx')).toBeGreaterThan(50);
	expect(await step()).toBeGreaterThanOrEqual(20);
	expect(Math.abs((await num(page, 'tick-right', 'data-y')) - 2)).toBeLessThan(0.05);
	await expect(page.getByTestId('asym-h-2')).toBeAttached();
});

test('continuity: the pen lifts three times, named in both languages (L-14)', async ({ page }) => {
	await page.goto(B + 'continuity/');
	for (const k of ['hole', 'jump', 'asym']) await expect(page.getByTestId(`lift-${k}`)).toBeAttached();
	await expect(page.getByTestId('lifts')).toContainText('asymptote');
	await page.goto('/de/high-school/limit-infinity/continuity/');
	await expect(page.getByTestId('lifts')).toContainText('Sprung');
});

test('every step deep-links', async ({ page }) => {
	for (const id of STEPS) {
		await page.goto(`${B}${id}/`);
		await expect(concept(page)).toHaveAttribute('data-step', id);
	}
});
