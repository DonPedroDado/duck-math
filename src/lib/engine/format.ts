const TAU = 2 * Math.PI;
const DEG = '°';

// Private copy: the engine must not depend on a concept.
function norm(x: number): number {
	const r = ((x % TAU) + TAU) % TAU;
	return r === TAU ? 0 : r;
}

const cache = new Map<string, Intl.NumberFormat>();
function formatter(locale: string, digits: number): Intl.NumberFormat {
	const key = `${locale}|${digits}`;
	let f = cache.get(key);
	if (!f) {
		f = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
		cache.set(key, f);
	}
	return f;
}

/** Fixed digits, locale separators, U+2212 minus, never negative zero. */
export function fmt(x: number, digits: number, locale: string): string {
	let r = Number(x.toFixed(digits));
	if (r === 0) r = 0;
	return formatter(locale, digits).format(r).replace('-', '−');
}

export function fmtDeg(theta: number, locale: string): string {
	let d = (norm(theta) * 180) / Math.PI;
	if (d >= 359.95) d = 0;
	const nearest = Math.round(d);
	if (Math.abs(d - nearest) < 0.05) return fmt(nearest === 360 ? 0 : nearest, 0, locale) + DEG;
	return fmt(Math.round(d * 10) / 10, 1, locale) + DEG;
}

export function fmtRad(theta: number, locale: string): string {
	return fmt(norm(theta), 2, locale);
}
