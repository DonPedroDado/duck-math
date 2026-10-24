import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

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
	// The point is inert until it is drawn (IN-03); grab it as soon as it appears, while the intro still plays.
	await expect(page.getByTestId('point-halo')).toHaveAttribute('opacity', '1');
	await expect(concept(page)).toHaveAttribute('data-playing', 'true');
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

const slider = (page: Page) => page.getByTestId('drag-point').locator('[tabindex]');
const thetaAttr = async (page: Page) => Number(await page.getByTestId('drag-point').getAttribute('data-theta'));
const arcCount = async (page: Page) => ((await page.getByTestId('angle-arc').getAttribute('d')) ?? '').split('A').length - 1;

test('keyboard past 0 deg wraps and keeps the angle arc', async ({ page }) => {
	await page.goto(U + 'angle/');
	await slider(page).focus();
	for (let i = 0; i < 61; i++) await page.keyboard.press('ArrowLeft');
	await expect(readout(page)).toHaveText('359°');
	await expect(page.getByTestId('angle-arc')).toHaveCount(1);
	expect(await arcCount(page)).toBe(1);
	await expect(page.getByTestId('theta-label')).toBeVisible();
	const t1 = await thetaAttr(page);
	expect(t1).toBeGreaterThan(6.26);
	expect(t1).toBeLessThan(6.27);
	for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');
	await expect(readout(page)).toHaveText('1°');
	expect(await arcCount(page)).toBe(1);
	const t2 = await thetaAttr(page);
	expect(t2).toBeGreaterThan(0.017);
	expect(t2).toBeLessThan(0.018);
});

test('keyboard up through 360 deg lands on exactly 0 with consistent arc and aria', async ({ page }) => {
	await page.goto(U + 'angle/');
	const s = slider(page);
	await s.focus();
	for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+ArrowRight');
	await expect(readout(page)).toHaveText('0°');
	await expect(page.getByTestId('drag-point')).toHaveAttribute('data-theta', '0.0000');
	expect(await thetaAttr(page)).toBe(0);
	await expect(s).toHaveAttribute('aria-valuenow', '0');
	await expect(s).toHaveAttribute('aria-valuetext', '0°');
	await expect(page.getByTestId('angle-arc')).toHaveCount(0);
	await page.keyboard.press('ArrowRight');
	await expect(readout(page)).toHaveText('1°');
	await expect(s).toHaveAttribute('aria-valuenow', '1');
	await expect(s).toHaveAttribute('aria-valuetext', '1°');
	await expect(page.getByTestId('angle-arc')).toHaveCount(1);
	expect(await arcCount(page)).toBe(1);
	await page.keyboard.press('ArrowLeft');
	await expect(readout(page)).toHaveText('0°');
	await expect(s).toHaveAttribute('aria-valuenow', '0');
});

test('keyboard during playback pauses and hides the hint', async ({ page }) => {
	await page.goto(U);
	await slider(page).focus();
	await page.keyboard.press('ArrowRight');
	await expect
		.poll(() => page.getByTestId('drag-hint').evaluate((el) => Number(getComputedStyle(el).opacity)))
		.toBe(0);
	await page.goto(U + 'angle/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-playing', 'true');
	await slider(page).focus();
	await page.keyboard.press('ArrowRight');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false');
});

test('slider supports Home/End and PageUp/PageDown (ARIA slider pattern)', async ({ page }) => {
	await page.goto(U + 'angle/');
	const s = slider(page);
	await expect(s).toHaveAttribute('aria-valuemax', '359');
	await s.focus();
	await page.keyboard.press('Home');
	await expect(readout(page)).toHaveText('0°');
	await page.keyboard.press('PageUp');
	await expect(readout(page)).toHaveText('15°');
	await page.keyboard.press('PageDown');
	await page.keyboard.press('PageDown');
	await expect(readout(page)).toHaveText('345°');
	await page.keyboard.press('End');
	await expect(readout(page)).toHaveText('359°');
	await expect(s).toHaveAttribute('aria-valuenow', '359');
});

test('slider accessible name is static; only aria-valuetext carries the value', async ({ page }) => {
	await page.goto(U + 'angle/');
	const s = slider(page);
	await expect(s).toHaveAttribute('aria-label', 'Angle of the point');
	await s.focus();
	await page.keyboard.press('ArrowRight');
	await expect(s).toHaveAttribute('aria-label', 'Angle of the point');
	await expect(s).toHaveAttribute('aria-valuetext', await readout(page).innerText());
});

test('the point is not operable while it is not drawn', async ({ page }) => {
	await page.goto(U);
	await page.getByTestId('scrubber').focus();
	await page.keyboard.press('Home');
	await expect(concept(page)).toHaveAttribute('data-t', '0.00');
	await expect(slider(page)).toHaveAttribute('tabindex', '-1');
	const before = await thetaAttr(page);
	const p = await pointAt(page, 120);
	await page.mouse.click(p.x, p.y);
	expect(await thetaAttr(page)).toBe(before);
	await page.getByTestId('scrubber').focus();
	await page.keyboard.press('End');
	await expect(slider(page)).toHaveAttribute('tabindex', '0');
});
