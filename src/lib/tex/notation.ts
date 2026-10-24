/**
 * Trig function names per locale (R-02). Russian schools write tg, ctg and cosec; everyone else
 * uses tan, cot and csc. This is notation, not translated text, so it lives beside the TeX helpers.
 */
export type TrigFn = 'sin' | 'cos' | 'tan' | 'sec' | 'csc' | 'cot';

const RU: Partial<Record<TrigFn, string>> = { tan: 'tg', cot: 'ctg', csc: 'cosec' };

const local = (fn: TrigFn, locale: string) => (locale === 'ru' ? RU[fn] : undefined);

/** Plain name, for SVG labels and readouts. */
export const trigName = (fn: TrigFn, locale: string): string => local(fn, locale) ?? fn;

/** TeX operator: `\tan`, or `\operatorname{tg}` where KaTeX has no built-in. */
export function trigTex(fn: TrigFn, locale: string): string {
	const name = local(fn, locale);
	return name ? `\\operatorname{${name}}` : `\\${fn}`;
}
