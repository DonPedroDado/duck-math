import { describe, it, expect } from 'vitest';
import { isLinkId, linkFromClass, linkOpacity } from './ids.ts';

describe('link ids', () => {
	it('linkFromClass', () => {
		expect(linkFromClass('enclosing t-cos link-cos')).toBe('cos');
		expect(linkFromClass('link-ghost-neg x')).toBe('ghost-neg');
		expect(linkFromClass('link-evil')).toBeNull();
		expect(linkFromClass('')).toBeNull();
	});
	it('isLinkId', () => {
		expect(isLinkId('tan')).toBe(true);
		expect(isLinkId('__proto__')).toBe(false);
	});
	it('linkOpacity', () => {
		expect(linkOpacity('cos', null)).toBe('1');
		expect(linkOpacity('cos', 'cos')).toBe('1');
		expect(linkOpacity('cos', 'sin')).toBe('var(--dim-opacity)');
		expect(linkOpacity(['cos', 'cos2'], 'cos2')).toBe('1');
	});
});
