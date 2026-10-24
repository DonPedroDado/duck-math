import { digitsFor } from '#lib/limits/approach.ts';
import type { LIView } from './view.ts';

/** Readout decimals: x resolves the gap near a, or shrinks as x runs to ±∞; f(x) shows its approach to 2. */
export function xDigits(v: LIView): number {
	if (v.pointing === 'out') {
		const m = Math.max(Math.abs(v.xl), Math.abs(v.xr));
		return m >= 100 ? 0 : m >= 10 ? 1 : 2;
	}
	return digitsFor(v.hx);
}
export const yDigits = (v: LIView) => (v.pointing === 'out' ? 4 : 2);
