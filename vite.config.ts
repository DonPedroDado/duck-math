import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { paraglideOptions } from './paraglide.config.mjs';
import { defineConfig } from 'vitest/config';
import { locales } from './src/concepts/locales.ts';
import { conceptRoutes } from './scripts/concept-routes.mjs';

const entries = [
	'*',
	...locales.flatMap((l) => [
		`/${l}/`,
		...conceptRoutes().flatMap((r) => [
			`/${l}${r.path}`,
			...r.stepIds.map((s) => `/${l}${r.path}${s}/`)
		])
	])
] as ('*' | `/${string}`)[];

export default defineConfig({
	plugins: [
		paraglideVitePlugin(paraglideOptions), // options shared with scripts/paraglide-compile.mjs
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '404.html' }),
			paths: { relative: false },
			prerender: {
				handleHttpError: 'fail',
				entries
			}
		})
	],
	test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'], environment: 'node' }
});
