import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const U = '/en/high-school/unit-circle/';
const copies = (p: Page) => p.getByTestId('radian-copy');
const readout = (p: Page) => p.getByTestId('theta-readout');
const concept = (p: Page) => p.getByTestId('concept');

async function settle(p: Page) {
	await expect(concept(p)).toHaveAttribute('data-playing', 'false', { timeout: 8000 });
}
async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}
async function expectLanded(p: Page, n: number) {
	await expect(copies(p)).toHaveCount(n);
	await expect(p.locator('[data-testid="radian-copy"][data-landed="true"]')).toHaveCount(
		n === 2 ? 1 : n
	);
}

test('radian step shows four landed copies ending at pi', async ({ page }) => {
	await page.goto(U + 'radian/');
	await expectLanded(page, 4);
	await expect(copies(page).last()).toHaveAttribute('data-end-angle', '3.142');
	for (const id of ['one-rad-label', 'pi-label']) {
		const o = await page.getByTestId(id).evaluate((e) => +getComputedStyle(e).opacity);
		expect(o).toBeGreaterThan(0.9);
	}
});

test('PD-3: copies do not depend on the student angle', async ({ page }) => {
	await page.goto(U + 'angle/');
	const p = await pointAt(page, 0);
	await page.mouse.move(p.x, p.y);
	await page.mouse.down();
	const q = await pointAt(page, 30);
	await page.mouse.move(q.x, q.y, { steps: 6 });
	await page.mouse.up();
	await page.getByTestId('scrubber-tick-radian').click();
	await expectLanded(page, 4);
	await expect(copies(page).last()).toHaveAttribute('data-end-angle', '3.142');
});

test('scrubbing unwinds and replays identically', async ({ page }) => {
	await page.goto(U + 'radian/');
	await page.getByTestId('scrubber').focus();
	for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowLeft');
	await expectLanded(page, 2);
	for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowLeft');
	await expect(copies(page)).toHaveCount(0);
	for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
	await expectLanded(page, 2);
});

test('play from angle ends with four landed copies', async ({ page }) => {
	await page.goto(U + 'angle/');
	await page.getByTestId('player-play').click();
	await settle(page);
	await expectLanded(page, 4);
});

test('toggle switches readout and formula, copies dim', async ({ page }) => {
	await page.goto(U + 'radians/');
	await expect(page.getByTestId('unit-toggle')).toBeVisible();
	await expect(page.getByTestId('unit-rad')).toHaveAttribute('aria-pressed', 'true');
	await expect(readout(page)).toHaveText('1.05');
	await expect(readout(page)).toHaveAttribute('data-unit', 'rad');
	await page.getByTestId('unit-deg').click();
	await expect(readout(page)).toHaveText('60°');
	await expect(page.getByTestId('formula')).toContainText('60');
	await page.getByTestId('unit-rad').click();
	await expect(readout(page)).toHaveText('1.05');
	const o = await copies(page).first().evaluate((e) => +getComputedStyle(e).opacity);
	expect(o).toBeGreaterThan(0.35);
	expect(o).toBeLessThan(0.45);
});

test('toggle slot is reserved before radians', async ({ page }) => {
	await page.goto(U + 'radian/');
	const o = await page.getByTestId('unit-toggle').evaluate((e) => +getComputedStyle(e).opacity);
	expect(o).toBe(0);
	const b = await page.getByTestId('toggle-slot').boundingBox();
	expect(b!.height).toBeGreaterThanOrEqual(44);
});

test('unit choice is kept and re-staged', async ({ page }) => {
	await page.goto(U + 'radians/');
	await page.getByTestId('unit-deg').click();
	await page.getByTestId('player-next').click();
	await settle(page);
	await expect(readout(page)).toHaveAttribute('data-unit', 'deg');
	await page.getByTestId('scrubber-tick-sine').click();
	await expect(readout(page)).toHaveAttribute('data-unit', 'deg');
	await page.getByTestId('scrubber-tick-angle').click();
	await expect(readout(page)).toHaveAttribute('data-unit', 'deg');
	await page.getByTestId('scrubber-tick-radians').click();
	await expect(readout(page)).toHaveAttribute('data-unit', 'rad');
});

test('DE labels and decimal comma', async ({ page }) => {
	await page.goto('/de/high-school/unit-circle/radians/');
	await expect(page.getByTestId('unit-deg')).toHaveText('Grad');
	await expect(page.getByTestId('unit-rad')).toHaveText('rad');
	await expect(readout(page)).toHaveText('1,05');
});

test('toggle shows the real unit during the radians blend', async ({ page }) => {
	await page.goto(U + 'radians/');
	await page.getByTestId('scrubber').focus();
	for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowLeft');
	const c = page.getByTestId('concept');
	await expect(c).toHaveAttribute('data-step', 'radians');
	await expect(c).toHaveAttribute('data-t', '8.75');
	await expect(page.getByTestId('unit-rad')).toHaveAttribute('aria-pressed', 'true');
	await page.getByTestId('unit-deg').click();
	await expect(page.getByTestId('unit-deg')).toHaveAttribute('aria-pressed', 'true');
	await page.getByTestId('unit-rad').click();
	await expect(page.getByTestId('unit-rad')).toHaveAttribute('aria-pressed', 'true');
});
