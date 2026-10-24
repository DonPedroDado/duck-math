// Shared by vite.config.ts (plugin) and scripts/paraglide-compile.mjs (standalone compile for `npm run check`).
import fs from 'node:fs';

/** Locales come from project.inlang/settings.json only, so the URL patterns can never miss one. */
/** @type {{ locales: string[] }} */
const { locales } = JSON.parse(fs.readFileSync(new URL('./project.inlang/settings.json', import.meta.url), 'utf8'));

/** @type {import('@inlang/paraglide-js').CompilerOptions} */
export const paraglideOptions = {
	project: './project.inlang',
	outdir: './src/lib/paraglide',
	strategy: ['url', 'baseLocale'],
	emitTsDeclarations: true,
	urlPatterns: [
		{ pattern: '/', localized: locales.map((l) => [l, `/${l}`]) },
		{ pattern: '/:path(.*)?', localized: locales.map((l) => [l, `/${l}/:path(.*)?`]) }
	]
};
