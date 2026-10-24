// Scaffolds a working concept from scripts/templates/concept (MOD-03):
//   npm run new-concept -- <category>/<id> [--prefix xx] [--title "Title"] [--title-de "Titel"]
// The concept appears in the catalog with no shell edits. See src/concepts/AUTHORING.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeSettings } from './i18n-paths.mjs';

const TEMPLATE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates', 'concept');
export const CATEGORIES = ['high-school', 'university'];

const pascal = (id) => id.replace(/(^|-)([a-z0-9])/g, (_, _d, c) => c.toUpperCase());
/** Default message prefix: the initials of the id's words ('function-shifts' -> 'fs'), at least 2 letters. */
export const defaultPrefix = (id) => {
	const p = id.split('-').map((w) => w[0]).join('');
	return p.length >= 2 ? p : id.slice(0, 2);
};

/** Every message key in the shared and per-concept message files. */
function messageKeys(root) {
	const files = [path.join(root, 'messages', 'en.json')];
	const base = path.join(root, 'src', 'concepts');
	for (const cat of fs.existsSync(base) ? fs.readdirSync(base) : []) {
		const dir = path.join(base, cat);
		if (!fs.statSync(dir).isDirectory()) continue;
		for (const id of fs.readdirSync(dir)) files.push(path.join(dir, id, 'messages', 'en.json'));
	}
	return files.filter((f) => fs.existsSync(f)).flatMap((f) => Object.keys(JSON.parse(fs.readFileSync(f, 'utf8'))));
}

/** Next catalog position in the category: one past the highest `order:` there. */
function nextOrder(root, category) {
	const dir = path.join(root, 'src', 'concepts', category);
	if (!fs.existsSync(dir)) return 1;
	const orders = fs
		.readdirSync(dir)
		.map((id) => path.join(dir, id, 'index.ts'))
		.filter((f) => fs.existsSync(f))
		.map((f) => Number(fs.readFileSync(f, 'utf8').match(/order:\s*(\d+)/)?.[1] ?? 0));
	return Math.max(0, ...orders) + 1;
}

/**
 * Creates src/concepts/<category>/<id>/ under `root`. Throws with a readable message on bad
 * input; never overwrites. Returns the created folder and the files written.
 */
export function scaffold({ root = '.', category, id, prefix = defaultPrefix(id), title, titleDe }) {
	if (!CATEGORIES.includes(category)) throw new Error(`category must be one of: ${CATEGORIES.join(', ')}`);
	if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id)) throw new Error(`id must be kebab-case, e.g. "my-concept" (got "${id}")`);
	if (!/^[a-z]{2,4}$/.test(prefix)) throw new Error(`prefix must be 2-4 lowercase letters (got "${prefix}")`);
	const dir = path.join(root, 'src', 'concepts', category, id);
	if (fs.existsSync(dir)) throw new Error(`${path.relative(root, dir)} already exists`);
	const clash = messageKeys(root).find((k) => k.startsWith(`${prefix}_`));
	if (clash) throw new Error(`message prefix "${prefix}_" is taken (e.g. ${clash}); pass --prefix`);

	const name = title ?? id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
	const vars = {
		__TYPE__: pascal(id),
		__ID__: id,
		__CATEGORY__: category,
		__ORDER__: String(nextOrder(root, category)),
		__PREFIX__: prefix,
		__TITLE_DE__: titleDe ?? name,
		__TITLE__: name
	};
	const fill = (s) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(k).join(v), s);

	const written = [];
	const copy = (from, to) => {
		fs.mkdirSync(to, { recursive: true });
		for (const e of fs.readdirSync(from, { withFileTypes: true })) {
			const src = path.join(from, e.name);
			if (e.isDirectory()) copy(src, path.join(to, e.name));
			else {
				const dest = path.join(to, e.name.replace(/\.tmpl$/, ''));
				fs.writeFileSync(dest, fill(fs.readFileSync(src, 'utf8')));
				written.push(path.relative(dir, dest));
			}
		}
	};
	copy(TEMPLATE, dir);
	writeSettings(root);
	return { dir, files: written.sort(), path: `/${category}/${id}/` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const args = process.argv.slice(2);
	const opt = (name) => {
		const i = args.indexOf(name);
		return i > -1 ? args[i + 1] : undefined;
	};
	// The positional argument: not a flag and not a flag's value.
	const target = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
	if (!target) {
		console.error('usage: npm run new-concept -- <category>/<id> [--prefix xx] [--title "Title"] [--title-de "Titel"]');
		process.exit(2);
	}
	const [category, id] = target.split('/');
	try {
		const r = scaffold({ category, id, prefix: opt('--prefix'), title: opt('--title'), titleDe: opt('--title-de') });
		console.log(`created ${path.relative('.', r.dir)}/`);
		for (const f of r.files) console.log(`  ${f}`);
		console.log(`\nopen http://localhost:5173/en${r.path} (npm run dev)`);
		console.log('next: edit steps.ts, view.ts, Scene.svelte and the messages. Guide: src/concepts/AUTHORING.md');
	} catch (e) {
		console.error(`new-concept: ${e.message}`);
		process.exit(1);
	}
}
