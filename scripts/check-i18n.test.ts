import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
// @ts-expect-error plain JS module
import { checkMessages } from './check-i18n.mjs';

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
const cli = (...args: string[]) =>
	spawnSync('node', ['scripts/check-i18n.mjs', ...args], { encoding: 'utf8' });

describe('checkMessages', () => {
	it('ok when identical keys', () => {
		expect(checkMessages({ en: { a: 'x' }, de: { a: 'y' } })).toEqual([]);
	});
	it('missing in de', () => {
		expect(checkMessages({ en: { a: 'x', b: 'z' }, de: { a: 'y' } })).toEqual(['missing in de: b']);
	});
	it('missing in en', () => {
		expect(checkMessages({ en: { a: 'x' }, de: { a: 'y', c: 'q' } })).toEqual(['missing in en: c']);
	});
	it('placeholder mismatch', () => {
		expect(
			checkMessages({ en: { a: 'Step {n} of {total}' }, de: { a: 'Schritt {n}' } })
		).toEqual(['placeholder mismatch: a (en: n,total | de: n)']);
	});
	it('empty value', () => {
		expect(checkMessages({ en: { a: '' }, de: { a: 'y' } })).toEqual(['empty in en: a']);
	});
	it('non-string values are errors', () => {
		expect(checkMessages({ en: { a: { one: 'x' } }, de: { a: 'y' } })).toEqual(['not a string in en: a (object)']);
		expect(checkMessages({ en: { a: 'x' }, de: { a: ['y'] } })).toEqual(['not a string in de: a (array)']);
	});
	it('ignores $schema', () => {
		expect(checkMessages({ en: { $schema: 'a', k: 'x' }, de: { k: 'y' } })).toEqual([]);
	});
	it('short captions pass', () => {
		expect(
			checkMessages({ en: { x_caption: 'one two three' }, de: { x_caption: 'eins zwei drei' } })
		).toEqual([]);
	});
	it('19-word EN caption fails', () => {
		expect(checkMessages({ en: { x_caption: words(19) }, de: { x_caption: 'kurz' } })).toEqual([
			'caption too long in en: x_caption (19 > 18)'
		]);
	});
	it('DE 25 passes, 26 fails', () => {
		expect(checkMessages({ en: { x_caption: 'a' }, de: { x_caption: words(25) } })).toEqual([]);
		expect(checkMessages({ en: { x_caption: 'a' }, de: { x_caption: words(26) } })).toEqual([
			'caption too long in de: x_caption (26 > 25)'
		]);
	});
	it('non-caption keys not counted', () => {
		expect(checkMessages({ en: { x: words(40) }, de: { x: words(40) } })).toEqual([]);
	});
});

describe('CLI', () => {
	it('real messages pass', () => {
		const r = cli();
		expect(r.status).toBe(0);
		expect(r.stdout).toContain('keys OK');
	});
	it('--dir without a value prints usage', () => {
		const r = cli('--dir');
		expect(r.status).toBe(2);
		expect(r.stderr).toContain('usage:');
	});
	it('missing fixture fails', () => {
		const r = cli('--dir', 'scripts/fixtures/i18n-missing');
		expect(r.status).toBe(1);
		expect(r.stderr).toContain('missing in de');
	});
	it('placeholder fixture fails', () => {
		const r = cli('--dir', 'scripts/fixtures/i18n-placeholder');
		expect(r.status).toBe(1);
		expect(r.stderr).toContain('placeholder mismatch');
	});
	it('caption fixture fails', () => {
		const r = cli('--dir', 'scripts/fixtures/i18n-caption-long');
		expect(r.status).toBe(1);
		expect(r.stderr).toContain('caption too long in en');
	});
});
