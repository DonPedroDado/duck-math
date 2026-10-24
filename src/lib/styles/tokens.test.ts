import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(__dirname, 'tokens.css'), 'utf8');

const names = [
	'bg', 'surface', 'surface-raised', 'border', 'grid', 'axis', 'text', 'text-strong', 'text-muted',
	'c-angle', 'c-point', 'c-cos', 'c-sin', 'c-radian', 'c-tan', 'c-sec', 'c-csc', 'c-cot', 'c-guess',
	'ghost-opacity', 'dim-opacity', 'trail-tail', 'trail-dim', 'dur-link', 'dur-snap', 'sq-fill', 'accent', 'accent-ink',
	'glow-sm', 'glow-md', 'ease-out', 'ease-math', 'dur-ui', 'dur-draw',
	'sp-xs', 'sp-sm', 'sp-md', 'sp-lg', 'sp-xl', 'sp-2xl', 'sp-3xl',
	'fs-body', 'fs-label', 'fs-heading', 'fs-display'
];

describe('tokens.css', () => {
	it.each(names)('defines --%s', (n) => {
		expect(css).toMatch(new RegExp(`--${n}\\s*:`));
	});
});

function walk(dir: string, out: string[] = []): string[] {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (p === path.join(root, 'lib', 'paraglide')) continue;
			walk(p, out);
		} else if (/\.(svelte|ts)$/.test(e.name) && !e.name.endsWith('.test.ts')) out.push(p);
	}
	return out;
}

describe('SHELL-05: no hex colour literals outside tokens.css', () => {
	it('finds none', () => {
		const re = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b(?![\w-])/;
		const offenders: string[] = [];
		for (const f of walk(root)) {
			fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
				if (line.includes("from '#") || line.includes("import('#")) return;
				if (re.test(line)) offenders.push(`${path.relative(root, f)}:${i + 1}`);
			});
		}
		expect(offenders).toEqual([]);
	});
});

function hexToRgb(hex: string): [number, number, number] {
	return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}
const toLinear = (hex: string) =>
	hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
const lum = (hex: string) => {
	const [r, g, b] = toLinear(hex);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
	const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};
const tokenHex = (n: string) => {
	const m = css.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`));
	if (!m) throw new Error(`token ${n} missing`);
	return m[1];
};

describe('contrast (>= 7:1 on --bg)', () => {
	const bg = tokenHex('bg');
	const colours = [...css.matchAll(/--(c-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)];
	it('finds the colour tokens', () => expect(colours.length).toBeGreaterThanOrEqual(10));
	it.each(colours.map((m) => [m[1], m[2]]))('%s %s', (_n, hex) => {
		expect(ratio(hex, bg)).toBeGreaterThanOrEqual(7);
	});
	it('new hues are distinct from existing ones', () => {
		const olds = ['c-angle', 'c-point', 'c-cos', 'c-sin', 'c-radian'].map(tokenHex);
		for (const n of ['c-tan', 'c-sec', 'c-csc', 'c-cot']) {
			expect(olds).not.toContain(tokenHex(n));
		}
	});
});

// Machado et al. 2009, severity 1.0, applied to linear sRGB.
const DEUTERANOPIA = [
	[0.367322, 0.860646, -0.227968],
	[0.280085, 0.672501, 0.047413],
	[-0.01182, 0.04294, 0.968881]
];
const PROTANOPIA = [
	[0.152286, 1.052583, -0.204868],
	[0.114503, 0.786281, 0.099216],
	[-0.003882, -0.048116, 1.051998]
];
const simulate = (rgb: number[], M: number[][]) =>
	M.map((row) => Math.min(1, Math.max(0, row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2])));
function toLab(rgb: number[]) {
	const [r, g, b] = rgb;
	const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
	const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
	const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
	const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
	return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const deltaE = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const cvd = (a: string, b: string, M: number[][]) =>
	deltaE(toLab(simulate(toLinear(tokenHex(a)), M)), toLab(simulate(toLinear(tokenHex(b)), M)));
const minCvd = (a: string, b: string) => Math.min(cvd(a, b, DEUTERANOPIA), cvd(a, b, PROTANOPIA));

describe('color-blind risk pairs (D-18)', () => {
	// Low pairs and mitigation: sin/sec, cos/csc and sec/cot involve a dashed segment
	// (sec, csc) plus a text label in the tangent concept. cos/radian, tan/radian and
	// sec/angle are never drawn together (radian only in Unit circle; no angle arc in Tangent).
	it.each([
		['c-tan', 'c-sin'],
		['c-cot', 'c-angle'],
		['c-csc', 'c-radian']
	])('%s / %s stay >= 15 apart under deuteranopia and protanopia', (a, b) => {
		expect(cvd(a, b, DEUTERANOPIA)).toBeGreaterThanOrEqual(15);
		expect(cvd(a, b, PROTANOPIA)).toBeGreaterThanOrEqual(15);
	});
	it('low pairs among the six trig colours all include a dashed role', () => {
		const six = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'];
		const low: string[] = [];
		for (let i = 0; i < six.length; i++)
			for (let j = i + 1; j < six.length; j++)
				if (minCvd(`c-${six[i]}`, `c-${six[j]}`) < 15) low.push(`${six[i]}/${six[j]}`);
		const key = (p: string) => p.split('/').sort().join('/');
		expect(low.map(key).sort()).toEqual(['cos/csc', 'sec/cot', 'sin/sec'].map(key).sort());
		for (const p of low) expect(/sec|csc/.test(p)).toBe(true);
	});
});
