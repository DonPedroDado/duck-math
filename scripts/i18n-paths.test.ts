import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// @ts-expect-error plain JS module
import { messagePatterns, staleness, writeSettings, SETTINGS } from './i18n-paths.mjs';

let root: string;
const mk = (rel: string) => fs.mkdirSync(path.join(root, rel), { recursive: true });
const settings = (pp: string[]) =>
	fs.writeFileSync(
		path.join(root, SETTINGS),
		JSON.stringify({ locales: ['en', 'de'], 'plugin.inlang.messageFormat': { pathPattern: pp } })
	);

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-paths-'));
	mk('project.inlang');
	mk('src/concepts/high-school/b-concept/messages');
	mk('src/concepts/high-school/a-concept/messages');
	mk('src/concepts/high-school/no-messages');
	mk('src/concepts/university/c-concept/messages');
	fs.writeFileSync(path.join(root, 'src/concepts/types.ts'), '');
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe('i18n paths', () => {
	it('lists shared messages first, then concept folders with messages, sorted', () => {
		expect(messagePatterns(root)).toEqual([
			'./messages/{locale}.json',
			'./src/concepts/high-school/a-concept/messages/{locale}.json',
			'./src/concepts/high-school/b-concept/messages/{locale}.json',
			'./src/concepts/university/c-concept/messages/{locale}.json'
		]);
	});
	it('reports a new concept folder missing from settings', () => {
		settings(['./messages/{locale}.json', './src/concepts/gone/x/messages/{locale}.json']);
		const s = staleness(root);
		expect(s.missing).toHaveLength(3);
		expect(s.extra).toEqual(['./src/concepts/gone/x/messages/{locale}.json']);
	});
	it('write syncs pathPattern and is idempotent', () => {
		settings(['./messages/{locale}.json']);
		expect(writeSettings(root)).toBe(true);
		expect(staleness(root)).toEqual({ missing: [], extra: [] });
		expect(writeSettings(root)).toBe(false);
		const s = JSON.parse(fs.readFileSync(path.join(root, SETTINGS), 'utf8'));
		expect(s.locales).toEqual(['en', 'de']);
	});
});
