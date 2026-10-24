import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// @ts-expect-error plain JS module
import { scaffold, defaultPrefix } from './new-concept.mjs';

let root: string;
const write = (rel: string, body: string) => {
	fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
	fs.writeFileSync(path.join(root, rel), body);
};

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'new-concept-'));
	write('project.inlang/settings.json', JSON.stringify({ locales: ['en', 'de'], 'plugin.inlang.messageFormat': { pathPattern: ['./messages/{locale}.json'] } }));
	write('messages/en.json', JSON.stringify({ uc_title: 'Unit circle' }));
	write('src/concepts/high-school/tangent/index.ts', "export default { order: 2 };");
	write('src/concepts/high-school/tangent/messages/en.json', JSON.stringify({ tn_title: 'x' }));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe('new-concept', () => {
	it('scaffolds a filled-in concept, ordered last, and registers its messages', () => {
		const r = scaffold({ root, category: 'high-school', id: 'slope-play', title: 'Slope play', titleDe: 'Steigung' });
		expect(r.files).toEqual([
			'Panel.svelte', 'Scene.svelte', 'Thumbnail.svelte', 'index.ts', 'messages/de.json', 'messages/en.json',
			'runtime.ts', 'step-ids.ts', 'steps.ts', 'view.test.ts', 'view.ts'
		]);
		const read = (f: string) => fs.readFileSync(path.join(r.dir, f), 'utf8');
		for (const f of r.files) expect(read(f), f).not.toMatch(/__[A-Z_]+__/);
		expect(read('index.ts')).toContain("id: 'slope-play'");
		expect(read('index.ts')).toContain("path: '/high-school/slope-play/'");
		expect(read('index.ts')).toContain('order: 3,');
		expect(read('steps.ts')).toContain('interface SlopePlayUser');
		expect(JSON.parse(read('messages/en.json')).sp_title).toBe('Slope play');
		expect(JSON.parse(read('messages/de.json')).sp_title).toBe('Steigung');
		const settings = JSON.parse(fs.readFileSync(path.join(root, 'project.inlang/settings.json'), 'utf8'));
		expect(settings['plugin.inlang.messageFormat'].pathPattern).toContain('./src/concepts/high-school/slope-play/messages/{locale}.json');
	});
	it('refuses bad input and never overwrites', () => {
		expect(() => scaffold({ root, category: 'college', id: 'x-y' })).toThrow(/category/);
		expect(() => scaffold({ root, category: 'high-school', id: 'Bad_Id' })).toThrow(/kebab/);
		expect(() => scaffold({ root, category: 'high-school', id: 'tangent' })).toThrow(/already exists/);
		expect(() => scaffold({ root, category: 'high-school', id: 'tiny-note', prefix: 'tn' })).toThrow(/prefix "tn_" is taken/);
	});
	it('derives a prefix from the id', () => {
		expect(defaultPrefix('function-shifts')).toBe('fs');
		expect(defaultPrefix('limits')).toBe('li');
	});
});
