import type { BaseId } from '#lib/graph/base.ts';

/** Base-graph chips and their definitions: math notation, the same in every language. */
export const BASE_CHIP: Record<BaseId, string> = {
	f: 'f',
	square: 'x²',
	sqrt: '√x',
	exp2: '2ˣ',
	sin: 'sin x'
};
export const BASE_TEX: Record<BaseId, string | null> = {
	f: null,
	square: 'f(x) = x^2',
	sqrt: 'f(x) = \\sqrt{x}',
	exp2: 'f(x) = 2^x',
	sin: 'f(x) = \\sin x'
};
