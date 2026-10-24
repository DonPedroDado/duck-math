import { describe, it, expect } from 'vitest';
import { nextConcept } from './next';

const L = ['a', 'b', 'c'].map((id) => ({ id, path: `/x/${id}/`, title: () => id.toUpperCase() }));

describe('nextConcept', () => {
	it('first and middle point to the successor', () => {
		const a = nextConcept(L, 'a');
		expect(a).toMatchObject({ kind: 'next', path: '/x/b/' });
		expect(a.kind === 'next' && a.title()).toBe('B');
		expect(nextConcept(L, 'b')).toMatchObject({ kind: 'next', path: '/x/c/' });
	});
	it('last goes back to catalog', () => {
		expect(nextConcept(L, 'c')).toEqual({ kind: 'catalog' });
	});
	it('unknown goes back to catalog', () => {
		expect(nextConcept(L, 'zzz')).toEqual({ kind: 'catalog' });
	});
});
