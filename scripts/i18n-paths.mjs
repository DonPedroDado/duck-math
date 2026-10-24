// Message files are discovered from the concept folders, so adding a concept needs no edit
// to project.inlang/settings.json (MOD-02). `--write` syncs settings.json; anything that
// reads messages (dev, build, paraglide, check-i18n) runs it first.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SETTINGS = 'project.inlang/settings.json';
const SHARED = './messages/{locale}.json';

/** Shared messages first, then every `src/concepts/<category>/<id>/messages/`, sorted. */
export function messagePatterns(root = '.') {
	const base = path.join(root, 'src/concepts');
	const out = [];
	for (const cat of fs.existsSync(base) ? fs.readdirSync(base).sort() : []) {
		const catDir = path.join(base, cat);
		if (!fs.statSync(catDir).isDirectory()) continue;
		for (const id of fs.readdirSync(catDir).sort()) {
			if (fs.existsSync(path.join(catDir, id, 'messages'))) {
				out.push(`./src/concepts/${cat}/${id}/messages/{locale}.json`);
			}
		}
	}
	return [SHARED, ...out];
}

function readSettings(root) {
	return JSON.parse(fs.readFileSync(path.join(root, SETTINGS), 'utf8'));
}

/** Patterns listed in settings.json but not on disk, and the other way round. */
export function staleness(root = '.') {
	const want = messagePatterns(root);
	const pp = readSettings(root)['plugin.inlang.messageFormat'].pathPattern;
	const have = Array.isArray(pp) ? pp : [pp];
	return {
		missing: want.filter((p) => !have.includes(p)),
		extra: have.filter((p) => !want.includes(p))
	};
}

/** Rewrites only pathPattern; returns true when the file changed. */
export function writeSettings(root = '.') {
	const file = path.join(root, SETTINGS);
	const before = fs.readFileSync(file, 'utf8');
	const settings = JSON.parse(before);
	settings['plugin.inlang.messageFormat'].pathPattern = messagePatterns(root);
	const after = JSON.stringify(settings, null, '\t') + '\n';
	if (after === before) return false;
	fs.writeFileSync(file, after);
	return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	if (process.argv.includes('--write')) {
		if (writeSettings()) console.log(`i18n-paths: updated ${SETTINGS}`);
	} else {
		for (const p of messagePatterns()) console.log(p);
	}
}
