import { test, expect, type Page } from '@playwright/test';

const U = (loc: string, step: string) => `/${loc}/high-school/unit-circle/${step}/`;
const formula = (page: Page) => page.getByTestId('formula');

async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}
async function drag(page: Page, from: number, to: number) {
	const a = await pointAt(page, from);
	const z = await pointAt(page, to);
	await page.mouse.move(a.x, a.y);
	await page.mouse.down();
	await page.mouse.move(z.x, z.y, { steps: 10 });
	await page.mouse.up();
}
const color = (l: import('@playwright/test').Locator) =>
	l.evaluate((el) => getComputedStyle(el).color);

test('cosine step en: value, color, segment', async ({ page }) => {
	await page.goto(U('en', 'cosine'));
	const f = formula(page);
	await expect(f).toContainText('0.50');
	expect(await color(f.locator('.t-cos').first())).toBe('rgb(79, 195, 247)');
	await expect(page.getByTestId('cos-seg')).toBeAttached();
	await expect(page.getByTestId('cos-seg')).toHaveAttribute('data-len', '0.500');
	const sin = page.getByTestId('sin-seg');
	if ((await sin.count()) > 0) await expect(sin).toHaveAttribute('data-len', '0.000');
});

test('cosine step de: decimal comma', async ({ page }) => {
	await page.goto(U('de', 'cosine'));
	await expect(formula(page)).toContainText('0,50');
	await expect(formula(page)).not.toContainText('0.50');
});

test('sine step de: both formulas and segments', async ({ page }) => {
	await page.goto(U('de', 'sine'));
	const f = formula(page);
	await expect(f).toContainText('0,50');
	await expect(f).toContainText('0,87');
	await expect(f).toContainText(';');
	expect(await color(f.locator('.t-sin').first())).toBe('rgb(255, 138, 101)');
	await expect(page.getByTestId('cos-seg')).toBeAttached();
	await expect(page.getByTestId('sin-seg')).toBeAttached();
});

test('live update, minus and label flip', async ({ page }) => {
	await page.goto(U('en', 'cosine'));
	await drag(page, 60, 240);
	await expect(formula(page)).toContainText('−');
	await expect(formula(page)).toContainText('0.50');
	const ly = Number(await page.getByTestId('cos-label').getAttribute('y'));
	const sy = Number(await page.getByTestId('cos-seg').getAttribute('y1'));
	expect(ly).toBeLessThan(sy);
	await page.goto(U('de', 'cosine'));
	await drag(page, 60, 240);
	await expect(formula(page)).toContainText('−0,50');
});

test('90 degrees hides zero-length cos', async ({ page }) => {
	await page.goto(U('en', 'cosine'));
	await page.getByTestId('drag-point').locator('[tabindex]').focus();
	for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowRight');
	await expect(page.getByTestId('theta-readout')).toHaveText(/^(90°|1[.,]57)$/);
	await expect(formula(page)).toContainText('0.00');
	await expect(formula(page)).not.toContainText('−0.00');
	await expect(page.getByTestId('cos-seg')).toHaveCount(0);
});

test('angle, radian, radians formulas', async ({ page }) => {
	await page.goto(U('en', 'angle'));
	await expect(formula(page)).toContainText('60');
	expect(await color(formula(page).locator('.t-angle').first())).toBe('rgb(255, 213, 74)');
	await page.goto(U('en', 'radian'));
	await expect(formula(page)).toContainText('rad');
	expect(await color(formula(page).locator('.t-radian').first())).toBe('rgb(179, 157, 219)');
	await page.goto(U('en', 'radians'));
	await expect(formula(page)).toContainText('π');
	await expect(formula(page)).toContainText('≈');
	await expect(formula(page)).toContainText('1.05');
});

test('prerendered without JS', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto(U('de', 'sine'), { baseURL: test.info().project.use.baseURL });
	await expect(page.locator('.t-sin').first()).toBeAttached();
	await expect(formula(page)).toContainText('0,87');
	await ctx.close();
});

test('all requests same-origin', async ({ page }) => {
	const origin = new URL(test.info().project.use.baseURL!).origin;
	const bad: string[] = [];
	page.on('request', (r) => {
		const u = r.url();
		if (u.startsWith('data:') || u.startsWith('blob:')) return;
		if (new URL(u).origin !== origin) bad.push(u);
	});
	await page.goto(U('en', 'sine'));
	await page.waitForLoadState('networkidle');
	expect(bad).toEqual([]);
});

for (const loc of ['en', 'de']) {
	test(`no KaTeX fallback on any step (${loc})`, async ({ page }) => {
		for (const step of ['intro', 'angle', 'radian', 'radians', 'cosine', 'sine']) {
			await page.goto(U(loc, step));
			await expect(page.getByTestId('concept')).toHaveAttribute('data-step', step);
			await expect(page.getByTestId('tex-error')).toHaveCount(0);
		}
	});
}
