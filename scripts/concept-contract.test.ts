import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
// @ts-expect-error plain JS module
import { conceptRoutes } from './concept-routes.mjs';

/** The module folder contract (MOD-01), as documented in src/concepts/AUTHORING.md. */
const REQUIRED = [
	'index.ts',
	'runtime.ts',
	'step-ids.ts',
	'steps.ts',
	'view.ts',
	'Scene.svelte',
	'Panel.svelte',
	'Thumbnail.svelte',
	'messages/en.json',
	'messages/de.json',
	'messages/ru.json'
];

const routes: { category: string; id: string; path: string; stepIds: string[] }[] = conceptRoutes();
const dir = (r: { category: string; id: string }) => path.join('src/concepts', r.category, r.id);
const read = (r: { category: string; id: string }, f: string) => fs.readFileSync(path.join(dir(r), f), 'utf8');

describe('concept module contract', () => {
	it('finds the trig and functions concepts', () => {
		const ids = routes.map((r) => r.id);
		for (const id of ['unit-circle', 'tangent', 'function-shifts', 'function-combine']) expect(ids).toContain(id);
	});

	describe.each(routes.map((r) => [r.id, r] as const))('%s', (_id, r) => {
		it('has every required file and at least one unit test', () => {
			for (const f of REQUIRED) expect(fs.existsSync(path.join(dir(r), f)), f).toBe(true);
			expect(fs.readdirSync(dir(r)).some((f) => f.endsWith('.test.ts'))).toBe(true);
		});
		it('manifest matches its folder', () => {
			const src = read(r, 'index.ts');
			expect(src).toContain(`id: '${r.id}'`);
			expect(src).toContain(`category: '${r.category}'`);
			expect(src).toContain(`path: '${r.path}'`);
			expect(src).toMatch(/order:\s*\d+/);
			expect(src).toContain('stepIds: STEP_IDS');
			expect(src).toContain('satisfies ConceptManifest');
		});
		it('runtime derives its steps from the same step ids', () => {
			expect(read(r, 'steps.ts')).toMatch(/STEP_IDS\.map\(/);
			expect(read(r, 'runtime.ts')).toContain('satisfies ConceptRuntime');
			expect(r.stepIds.length).toBeGreaterThanOrEqual(2);
			expect(new Set(r.stepIds).size).toBe(r.stepIds.length);
			for (const s of r.stepIds) expect(s).toMatch(/^[a-z][a-z0-9-]*$/);
		});
		it('messages: one key prefix, the same keys in en and de', () => {
			const keys = (l: string) =>
				Object.keys(JSON.parse(read(r, `messages/${l}.json`))).filter((k) => k !== '$schema').sort();
			const en = keys('en');
			expect(en.length).toBeGreaterThan(0);
			expect(keys('de')).toEqual(en);
			expect(new Set(en.map((k) => k.split('_')[0])).size).toBe(1);
		});
	});

	it('message prefixes are unique across concepts', () => {
		const prefixes = routes.map((r) => Object.keys(JSON.parse(read(r, 'messages/en.json'))).find((k) => k !== '$schema')!.split('_')[0]);
		expect(new Set(prefixes).size).toBe(prefixes.length);
	});
});
