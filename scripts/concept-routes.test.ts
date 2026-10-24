import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { conceptRoutes } from './concept-routes.mjs';

const routes = conceptRoutes();

describe('conceptRoutes', () => {
	it('discovers the unit circle with its steps', () => {
		expect(routes).toContainEqual(
			expect.objectContaining({
				path: '/high-school/unit-circle/',
				stepIds: ['intro', 'angle', 'radian', 'radians', 'cosine', 'sine']
			})
		);
	});
	for (const r of routes) {
		it(`${r.path} is consistent`, () => {
			expect(readFileSync(`src/concepts${r.path}index.ts`, 'utf8')).toContain(`path: '${r.path}'`);
			expect(existsSync(`src/concepts${r.path}runtime.ts`)).toBe(true);
			expect(r.stepIds.length).toBeGreaterThan(0);
			expect(new Set(r.stepIds).size).toBe(r.stepIds.length);
		});
	}
});
