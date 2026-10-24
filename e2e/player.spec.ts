import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const U = '/en/high-school/unit-circle/';
const concept = (page: Page) => page.getByTestId('concept');

test('initial state is staged, paused, no autoplay', async ({ page }) => {
	await page.goto(U);
	const c = concept(page);
	await expect(c).toHaveAttribute('data-step', 'intro');
	await expect(c).toHaveAttribute('data-t', '2.00');
	await expect(c).toHaveAttribute('data-playing', 'false');
	await expect(page.getByTestId('step-counter')).toHaveText('Step 1 of 6');
	await expect(page.getByTestId('caption')).toHaveText(
		'A circle with radius 1. Drag the point around it.'
	);
	await page.waitForTimeout(600);
	await expect(c).toHaveAttribute('data-t', '2.00');
	await expect(page.getByTestId('player-play')).toHaveAttribute('aria-label', 'Play');
});

test('play runs the next step and stops at its end', async ({ page }) => {
	await page.goto(U);
	const c = concept(page);
	await page.getByTestId('player-play').click();
	await expect(c).toHaveAttribute('data-step', 'angle');
	await expect(c).toHaveAttribute('data-playing', 'false', { timeout: 6000 });
	await expect(c).toHaveAttribute('data-t', '4.50');
	await expect(page.getByTestId('step-counter')).toHaveText('Step 2 of 6');
	await expect(page.getByTestId('caption')).toContainText('The angle');
});

test('next plays, play pauses, prev jumps to previous staged end', async ({ page }) => {
	await page.goto(U + 'angle/');
	const c = concept(page);
	await page.getByTestId('player-next').click();
	await expect(c).toHaveAttribute('data-step', 'radian');
	await expect(c).toHaveAttribute('data-playing', 'true');
	await page.waitForTimeout(500);
	await page.getByTestId('player-play').click();
	await expect(c).toHaveAttribute('data-playing', 'false');
	const t = Number(await c.getAttribute('data-t'));
	expect(t).toBeGreaterThan(4.5);
	expect(t).toBeLessThan(8.5);
	await page.getByTestId('player-prev').click();
	await expect(c).toHaveAttribute('data-step', 'angle');
	await expect(c).toHaveAttribute('data-t', '4.50');
});

test('tick click shows the step staged; reset returns to intro staged', async ({ page }) => {
	await page.goto(U);
	const c = concept(page);
	await page.getByTestId('scrubber-tick-cosine').click();
	await expect(c).toHaveAttribute('data-step', 'cosine');
	await expect(c).toHaveAttribute('data-t', '13.00');
	await expect(c).toHaveAttribute('data-playing', 'false');
	await page.getByTestId('player-reset').click();
	await expect(c).toHaveAttribute('data-step', 'intro');
	await expect(c).toHaveAttribute('data-t', '2.00');
});

test('scrubbing works in both directions', async ({ page }) => {
	await page.goto(U + 'cosine/');
	const c = concept(page);
	const b = (await page.getByTestId('scrubber').boundingBox())!;
	const y = b.y + b.height / 2;
	await page.mouse.move(b.x + b.width * 0.8, y);
	await page.mouse.down();
	await page.mouse.move(b.x + b.width * 0.25, y, { steps: 5 });
	await expect(c).toHaveAttribute('data-step', 'angle');
	await page.mouse.move(b.x + b.width * 0.6, y, { steps: 5 });
	await expect(c).toHaveAttribute('data-step', 'radians');
	await page.mouse.up();
	await expect(c).toHaveAttribute('data-playing', 'false');
});

test('scrubber keyboard: End and Home', async ({ page }) => {
	await page.goto(U);
	const c = concept(page);
	await page.getByTestId('scrubber').focus();
	await page.keyboard.press('End');
	await expect(c).toHaveAttribute('data-step', 'sine');
	await expect(c).toHaveAttribute('data-t', '15.50');
	await page.keyboard.press('Home');
	await expect(c).toHaveAttribute('data-t', '0.00');
	await expect(c).toHaveAttribute('data-step', 'intro');
});

test('play at the end restarts from intro', async ({ page }) => {
	await page.goto(U);
	const c = concept(page);
	await page.getByTestId('scrubber-tick-sine').click();
	await page.getByTestId('player-play').click();
	await expect(c).toHaveAttribute('data-step', 'intro');
	await expect(c).toHaveAttribute('data-playing', 'true');
});

test('German labels', async ({ page }) => {
	await page.goto('/de/high-school/unit-circle/');
	await expect(page.getByTestId('step-counter')).toHaveText('Schritt 1 von 6');
	await expect(page.getByTestId('player-play')).toHaveAttribute('aria-label', 'Abspielen');
});

test('radians caption uses locale number formatting', async ({ page }) => {
	await page.goto(U + 'radians/');
	await expect(page.getByTestId('caption')).toContainText('3.14');
	await page.goto('/de/high-school/unit-circle/radians/');
	await expect(page.getByTestId('caption')).toContainText('3,14');
	await expect(page.getByTestId('caption')).toContainText('Bogenmaß');
});

test('desktop layout: 44px targets, stage left of panel', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(U);
	for (const id of ['player-reset', 'player-prev', 'player-next']) {
		const b = (await page.getByTestId(id).boundingBox())!;
		expect(b.width).toBeGreaterThanOrEqual(44);
		expect(b.height).toBeGreaterThanOrEqual(44);
	}
	const p = (await page.getByTestId('player-play').boundingBox())!;
	expect(p.width).toBeGreaterThanOrEqual(48);
	expect(p.height).toBeGreaterThanOrEqual(48);
	const s = (await page.getByTestId('stage').boundingBox())!;
	const c = (await page.getByTestId('caption').boundingBox())!;
	expect(s.x).toBeLessThan(c.x);
});

test('concept panel has exactly one live region (the step caption)', async ({ page }) => {
	for (const step of ['intro', 'angle', 'radians', 'sine']) {
		await page.goto(`/en/high-school/unit-circle/${step}/`);
		const live = page.locator(
			'aside [aria-live], aside [role="status"], aside [role="alert"], aside [role="log"], aside output'
		);
		await expect(live).toHaveCount(1);
		await expect(live.getByTestId('caption')).toHaveCount(1);
	}
});
