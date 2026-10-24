import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const T = '/en/high-school/tangent/';
const concept = (page: Page) => page.getByTestId('concept');
const slider = (page: Page) => page.locator('[data-testid="drag-point"] [role="slider"]');

test('catalog lists tangent second', async ({ page }) => {
	await page.goto('/en/');
	const card = page.getByTestId('concept-card').nth(1);
	await expect(card).toHaveAttribute('href', '/en/high-school/tangent/');
	await expect(card).toContainText('Tangent & friends');
});

test('intro recap', async ({ page }) => {
	await page.goto(T);
	await expect(concept(page)).toHaveAttribute('data-step', 'intro');
	await expect(page.getByTestId('drag-point')).toBeVisible();
	await expect(page.getByTestId('theta-readout')).toHaveText('35°');
});

test('predict then reveal', async ({ page }) => {
	await page.goto(T);
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 8000 });
	await expect(page.getByTestId('player-play')).toHaveText(/Reveal/);
	await expect(page.getByTestId('predict-question')).toContainText('80°');
	const gm = page.getByTestId('guess-marker');
	await expect(gm).toBeVisible();
	const b = (await gm.boundingBox())!;
	const sx = b.x + b.width / 2;
	const sy = b.y + b.height / 2;
	await page.mouse.move(sx, sy);
	await page.mouse.down();
	await page.mouse.move(sx, sy - 60, { steps: 6 });
	await page.mouse.up();
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 8000 });
	await expect(page.getByTestId('tan-seg')).toBeVisible();
	await expect(page.getByTestId('tan-seg')).toHaveAttribute('data-clipped', 'true');
	await expect(page.getByTestId('tan-arrow')).toBeVisible();
	await expect(page.getByTestId('tan-readout')).toHaveText('5.67');
	await expect(page.getByTestId('guess-connector')).toBeVisible();
	await expect(page.getByTestId('caption')).toContainText('grows fast');
});

test('deep link opens revealed', async ({ page }) => {
	await page.goto(T + 'tan/');
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false');
	await expect(page.getByTestId('player-play')).not.toHaveText(/Reveal/);
});

test('undefined at 90 and 270', async ({ page }) => {
	await page.goto(T + 'tan/');
	await slider(page).focus();
	await page.keyboard.press('Home');
	for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(page.getByTestId('tan-readout')).toHaveText('undefined');
	await expect(page.getByTestId('tan-seg')).toHaveCount(0);
	await expect(page.getByTestId('formula-undefined')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByTestId('tan-readout')).toHaveText('57.29');
	await expect(page.getByTestId('tan-arrow')).toBeVisible();
	await page.keyboard.press('ArrowUp');
	for (let i = 0; i < 12; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(page.getByTestId('tan-readout')).toHaveText('undefined');
});

test('de uses comma and nicht definiert', async ({ page }) => {
	await page.goto('/de/high-school/tangent/tan/');
	await slider(page).focus();
	await page.keyboard.press('Home');
	for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowUp');
	await page.keyboard.press('ArrowDown');
	await expect(page.getByTestId('tan-readout')).toHaveText('57,29');
	await page.keyboard.press('ArrowUp');
	await expect(page.getByTestId('tan-readout')).toHaveText('nicht definiert');
});

test('negative tan points down', async ({ page }) => {
	await page.goto(T + 'tan/');
	await slider(page).focus();
	await page.keyboard.press('Home');
	for (let i = 0; i < 9; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(page.getByTestId('tan-seg')).toHaveAttribute('data-dir', '-1');
	await expect(page.getByTestId('tan-readout')).toHaveText('−1.00');
});

test('link', async ({ page }) => {
	await page.goto(T + 'tan/');
	await page.locator('[data-testid="formula"] .link-tan').first().hover();
	await expect(page.locator('[data-link="cos"]').first()).toHaveCSS('opacity', '0.25');
	await expect(page.locator('[data-link="tan"]').first()).toHaveCSS('opacity', '1');
});

for (const s of ['sec', 'csc', 'cot', 'all']) {
	test(`deep link ${s}`, async ({ page }) => {
		await page.goto(T + s + '/');
		await expect(concept(page)).toHaveAttribute('data-step', s);
		await expect(concept(page)).toHaveAttribute('data-predict', 'none');
	});
}

test('earlier segments dim', async ({ page }) => {
	await page.goto(T + 'sec/');
	await expect(page.locator('[data-link="tan"]').first()).toHaveAttribute('data-dim', '1');
	await expect(page.locator('[data-link="sec"]').first()).toHaveAttribute('data-dim', '0');
	await page.goto(T + 'all/');
	for (const id of ['tan', 'sec', 'csc', 'cot'])
		await expect(page.locator(`[data-link="${id}"]`).first()).toHaveAttribute('data-dim', '0');
});

test('color-blind cues in all', async ({ page }) => {
	await page.goto(T + 'all/');
	await slider(page).focus();
	await page.keyboard.press('Home');
	for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+ArrowUp');
	for (const f of ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'])
		await expect(page.getByTestId(`lbl-${f}`)).toBeVisible();
	await expect(page.getByTestId('sec-seg')).toHaveAttribute('stroke-dasharray', '10 5');
	await expect(page.getByTestId('csc-seg')).toHaveAttribute('stroke-dasharray', '10 5');
	await expect(page.getByTestId('tan-seg')).not.toHaveAttribute('stroke-dasharray', /.+/);
	await expect(page.getByTestId('cot-seg')).not.toHaveAttribute('stroke-dasharray', /.+/);
	await expect(page.locator('[stroke="var(--c-angle)"], [stroke="var(--c-radian)"]')).toHaveCount(0);
	await expect(page.getByTestId('caption')).toContainText('90°');
});

test('all six readouts and poles', async ({ page }) => {
	await page.goto(T + 'all/');
	await slider(page).focus();
	const rd = (f: string) => page.getByTestId(`${f}-readout`);
	await page.keyboard.press('Home');
	await expect(rd('tan')).toHaveText('0.00');
	await expect(rd('sec')).toHaveText('1.00');
	await expect(rd('csc')).toHaveText('undefined');
	await expect(rd('cot')).toHaveText('undefined');
	await expect(page.getByTestId('csc-seg')).toHaveCount(0);
	await expect(page.getByTestId('cot-seg')).toHaveCount(0);
	for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(rd('tan')).toHaveText('1.00');
	await expect(rd('sec')).toHaveText('1.41');
	await expect(rd('csc')).toHaveText('1.41');
	await expect(rd('cot')).toHaveText('1.00');
	for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(rd('tan')).toHaveText('undefined');
	await expect(rd('sec')).toHaveText('undefined');
	await expect(rd('csc')).toHaveText('1.00');
	await expect(rd('cot')).toHaveText('0.00');
	await page.keyboard.press('Home');
	await page.keyboard.press('ArrowUp');
	await expect(page.getByTestId('cot-arrow')).toBeVisible();
	await expect(page.getByTestId('csc-arrow')).toBeVisible();
	await page.keyboard.press('Home');
	for (let i = 0; i < 9; i++) await page.keyboard.press('Shift+ArrowUp');
	await expect(page.getByTestId('cot-seg')).toHaveAttribute('data-dir', '-1');
	await expect(rd('cot')).toHaveText('−1.00');
});

test('de cot nicht definiert', async ({ page }) => {
	await page.goto('/de/high-school/tangent/all/');
	await slider(page).focus();
	await page.keyboard.press('Home');
	await expect(page.getByTestId('cot-readout')).toHaveText('nicht definiert');
});
