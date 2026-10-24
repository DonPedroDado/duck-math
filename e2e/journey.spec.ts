import type { Page } from '@playwright/test';
import { test, expect } from './helpers/test';

const HS = '/high-school/';
const concept = (page: Page) => page.getByTestId('concept');

/** Each concept's last step and the concept its Next link leads to. */
const CHAIN = [
	['unit-circle', 'sine', 'tangent'],
	['tangent', 'all', 'sine-cosine-graphs'],
	['sine-cosine-graphs', 'explore', 'trig-identities'],
	['trig-identities', 'special', 'function-shifts'],
	['function-shifts', 'both', 'function-stretches'],
	['function-stretches', 'explore', 'function-combine'],
	['function-combine', 'explore', 'limit-approach']
] as const;
/** The last concept's last step: its Next link returns to the catalog. */
const END = 'limit-approach/oscillate/';

/** [concept, predict step, step before it]. */
const PREDICT = [
	['tangent', 'tan', 'intro'],
	['sine-cosine-graphs', 'sine', 'unroll'],
	['trig-identities', 'supplement', 'negative'],
	['function-shifts', 'opposite', 'vertical'],
	['function-stretches', 'horizontal', 'vertical'],
	['function-combine', 'order', 'build-d'],
	['limit-approach', 'predict', 'intro']
] as const;

/** [url, hovered term, role that dims]. */
const LINKS = [
	['unit-circle/sine/', 'cos', 'sin'],
	['tangent/tan/', 'tan', 'cos'],
	['sine-cosine-graphs/cosine/', 'cos', 'sin'],
	['trig-identities/pythagoras/', 'cos2', 'sin2'],
	['function-shifts/horizontal/', 'c', 'ghost'],
	['function-stretches/vertical/', 'a', 'ghost'],
	['function-combine/build-d/', 'd', 'ghost'],
	['limit-approach/zoom/', 'left', 'right']
] as const;

for (const l of ['en', 'de'] as const) {
	test(`next chain (${l})`, async ({ page }) => {
		for (const [from, last, to] of CHAIN) {
			await page.goto(`/${l}${HS}${from}/${last}/`);
			await page.getByTestId('next-link').click();
			await expect(page).toHaveURL(new RegExp(`/${l}${HS}${to}/$`));
			await expect(concept(page)).toHaveAttribute('data-step', 'intro');
			// Client-side jump: the new ConceptPage must be live.
			await page.getByTestId('player-play').click();
			await expect(concept(page)).toHaveAttribute('data-playing', 'true');
		}
		await page.goto(`/${l}${HS}${END}`);
		const link = page.getByTestId('next-link');
		await expect(link).toHaveAttribute('href', `/${l}/`);
		await expect(link).toContainText(l === 'en' ? 'Back to catalog' : 'Zurück zum Katalog');
	});
}

for (const [id, step, prev] of PREDICT) {
	test(`one predict moment: ${id}`, async ({ page }) => {
		const base = `/en${HS}${id}/`;
		await page.goto(`${base}${prev}/`);
		await expect(page.locator('[data-testid^="pause-mark-"]')).toHaveCount(1);
		await expect(page.getByTestId(`pause-mark-${step}`)).toBeAttached();
		await page.getByTestId('player-play').click();
		await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
		await expect(page.getByTestId('player-play')).toHaveText('Reveal');
		// Next reveals first instead of skipping the question.
		await page.getByTestId('player-next').click();
		await expect(concept(page)).toHaveAttribute('data-predict', 'after');
		await expect(concept(page)).toHaveAttribute('data-step', step);
		// Deep links never block.
		await page.goto(`${base}${step}/`);
		await expect(concept(page)).toHaveAttribute('data-predict', 'after');
	});

	test(`predict reveal label in German: ${id}`, async ({ page }) => {
		await page.goto(`/de${HS}${id}/${prev}/`);
		await page.getByTestId('player-play').click();
		await expect(concept(page)).toHaveAttribute('data-predict', 'awaiting', { timeout: 10000 });
		await expect(page.getByTestId('player-play')).toHaveText('Aufdecken');
	});
}

for (const [url, term, other] of LINKS) {
	test(`hover linking: ${url}`, async ({ page }) => {
		await page.goto(`/en${HS}${url}`);
		await page.locator(`[data-testid="formula"] .link-${term}`).first().hover();
		await expect(page.locator(`[data-link="${other}"]`).first()).toHaveCSS('opacity', '0.25');
		await page.mouse.move(0, 0);
		await expect(page.locator(`[data-link="${other}"]`).first()).toHaveCSS('opacity', '1');
	});
}
