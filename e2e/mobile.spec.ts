import { test, expect, type Page } from '@playwright/test';
import { touchDrag } from './helpers/touch';

const VIEWPORTS = [
	{ width: 320, height: 640 },
	{ width: 390, height: 844 }
];
const LOCALES = ['en', 'de'] as const;
const TITLE = { en: 'Unit circle', de: 'Einheitskreis' };
const BACK = { en: 'Catalog', de: 'Katalog' };

async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}

for (const vp of VIEWPORTS) {
	for (const l of LOCALES) {
		test.describe(`phone ${vp.width}x${vp.height} ${l}`, () => {
			test.use({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
			test.beforeEach(({}, testInfo) => {
				test.skip(testInfo.project.name !== 'desktop', 'run once');
			});

			for (const p of ['', 'high-school/unit-circle/radians/', 'high-school/unit-circle/sine/']) {
				test(`no horizontal overflow /${p}`, async ({ page }) => {
					await page.goto(`/${l}/${p}`);
					await page.waitForLoadState('networkidle');
					const o = await page.evaluate(() => [
						document.documentElement.scrollWidth,
						window.innerWidth
					]);
					expect(o[0]).toBeLessThanOrEqual(o[1]);
				});
			}

			test('targets and caption', async ({ page }) => {
				await page.goto(`/${l}/high-school/unit-circle/radians/`);
				const iw = await page.evaluate(() => window.innerWidth);
				for (const id of ['player-reset', 'player-prev', 'player-next', 'player-play']) {
					const b = (await page.getByTestId(id).boundingBox())!;
					const min = id === 'player-play' ? 48 : 44;
					expect(b.width).toBeGreaterThanOrEqual(min - 0.5);
					expect(b.height).toBeGreaterThanOrEqual(min - 0.5);
					expect(b.x).toBeGreaterThanOrEqual(0);
					expect(b.x + b.width).toBeLessThanOrEqual(iw);
				}
				const cap = page.getByTestId('caption');
				const cb = (await cap.boundingBox())!;
				expect(cb.x + cb.width).toBeLessThanOrEqual(iw + 0.5);
				const clip = await cap.evaluate((el) => {
					const cs = getComputedStyle(el);
					return cs.overflow === 'visible' || el.scrollHeight <= el.clientHeight + 1;
				});
				expect(clip).toBe(true);
			});

			test('touch drag moves point without scrolling', async ({ page }) => {
				await page.goto(`/${l}/high-school/unit-circle/sine/`);
				await expect(page.getByTestId('concept')).toHaveAttribute('data-playing', 'false', {
					timeout: 8000
				});
				const sy = await page.evaluate(() => scrollY);
				await touchDrag(page, await pointAt(page, 60), await pointAt(page, 150));
				await expect(page.getByTestId('theta-readout')).toHaveText(/^(1(49|50|51)°|2[.,]6[0-4])$/);
				expect(await page.evaluate(() => scrollY)).toBe(sy);
			});

			test('sticky stage and bar', async ({ page }) => {
				await page.goto(`/${l}/high-school/unit-circle/sine/`);
				await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
				await page.waitForTimeout(150);
				const s = (await page.getByTestId('stage').boundingBox())!;
				const iw = await page.evaluate(() => window.innerWidth);
				const ih = await page.evaluate(() => window.innerHeight);
				expect(Math.abs(s.y - 56)).toBeLessThanOrEqual(2 + 1); // stage border
				expect(s.x).toBeGreaterThanOrEqual(0);
				expect(s.x + s.width).toBeLessThanOrEqual(iw);
				const pb = (await page.getByTestId('player-play').boundingBox())!;
				expect(pb.y + pb.height).toBeLessThanOrEqual(ih);
			});

			test('tap play', async ({ page }) => {
				await page.goto(`/${l}/high-school/unit-circle/`);
				await page.getByTestId('player-play').tap();
				await expect(page.getByTestId('concept')).toHaveAttribute('data-playing', 'true');
			});

			test('header back + title', async ({ page }) => {
				await page.goto(`/${l}/high-school/unit-circle/`);
				const back = page.locator('header').getByRole('link', { name: BACK[l] });
				const b = (await back.boundingBox())!;
				expect(b.width).toBeGreaterThanOrEqual(43.5);
				expect(b.height).toBeGreaterThanOrEqual(43.5);
				await expect(back).toHaveAttribute('href', new RegExp(`^/${l}/?$`));
				await expect(page.locator('header').getByText(TITLE[l], { exact: true })).toBeVisible();
			});
		});
	}
}

test.describe('desktop header', () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop', 'run once');
	});
	test.use({ viewport: { width: 1280, height: 800 } });
	test('back link on concept, none on catalog', async ({ page }) => {
		await page.goto('/en/high-school/unit-circle/');
		await expect(page.locator('header').getByRole('link', { name: 'Catalog' })).toBeVisible();
		await expect(page.locator('header .wordmark')).toBeVisible();
		await page.goto('/en/');
		await expect(page.locator('header').getByRole('link', { name: 'Catalog' })).toHaveCount(0);
	});
});

