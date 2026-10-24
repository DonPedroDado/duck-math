// Shared by vite.config.ts (plugin) and scripts/paraglide-compile.mjs (standalone compile for `npm run check`).
/** @type {import('@inlang/paraglide-js').CompilerOptions} */
export const paraglideOptions = {
	project: './project.inlang',
	outdir: './src/lib/paraglide',
	strategy: ['url', 'baseLocale'],
	emitTsDeclarations: true,
	urlPatterns: [
		{ pattern: '/', localized: [['en', '/en'], ['de', '/de']] },
		{ pattern: '/:path(.*)?', localized: [['en', '/en/:path(.*)?'], ['de', '/de/:path(.*)?']] }
	]
};
