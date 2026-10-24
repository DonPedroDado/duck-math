import { test, expect, type Page } from '@playwright/test';

const U = '/en/high-school/unit-circle/';

async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}
const concept = (page: Page) => page.getByTestId('concept');
const readout = (page: Page) => page.getByTestId('theta-readout');

test('dragging pauses playback without jump; play resumes the same step', async ({ page }) => {
	await page.goto(U + 'angle/');
	const c = concept(page);
	await page.getByTestId('player-play').click(); // radian step
	await page.waitForTimeout(500);
	const p0 = await pointAt(page, 60);
	await page.mouse.move(p0.x, p0.y);
	await page.mouse.down();
	await expect(c).toHaveAttribute('data-playing', 'false');
	const t = await c.getAttribute('data-t');
	const p1 = await pointAt(page, 135);
	await page.mouse.move(p1.x, p1.y, { steps: 8 });
	await page.mouse.up();
	await expect(readout(page)).toHaveText(/^13[456]°$/);
	await page.waitForTimeout(400);
	await expect(c).toHaveAttribute('data-t', t!);
	await page.getByTestId('player-play').click();
	await expect(c).toHaveAttribute('data-playing', 'false', { timeout: 6000 });
	await expect(c).toHaveAttribute('data-step', 'radian');
	await expect(c).toHaveAttribute('data-t', '8.50');
	await expect(readout(page)).toHaveText(/^13[456]°$/);

	// D-03 keep + PLAY-06 restage
	await page.getByTestId('player-next').click();
	await expect(c).toHaveAttribute('data-step', 'radians');
	await expect(c).toHaveAttribute('data-playing', 'false', { timeout: 6000 });
	await expect(readout(page)).toHaveAttribute('data-unit', 'rad');
	await expect(readout(page)).toHaveText(/^2[.,]3[3-7]$/);
	await page.getByTestId('scrubber-tick-angle').click();
	await expect(c).toHaveAttribute('data-step', 'angle');
	await expect(readout(page)).toHaveAttribute('data-unit', 'deg');
	await expect(readout(page)).toHaveText(/^13[456]°$/);
});

test('grabbing the point does not move it', async ({ page }) => {
	await page.goto(U + 'angle/');
	const p = await pointAt(page, 60);
	await page.mouse.move(p.x, p.y);
	await page.mouse.down();
	await page.mouse.up();
	await expect(readout(page)).toHaveText(/^(59|60|61)°$/);
});

test('drag during intro animation pauses and hides the hint', async ({ page }) => {
	await page.goto(U);
	await page.getByTestId('scrubber').focus();
	await page.keyboard.press('Home');
	await page.getByTestId('player-play').click();
	await page.waitForTimeout(300);
	const a = await pointAt(page, 60);
	const z = await pointAt(page, 200);
	await page.mouse.move(a.x, a.y);
	await page.mouse.down();
	await page.mouse.move(z.x, z.y, { steps: 8 });
	await page.mouse.up();
	await expect(concept(page)).toHaveAttribute('data-playing', 'false');
	await expect(readout(page)).toHaveText(/^(199|200|201)°$/);
	const op = await page
		.getByTestId('drag-hint')
		.evaluate((el) => getComputedStyle(el).opacity);
	expect(Number(op)).toBe(0);
});

test('staged visuals: angle arc and label, intro hint', async ({ page }) => {
	await page.goto(U + 'angle/');
	expect(await page.getByTestId('angle-arc').getAttribute('d')).toBeTruthy();
	await expect(page.getByTestId('theta-label')).toBeVisible();
	await page.goto(U);
	expect((await page.getByTestId('angle-arc').getAttribute('d')) ?? '').toBe('');
	await expect(page.getByTestId('drag-hint')).toBeVisible();
});
