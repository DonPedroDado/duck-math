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
