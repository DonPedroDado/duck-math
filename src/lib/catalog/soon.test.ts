import { describe, it, expect } from 'vitest';
import { stillSoon } from './soon.ts';

describe('stillSoon', () => {
	const up = [{ id: 'functions', replacedBy: ['function-shifts'] }, { id: 'limits' }];
	it('keeps cards whose concepts do not exist yet', () => {
		expect(stillSoon(up, ['unit-circle']).map((u) => u.id)).toEqual(['functions', 'limits']);
	});
	it('hides a card once one of its concepts exists', () => {
		expect(stillSoon(up, ['unit-circle', 'function-shifts']).map((u) => u.id)).toEqual(['limits']);
	});
});
