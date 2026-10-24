import { test as base, expect } from '@playwright/test';

/**
 * Prerendered HTML is interactive-looking before Svelte hydrates (the concept
 * runtime is a lazy chunk). Keys or clicks sent in that window are lost, so
 * full-page navigations wait for the root layout's `data-hydrated` marker.
 * Soft wait: pages outside the app (root redirect) never set it.
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		const hydrated = () =>
			page
				.waitForSelector('html[data-hydrated]', { state: 'attached', timeout: 5000 })
				.catch(() => undefined);
		const goto = page.goto.bind(page);
		const reload = page.reload.bind(page);
		page.goto = async (...args) => {
			const res = await goto(...args);
			await hydrated();
			return res;
		};
		page.reload = async (...args) => {
			const res = await reload(...args);
			await hydrated();
			return res;
		};
		await use(page);
	}
});

export { expect };
