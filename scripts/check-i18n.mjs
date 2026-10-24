// Build-time i18n parity check (I18N-04). Paraglide silently falls back to English,
// so missing/mismatched keys must be caught here.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = 'en';
const CAPTION_MAX = { en: 18, de: 25 };

const placeholders = (s) =>
	[...String(s).matchAll(/\{(\w+)\}/g)]
		.map((m) => m[1])
		.sort()
		.join(',');
const wordCount = (s) => String(s).trim().split(/\s+/).length;

export function loadCatalogs(dir = 'messages', locales) {
	if (!locales) {
		locales = JSON.parse(fs.readFileSync('project.inlang/settings.json', 'utf8')).locales;
	}
	const out = {};
	for (const locale of locales) {
		const { $schema, ...rest } = JSON.parse(
			fs.readFileSync(path.join(dir, `${locale}.json`), 'utf8')
		);
		out[locale] = rest;
	}
	return out;
}

export function checkMessages(catalogs) {
	const errors = [];
	const locales = Object.keys(catalogs);
	const keys = new Set();
	for (const l of locales) for (const k of Object.keys(catalogs[l])) if (k !== '$schema') keys.add(k);
	const base = catalogs[BASE] ?? catalogs[locales[0]];
	const baseLocale = catalogs[BASE] ? BASE : locales[0];
	for (const key of keys) {
		for (const l of locales) {
			const v = catalogs[l][key];
			if (v === undefined) {
				errors.push(`missing in ${l}: ${key}`);
				continue;
			}
			if (String(v).trim() === '') {
				errors.push(`empty in ${l}: ${key}`);
				continue;
			}
			if (l !== baseLocale && base[key] !== undefined) {
				const a = placeholders(base[key]);
				const b = placeholders(v);
				if (a !== b) {
					errors.push(`placeholder mismatch: ${key} (${baseLocale}: ${a} | ${l}: ${b})`);
				}
			}
			if (/_caption$/.test(key) && CAPTION_MAX[l] !== undefined) {
				const n = wordCount(v);
				if (n > CAPTION_MAX[l]) {
					errors.push(`caption too long in ${l}: ${key} (${n} > ${CAPTION_MAX[l]})`);
				}
			}
		}
	}
	return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const i = process.argv.indexOf('--dir');
	const dir = i > -1 ? process.argv[i + 1] : 'messages';
	const settingsLocales = JSON.parse(fs.readFileSync('project.inlang/settings.json', 'utf8')).locales;
	const catalogs = loadCatalogs(dir, settingsLocales);
	const errors = checkMessages(catalogs);
	if (errors.length) {
		for (const e of errors) console.error(e);
		process.exit(1);
	}
	const n = Object.keys(catalogs[settingsLocales[0]]).length;
	console.log(`i18n: ${n} keys OK in ${settingsLocales.join(', ')}`);
}