test.describe('polish', () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(testInfo.project.name !== 'desktop', 'run once');
	});
	test.use({ viewport: { width: 1280, height: 800 } });

	const filtered = (page: Page) =>
		page.evaluate(() => document.querySelectorAll('[data-testid=stage] [filter]').length);

	test('stroke glow only while animating', async ({ page }) => {
		await page.goto('/en/high-school/unit-circle/angle/');
		await page.getByTestId('player-play').click();
		await page.waitForTimeout(500);
		const n = await filtered(page);
		expect(n).toBeGreaterThanOrEqual(1);
		expect(n).toBeLessThanOrEqual(2);
		await expect(page.getByTestId('concept')).toHaveAttribute('data-playing', 'false', {
			timeout: 12000
		});
		await page.waitForTimeout(1000);
		expect(await filtered(page)).toBe(0);
	});

	test('point halo on hover', async ({ page }) => {
		await page.goto('/en/high-school/unit-circle/angle/');
		const p = await pointAt(page, 60);
		const scaleOf = () =>
			page.getByTestId('point-halo').evaluate((el) => {
				const t = getComputedStyle(el).transform;
				return t === 'none' ? 1 : new DOMMatrix(t).a;
			});
		const before = await scaleOf();
		await page.mouse.move(p.x, p.y);
		await page.waitForTimeout(400);
		expect(await scaleOf()).toBeGreaterThan(before);
		expect(await filtered(page)).toBeGreaterThanOrEqual(1);
	});

	test('cos label nudged away from point', async ({ page }) => {
		await page.goto('/en/high-school/unit-circle/cosine/');
		await expect(page.getByTestId('concept')).toHaveAttribute('data-playing', 'false', {
			timeout: 12000
		});
		const p = await pointAt(page, 60);
		const q = await pointAt(page, 2);
		await page.mouse.move(p.x, p.y);
		await page.mouse.down();
		await page.mouse.move(q.x, q.y, { steps: 8 });
		await page.mouse.up();
		await expect(page.getByTestId('theta-readout')).toHaveText(/^(1°|2°|3°|0[.,]0[2-6])$/);
		const lb = (await page.getByTestId('cos-label').boundingBox())!;
		const pb = (await page.getByTestId('drag-point').locator('circle').first().boundingBox())!;
		const d = Math.hypot(
			lb.x + lb.width / 2 - (pb.x + pb.width / 2),
			lb.y + lb.height / 2 - (pb.y + pb.height / 2)
		);
		expect(d).toBeGreaterThanOrEqual(25);
	});

	test('play pulse', async ({ page }) => {
		await page.goto('/en/high-school/unit-circle/');
		await expect(page.getByTestId('player-play')).toHaveAttribute('data-pulse', 'true');
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/en/high-school/unit-circle/');
		await expect(page.getByTestId('player-play')).not.toHaveAttribute('data-pulse', 'true');
	});
});
