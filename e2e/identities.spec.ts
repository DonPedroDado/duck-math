import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/trig-identities/';
const slider = (page: Page) => page.getByRole('slider', { name: 'Angle of the point' });
const concept = (page: Page) => page.getByTestId('concept');

async function toDeg(page: Page, shiftPresses: number) {
	await slider(page).focus();
	await page.keyboard.press('Home');
	for (let i = 0; i < shiftPresses; i++) await page.keyboard.press('Shift+ArrowUp');
}

test('catalog card', async ({ page }) => {
	await page.goto('/en/');
	const card = page.locator(`a[href="${B}"]`);
	await expect(card).toContainText('Identities & special angles');
});

test('intro shows the triangle at 50 degrees', async ({ page }) => {
	await page.goto(B);
	await expect(page.getByTestId('tri')).toBeVisible();
	await expect(page.getByTestId('theta-readout')).toHaveText('50°');
});

test('pythagoras: squares fill the big one, terms sum to 1.00', async ({ page }) => {
	await page.goto(B + 'pythagoras/');
	await expect(page.getByTestId('sq-cos2')).toBeVisible();
	await expect(page.getByTestId('sq-sin2')).toBeVisible();
	await expect(page.getByTestId('sq-one')).toBeVisible();
	await expect(page.getByTestId('area-sum')).toHaveText('1.00');
	await toDeg(page, 2);
	await expect(page.getByTestId('area-sum')).toHaveText('1.00');
	const a = Number(await page.getByTestId('sq-cos2').getAttribute('data-area'));
	const b = Number(await page.getByTestId('sq-sin2').getAttribute('data-area'));
	expect(Math.abs(a + b - 1)).toBeLessThan(0.002);
});

test('negative angle ghost mirrors in the x-axis', async ({ page }) => {
	await page.goto(B + 'negative/');
	await expect(page.getByTestId('ghost-neg')).toHaveAttribute('data-deg', '310');
	await expect(page.getByTestId('mirror-x')).toBeVisible();
	await expect(page.getByTestId('formula').locator('.link-ghost-neg').first()).toBeVisible();
});

test('quadrant check: ghost-neg at 210 is 150', async ({ page }) => {
	await page.goto(B + 'negative/');
	await toDeg(page, 14);
	await expect(page.getByTestId('ghost-neg')).toHaveAttribute('data-deg', '150');
});

test('predict: guess the supplement mirror point', async ({ page }) => {
	await page.goto(B + 'negative/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 8000 });
	await expect(page.getByTestId('player-play')).toHaveText(/Reveal/);
	await expect(page.getByTestId('predict-question')).toContainText('180°');
	const g = page.getByTestId('guess-marker');
	const b = (await g.boundingBox())!;
	const x = b.x + b.width / 2;
	const y = b.y + b.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x - 50, y, { steps: 6 });
	await page.mouse.up();
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 8000 });
	await expect(page.getByTestId('ghost-supp')).toHaveAttribute('data-deg', '130');
	await expect(page.getByTestId('guess-connector')).toBeVisible();
});

test('complement ghost swaps and coincides at 45', async ({ page }) => {
	await page.goto(B + 'complement/');
	await expect(page.getByTestId('ghost-comp')).toHaveAttribute('data-deg', '40');
	await toDeg(page, 3);
	await expect(page.getByTestId('ghost-comp')).toHaveAttribute('data-coincide', 'true');
});

test('german decimal comma in the area readout', async ({ page }) => {
	await page.goto('/de/high-school/trig-identities/pythagoras/');
	await expect(page.getByTestId('area-sum')).toHaveText('1,00');
});

async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}
async function dragTo(page: Page, from: number, to: number) {
	const p0 = await pointAt(page, from);
	await page.mouse.move(p0.x, p0.y);
	await page.mouse.down();
	const p1 = await pointAt(page, to);
	await page.mouse.move(p1.x, p1.y, { steps: 8 });
	await page.mouse.up();
}
const readout = (page: Page) => page.getByTestId('theta-readout');

