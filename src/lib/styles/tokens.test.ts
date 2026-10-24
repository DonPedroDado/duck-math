import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(__dirname, 'tokens.css'), 'utf8');

const names = [
	'bg', 'surface', 'surface-raised', 'border', 'grid', 'axis', 'text', 'text-strong', 'text-muted',
	'c-angle', 'c-point', 'c-cos', 'c-sin', 'c-radian', 'accent', 'accent-ink',
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
