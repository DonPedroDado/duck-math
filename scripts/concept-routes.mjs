import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Scans src/concepts/<category>/<id>/ for folders with index.ts + step-ids.ts.
 * Folder name is the URL slug. Shared by vite.config.ts (prerender) and e2e.
 */
export function conceptRoutes(root = process.cwd()) {
	const base = join(root, 'src', 'concepts');
	/** @type {{ category: string; id: string; path: string; stepIds: string[] }[]} */
	const out = [];
	/** @param {string} p */
	const dirs = (p) => readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());
	for (const category of dirs(base)) {
		for (const id of dirs(join(base, category))) {
			const dir = join(base, category, id);
			const stepFile = join(dir, 'step-ids.ts');
			if (!existsSync(join(dir, 'index.ts')) || !existsSync(stepFile)) continue;
			const src = readFileSync(stepFile, 'utf8');
			const match = src.match(/STEP_IDS\s*=\s*\[([^\]]*)\]/);
			if (!match) throw new Error(`No STEP_IDS in ${stepFile}`);
			const stepIds = [...match[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
			out.push({ category, id, path: `/${category}/${id}/`, stepIds });
		}
	}
	return out.sort((a, b) => a.path.localeCompare(b.path));
}