test('special: snaps to 60 with exact values and a pulse', async ({ page }) => {
	await page.goto(B + 'special/');
	await dragTo(page, 50, 61.5);
	await expect(readout(page)).toHaveText('60°');
	const ex = page.getByTestId('exact');
	await expect(ex).toBeVisible();
	await expect(ex).toHaveAttribute('data-deg', '60');
	await expect(page.getByTestId('snap-pulse')).toBeAttached();
});

test('special: no snap outside the window; axes are not targets', async ({ page }) => {
	await page.goto(B + 'special/');
	await dragTo(page, 50, 66);
	await expect(readout(page)).toHaveText(/^6[5-7]°$/);
	await expect(page.getByTestId('exact')).toHaveCount(0);
	await dragTo(page, 66, 89);
	await expect(readout(page)).toHaveText(/^(8[7-9]|90)°$/);
	await expect(page.getByTestId('exact')).toHaveCount(0);
});

test('special: keyboard is not trapped at a snapped angle', async ({ page }) => {
	await page.goto(B + 'special/');
	await dragTo(page, 50, 61.5);
	await expect(readout(page)).toHaveText('60°');
	await slider(page).focus();
	await page.keyboard.press('ArrowRight');
	await expect(readout(page)).toHaveText('61°');
});

test('special: exact sign in quadrant III, chips, ghosts, squares', async ({ page }) => {
	await page.goto(B + 'special/');
	await dragTo(page, 50, 210.5);
	const ex = page.getByTestId('exact');
	await expect(ex).toHaveAttribute('data-deg', '210');
	await expect(ex).toHaveAttribute('data-sin', '-\\tfrac{1}{2}');
	const chip = page.getByTestId('chip-45');
	await chip.click();
	await expect(readout(page)).toHaveText('45°');
	await expect(chip).not.toHaveAttribute('aria-pressed', /.*/);
	const g = page.getByTestId('ghost-chip-neg');
	await expect(g).toHaveAttribute('aria-pressed', 'false');
	await g.click();
	await expect(g).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByTestId('ghost-neg')).toBeVisible();
	await page.getByTestId('chip-squares').click();
	await expect(page.getByTestId('sq-one')).toBeVisible();
});

test('square45 derivation', async ({ page }) => {
	await page.goto(B + 'square45/');
	await expect(readout(page)).toHaveText('45°');
	await expect(page.getByTestId('sq45')).toBeVisible();
	await expect(page.getByTestId('exact')).toHaveAttribute('data-deg', '45');
});

test('triangle3060 derivation', async ({ page }) => {
	await page.goto(B + 'triangle3060/');
	await expect(readout(page)).toHaveText('60°');
	await expect(page.getByTestId('eq-tri')).toBeVisible();
	await expect(page.getByTestId('alt-60')).toBeVisible();
	await expect(page.getByTestId('pt-30')).toBeVisible();
});

test('triangle3060 follows the angle chips', async ({ page }) => {
	await page.goto(B + 'triangle3060/');
	const first = page.getByTestId('formula').locator('.formula-line').first();
	await expect(first).toContainText('y2=34');
	await page.getByTestId('chip-30').click();
	await expect(readout(page)).toHaveText('30°');
	await expect(first).toContainText('x2=34');
	await expect(page.getByTestId('tri3060')).toHaveAttribute('data-fit', '1');
	await page.getByTestId('chip-45').click();
	await expect(readout(page)).toHaveText('45°');
	await expect(first).toContainText('x2=12');
	await expect(page.getByTestId('tri3060')).toHaveAttribute('data-fit', '0');
	await expect(page.getByTestId('sq45')).toBeVisible();
});

test('german chip group labels', async ({ page }) => {
	await page.goto('/de/high-school/trig-identities/special/');
	await expect(page.getByRole('group', { name: 'Besondere Winkel' })).toBeVisible();
	await expect(page.getByRole('group', { name: 'Spiegelpunkte zeigen' })).toBeVisible();
});
