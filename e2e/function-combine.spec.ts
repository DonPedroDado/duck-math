import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const B = '/en/high-school/function-combine/';
const concept = (page: Page) => page.getByTestId('concept');
const curve = (page: Page) => page.getByTestId('curve');
const params = async (page: Page) =>
	Promise.all(['a', 'b', 'c', 'd'].map((k) => curve(page).getAttribute(`data-${k}`)));
const lit = async (page: Page) =>
	page.getByTestId('formula').locator('.formula-line').nth(1).locator('[class*="link-"]').evaluateAll((els) =>
		els.map((e) => [...e.classList].find((c) => c.startsWith('link-'))!.slice(5))
	);

test('catalog lists combine last of the functions', async ({ page }) => {
	await page.goto('/en/');
	await expect(page.getByTestId('concept-card').nth(6)).toHaveAttribute('href', B);
});

test('build-up adds c, then b, then a, then d, each lighting its term', async ({ page }) => {
	const expected: [string, string[], string[]][] = [
		['build-c', ['1.00', '1.00', '2.00', '0.00'], ['c']],
		['build-b', ['1.00', '2.00', '2.00', '0.00'], ['b', 'c']],
		['build-a', ['-1.50', '2.00', '2.00', '0.00'], ['a', 'b', 'c']],
		['build-d', ['-1.50', '2.00', '2.00', '1.00'], ['a', 'b', 'c', 'd']]
	];
	for (const [step, ps, terms] of expected) {
		await page.goto(B + step + '/');
		expect(await params(page)).toEqual(ps);
		expect(await lit(page)).toEqual(terms);
	}
	// b squeezes toward x = c: the fixed line sits at x = 2
	await page.goto(B + 'build-b/');
	await expect(page.locator('[data-testid="fixed-axis"][data-axis="y"]')).toBeAttached();
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-x', '0.750');
});

test('order: predict f(2x − 1), revealed as half the shift', async ({ page }) => {
	await page.goto(B + 'build-d/');
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
	await expect(page.getByTestId('predict-question')).toContainText('f(2x − 1)');
	expect(await params(page)).toEqual(['1.00', '2.00', '1.00', '0.00']);
	await page.getByTestId('player-play').click();
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	expect(await params(page)).toEqual(['1.00', '2.00', '0.50', '0.00']);
	await expect(page.getByTestId('landmark-peak')).toHaveAttribute('data-x', '-0.750');
	await expect(page.getByTestId('cmp')).toBeAttached();
	await expect(page.getByTestId('caption')).toContainText('Factor out b');
});

test('explore: base chips swap f; √x breaks cleanly left of its domain', async ({ page }) => {
	await page.goto(B + 'explore/');
	const sqrt = page.getByTestId('base-sqrt');
	await sqrt.click();
	await expect(sqrt).toHaveAttribute('aria-pressed', 'true');
	await expect(curve(page)).toHaveAttribute('data-base', 'sqrt');
	await expect(page.getByTestId('formula')).toContainText('f(x)=');
	const d = await curve(page).locator('path').getAttribute('d');
	expect(d!.split('M')).toHaveLength(2);
	await page.getByRole('slider', { name: 'Horizontal shift c' }).fill('-2');
	await expect(page.getByTestId('landmark-zero')).toHaveAttribute('data-x', '-2.000');
});

test('explore: dragging the curve sets c and d', async ({ page }) => {
	await page.goto(B + 'explore/');
	const s = (await page.getByTestId('stage').boundingBox())!;
	const px = (u: number) => s.x + ((u + 6) / 12) * s.width;
	const py = (v: number) => s.y + ((6 - v) / 12) * s.height;
	await page.mouse.move(px(1.2), py(0));
	await page.mouse.down();
	await page.mouse.move(px(2.2), py(-1), { steps: 6 });
	await page.mouse.up();
	expect(await params(page)).toEqual(['1.00', '1.00', '1.00', '-1.00']);
});

test('German', async ({ page }) => {
	await page.goto('/de/high-school/function-combine/explore/');
	await expect(page.locator('h1')).toHaveText('Transformationen kombinieren');
	await expect(page.getByRole('group', { name: 'Grundgraph' })).toBeVisible();
});
