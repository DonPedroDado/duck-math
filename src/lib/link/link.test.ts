import { describe, it, expect } from 'vitest';
import { link, setLink, clearLink, toggleLink } from './link.svelte.ts';

describe('link store', () => {
	it('set/toggle/clear', () => {
		setLink('sin');
		expect(link.id).toBe('sin');
		toggleLink('sin');
		expect(link.id).toBeNull();
		toggleLink('cos');
		toggleLink('cos');
		expect(link.id).toBeNull();
		setLink('tan');
		clearLink();
		expect(link.id).toBeNull();
	});
});
