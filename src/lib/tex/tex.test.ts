import { describe, it, expect, vi } from 'vitest';
import { tex, texNum } from './tex.ts';

describe('tex', () => {
	it('keeps htmlClass', () => {
		expect(tex('\\htmlClass{t-cos}{\\cos\\theta}')).toContain('t-cos');
	});
	it('keeps link classes', () => {
		expect(tex('\\htmlClass{t-cos link-cos}{x}')).toContain('t-cos link-cos');
	});
	it('throws on invalid TeX', () => {
		expect(() => tex('\\frac{')).toThrow();
	});
	it('does not honor href javascript', () => {
		expect(tex('\\href{javascript:alert(1)}{x}')).not.toContain('href="javascript');
	});
	it('does not honor htmlId', () => {
		expect(tex('\\htmlId{evil}{x}')).not.toContain('id="evil"');
	});
	it('renders true minus', () => {
		expect(tex('-0.5')).toContain('−');
	});
	it('emits no warnings', () => {
		const w = vi.spyOn(console, 'warn').mockImplementation(() => {});
		for (let i = 0; i < 20; i++) tex(`\\htmlClass{t-angle}{\\theta} = ${i}`);
		expect(w).not.toHaveBeenCalled();
		w.mockRestore();
	});
});

describe('texNum', () => {
	it('converts', () => {
		expect(texNum('−0,50')).toBe('-0{,}50');
		expect(texNum('0.87')).toBe('0.87');
		expect(texNum('12,3')).toBe('12{,}3');
	});
});
