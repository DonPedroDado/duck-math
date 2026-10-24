import { describe, it, expect } from 'vitest';
import { UC_BASE, stepPath } from './urls.ts';
import { STEP_IDS } from './step-ids.ts';

describe('urls', () => {
	it('builds step paths', () => {
		expect(UC_BASE).toBe('/high-school/unit-circle/');
		expect(stepPath('cosine')).toBe('/high-school/unit-circle/cosine/');
	});
	it('gives 6 unique trailing-slash paths', () => {
		const p = STEP_IDS.map(stepPath);
		expect(p).toHaveLength(6);
		expect(new Set(p).size).toBe(6);
		p.forEach((x) => expect(x.endsWith('/')).toBe(true));
	});
});
