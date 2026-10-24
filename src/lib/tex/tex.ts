import katex from 'katex';

/** Render repo-authored TeX. Trust is limited to \htmlClass; strict:false is required for it. */
export function tex(src: string): string {
	return katex.renderToString(src, {
		trust: (ctx) => ctx.command === '\\htmlClass',
		strict: false,
		throwOnError: true,
		output: 'htmlAndMathml'
	});
}

/** Locale-formatted number -> TeX-safe: ASCII minus, braces around decimal comma. */
export function texNum(formatted: string): string {
	return formatted.replace(/−/g, '-').replace(/,/g, '{,}');
}
