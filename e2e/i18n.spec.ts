import { test, expect } from './helpers/test';

test('/en/ has lang en and English UI', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.locator('h1')).toHaveText('Visual math');
});

test('/de/ has lang de, German title and description', async ({ page }) => {
	await page.goto('/de/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('h1')).toHaveText('Mathe sehen');
	await expect(page).toHaveTitle(/Mathe sehen/);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		'content',
		'Mathe-Konzepte, die du sehen, ziehen und verstehen kannst.'
	);
});

test('switcher keeps the step URL across locales', async ({ page }) => {
	await page.goto('/en/high-school/unit-circle/cosine/');
	await page.getByTestId('locale-de').click();
	await page.waitForURL('**/de/high-school/unit-circle/cosine/');
	await expect(page.locator('h1')).toHaveText('Einheitskreis');
	expect(await page.evaluate(() => localStorage.getItem('dm-locale'))).toBe('de');
	await page.getByTestId('locale-en').click();
	await page.waitForURL('**/en/high-school/unit-circle/cosine/');
});

test('/ru/ has lang ru, Russian title and description', async ({ page }) => {
	await page.goto('/ru/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
	await expect(page.locator('h1')).toHaveText('Наглядная математика');
	await expect(page).toHaveTitle(/Наглядная математика/);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		'content',
		'Математика, которую можно увидеть, потрогать и понять.'
	);
});

test('switcher reaches Russian and remembers it', async ({ page }) => {
	await page.goto('/en/high-school/unit-circle/cosine/');
	await page.getByTestId('locale-ru').click();
	await page.waitForURL('**/ru/high-school/unit-circle/cosine/');
	await expect(page.locator('h1')).toHaveText('Единичная окружность');
	expect(await page.evaluate(() => localStorage.getItem('dm-locale'))).toBe('ru');
});

test('Russian uses school notation: tg, ctg, cosec (R-02)', async ({ page }) => {
	await page.goto('/ru/high-school/tangent/all/');
	// The visible KaTeX output (the MathML annotation repeats the TeX source, class names included).
	const formula = page.getByTestId('formula').locator('.katex-html');
	const shown = (await formula.allTextContents()).join(' ');
	for (const name of ['tg', 'ctg', 'cosec', 'sec']) expect(shown).toContain(name);
	expect(shown).not.toContain('tan');
	await expect(page.locator('svg text', { hasText: /^tg$/ })).toHaveCount(1);
	await page.goto('/en/high-school/tangent/all/');
	await expect(page.getByTestId('formula')).toContainText('tan');
});

test('Russian numbers use a decimal comma', async ({ page }) => {
	await page.goto('/ru/high-school/limit-approach/approach/');
	await expect(page.getByTestId('readout-left')).toContainText(/x = 0,\d/);
});
