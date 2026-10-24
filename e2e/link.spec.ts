import { test, expect, type Page } from '@playwright/test';

const U = (loc: string, step: string) => `/${loc}/high-school/unit-circle/${step}/`;
const formula = (page: Page) => page.getByTestId('formula');
const term = (page: Page, id: string) => formula(page).locator(`.link-${id}`).first();
const seg = (page: Page, id: string) => page.locator(`[data-link="${id}"]`);

test('hovering the cos term glows cos and dims sin; leaving restores', async ({ page }) => {
	await page.goto(U('en', 'sine'));
	await term(page, 'cos').hover();
	await expect(seg(page, 'sin')).toHaveCSS('opacity', '0.25');
	await expect(seg(page, 'cos')).toHaveCSS('opacity', '1');
	await term(page, 'sin').hover();
	await expect(seg(page, 'cos')).toHaveCSS('opacity', '0.25');
	await page.mouse.move(0, 0);
	await expect(seg(page, 'sin')).toHaveCSS('opacity', '1');
	await expect(seg(page, 'cos')).toHaveCSS('opacity', '1');
});

test('hovering the cos segment underlines the cos term', async ({ page }) => {
	await page.goto(U('en', 'sine'));
	// A horizontal SVG line has an empty bounding box height, so hover by coordinates.
	const b = (await page.getByTestId('cos-seg').boundingBox())!;
	await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
	await expect(formula(page).locator('.link-cos.link-active').first()).toBeAttached();
	await expect(formula(page).locator('.link-sin.link-active')).toHaveCount(0);
});

test('highlight does not stick after live re-renders', async ({ page }) => {
	await page.goto(U('en', 'sine'));
	await term(page, 'cos').hover();
	await page.getByTestId('drag-point').locator('[tabindex]').focus();
	for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
	await page.mouse.move(0, 0);
	await expect(seg(page, 'sin')).toHaveCSS('opacity', '1');
	await expect(seg(page, 'cos')).toHaveCSS('opacity', '1');
});

test.describe('touch', () => {
	test.use({ hasTouch: true });

	test('tap toggles; tap on empty stage clears', async ({ page }) => {
		await page.goto(U('en', 'sine'));
		await term(page, 'cos').tap();
		await expect(seg(page, 'sin')).toHaveCSS('opacity', '0.25');
		await term(page, 'cos').tap();
		await expect(seg(page, 'sin')).toHaveCSS('opacity', '1');
		await term(page, 'cos').tap();
		await expect(seg(page, 'sin')).toHaveCSS('opacity', '0.25');
		await page.getByTestId('stage').tap({ position: { x: 5, y: 5 } });
		await expect(seg(page, 'sin')).toHaveCSS('opacity', '1');
	});
});

test('angle step has no linked terms', async ({ page }) => {
	await page.goto(U('en', 'angle'));
	await expect(formula(page).locator('[class*="link-"]')).toHaveCount(0);
});

test('link terms have localized accessible names', async ({ page }) => {
	await page.goto(U('en', 'sine'));
	await expect(term(page, 'cos')).toHaveAttribute('aria-label', 'Highlights cosine in the picture');
	await page.goto(U('de', 'sine'));
	await expect(term(page, 'cos')).toHaveAttribute(
		'aria-label',
		'Hebt den Kosinus in der Zeichnung hervor'
	);
});
