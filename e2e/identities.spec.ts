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
