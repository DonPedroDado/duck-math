import { describe, it, expect } from 'vitest';
import { snapSpecial } from './snap';

const rad = (d: number) => (d * Math.PI) / 180;

describe('snapSpecial', () => {
	it('snaps within tolerance', () => {
		expect(snapSpecial(rad(62))).toBe(rad(60));
		expect(snapSpecial(rad(57.1))).toBe(rad(60));
		expect(snapSpecial(rad(328))).toBe(rad(330));
	});
	it('leaves outside tolerance and axes', () => {
		expect(snapSpecial(rad(56.9))).toBe(rad(56.9));
		expect(snapSpecial(rad(88))).toBe(rad(88));
		expect(snapSpecial(rad(359))).toBe(rad(359));
	});
	it('is stateless', () => {
		expect(snapSpecial(rad(44))).toBe(snapSpecial(rad(44)));
	});
});
