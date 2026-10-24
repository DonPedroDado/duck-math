import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const BASE = '/en/high-school/sine-cosine-graphs/';
const concept = (page: Page) => page.getByTestId('concept');
const play = (page: Page) => page.getByTestId('player-play');

test('catalog lists the Sine & cosine graphs card', async ({ page }) => {
	await page.goto('/en/');
	const card = page.locator(`[data-testid="concept-card"][href="${BASE}"]`);
	await expect(card).toBeVisible();
	await expect(card).toContainText('Sine & cosine graphs');
});

test('intro: circle and graph side by side on a shared axis', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(BASE);
	const c = page.getByTestId('frame-circle');
	const g = page.getByTestId('frame-graph');
	await expect(c).toBeVisible();
	await expect(g).toBeVisible();
	const cb = (await c.boundingBox())!;
	const gb = (await g.boundingBox())!;
	expect(gb.x).toBeGreaterThanOrEqual(cb.x + cb.width - 1);
	expect(Math.abs(cb.y + cb.height / 2 - (gb.y + gb.height / 2))).toBeLessThanOrEqual(1);
	await expect(page.getByTestId('connector')).toBeVisible();
});

test('unroll deep link shows the fully unrolled arc, no predict', async ({ page }) => {
	await page.goto(BASE + 'unroll/');
	await expect(page.getByTestId('unroll-arc')).toHaveAttribute('data-q', '1.000');
	await expect(concept(page)).toHaveAttribute('data-predict', 'none');
});

test('predict: guess the peak, reveal, wave is traced', async ({ page }) => {
	await page.goto(BASE + 'unroll/');
	await play(page).click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 8000 });
	await expect(play(page)).toHaveText(/Reveal/);
	await expect(page.getByTestId('predict-question')).toBeVisible();
	const marker = page.getByTestId('guess-marker');
	await expect(marker).toBeVisible();
	const b = (await marker.boundingBox())!;
	const x = b.x + b.width / 2;
	const y = b.y + b.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x + 40, y, { steps: 6 });
	await page.mouse.up();
	await play(page).click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	await expect(concept(page)).toHaveAttribute('data-playing', 'false', { timeout: 10000 });
	await expect(page.getByTestId('peak-marker')).toBeVisible();
	await expect(page.getByTestId('sin-curve')).toHaveAttribute('data-traced', '6.283');
	await expect(page.getByTestId('guess-connector')).toBeVisible();
});

test('predict label is localized in German', async ({ page }) => {
	await page.goto('/de/high-school/sine-cosine-graphs/unroll/');
	await play(page).click();
	await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 8000 });
	await expect(play(page)).toHaveText(/Aufdecken/);
});

test('sine deep link opens revealed with the full curve', async ({ page }) => {
	await page.goto(BASE + 'sine/');
	await expect(page.getByTestId('sin-curve')).toHaveAttribute('data-traced', '6.283');
	await expect(concept(page)).toHaveAttribute('data-predict', 'after');
});

test('circle drag moves the graph point to x = θ', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(BASE + 'unroll/');
	const slider = page.locator('[data-testid="drag-point"] [role="slider"]');
	await slider.focus();
	await page.keyboard.press('Home');
	for (let k = 0; k < 6; k++) await page.keyboard.press('Shift+ArrowUp');
	await expect(page.getByTestId('theta-readout')).toHaveText('90°');
	const fg = page.getByTestId('frame-graph');
	const x0 = Number(await fg.getAttribute('x'));
	const w = Number(await fg.getAttribute('width'));
	const dx = Number(await page.getByTestId('graph-point').getAttribute('data-x'));
	expect(Math.abs(dx - (x0 + w / 4))).toBeLessThanOrEqual(2);
});

test('phone: circle above graph, both sticky, elbow connector', async ({ browser }) => {
	const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
	const page = await ctx.newPage();
	await page.goto(BASE);
	await page.waitForSelector('html[data-hydrated]', { state: 'attached', timeout: 5000 }).catch(() => undefined);
	const cb = (await page.getByTestId('frame-circle').boundingBox())!;
	const gb = (await page.getByTestId('frame-graph').boundingBox())!;
	expect(gb.y).toBeGreaterThanOrEqual(cb.y + cb.height - 1);
	await page.evaluate(() => window.scrollBy(0, 400));
	for (const id of ['frame-circle', 'frame-graph']) {
		const b = (await page.getByTestId(id).boundingBox())!;
		expect(b.y).toBeGreaterThanOrEqual(0);
		expect(b.y + b.height).toBeLessThanOrEqual(844);
	}
	await expect(page.getByTestId('elbow-connector')).toBeVisible();
	await ctx.close();
});

test('cosine deep link: cos curve traced and shift bracket visible', async ({ page }) => {
	await page.goto(BASE + 'cosine/');
	await expect(page.getByTestId('cos-curve')).toHaveAttribute('data-traced', '6.283');
	await expect(page.getByTestId('shift-bracket')).toBeVisible();
});

test('periodic deep link: both curves over two turns, 4π tick', async ({ page }) => {
	await page.goto(BASE + 'periodic/');
	await expect(page.getByTestId('sin-curve')).toHaveAttribute('data-traced', '12.566');
	await expect(page.getByTestId('cos-curve')).toHaveAttribute('data-traced', '12.566');
	await expect(page.getByTestId('stage').getByText('4π', { exact: true })).toBeVisible();
});

test('explore: drag along the curve and on the circle, both write one theta', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(BASE + 'explore/');
	const gs = page.locator('[data-testid="graph-point"] [role="slider"]');
	await gs.focus();
	await page.keyboard.press('Home');
	await expect(page.getByTestId('theta-readout')).toHaveText('0°');
	for (let k = 0; k < 6; k++) await page.keyboard.press('Shift+ArrowRight');
	await expect(page.getByTestId('theta-readout')).toHaveText('90°');
	await expect(page.getByTestId('drag-point')).toHaveAttribute('data-theta', '1.5708');
	const b = (await gs.boundingBox())!;
	const fb = (await page.getByTestId('frame-graph').boundingBox())!;
	const x = b.x + b.width / 2;
	const y = b.y + b.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(fb.x + fb.width + 20, y, { steps: 10 });
	await page.mouse.up();
	await expect(page.getByTestId('theta-readout')).toHaveText('720°');
	await expect(page.getByTestId('drag-point')).toHaveAttribute('data-theta', '0.0000');
	await page.locator('[data-testid="drag-point"] [role="slider"]').focus();
	await page.keyboard.press('Home');
	await expect(page.getByTestId('theta-readout')).toHaveText('0°');
});

test('comet trail is a pure function of position under scrubbing', async ({ page }) => {
	await page.goto(BASE + 'sine/');
	const tailEl = page.getByTestId('comet-tail');
	const gp = page.getByTestId('graph-point');
	await expect(tailEl.locator('line')).toHaveCount(24);
	const head0 = await tailEl.getAttribute('data-head');
	expect(head0).toBe(await gp.getAttribute('data-theta'));
	await page.getByTestId('scrubber').focus();
	for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowLeft');
	const head1 = await tailEl.getAttribute('data-head');
	expect(head1).toBe(await gp.getAttribute('data-theta'));
	expect(await tailEl.locator('line').count()).toBeLessThanOrEqual(24);
	for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowRight');
	await expect(tailEl).toHaveAttribute('data-head', head0!);
});
