import { norm } from '#lib/engine/angle.ts';

export interface Special {
	deg: number;
	sin: string;
	cos: string;
	tan: string;
	rad: string;
}

/** First-quadrant exact values (TeX). The special triangles 45-45-90 and 30-60-90 produce exactly these. */
const Q1: Record<number, [string, string, string]> = {
	30: ['\\tfrac{1}{2}', '\\tfrac{\\sqrt{3}}{2}', '\\tfrac{\\sqrt{3}}{3}'],
	45: ['\\tfrac{\\sqrt{2}}{2}', '\\tfrac{\\sqrt{2}}{2}', '1'],
	60: ['\\tfrac{\\sqrt{3}}{2}', '\\tfrac{1}{2}', '\\sqrt{3}']
};

const RAD: Record<number, string> = {
	30: '\\tfrac{\\pi}{6}',
	45: '\\tfrac{\\pi}{4}',
	60: '\\tfrac{\\pi}{3}',
	120: '\\tfrac{2\\pi}{3}',
	135: '\\tfrac{3\\pi}{4}',
	150: '\\tfrac{5\\pi}{6}',
	210: '\\tfrac{7\\pi}{6}',
	225: '\\tfrac{5\\pi}{4}',
	240: '\\tfrac{4\\pi}{3}',
	300: '\\tfrac{5\\pi}{3}',
	315: '\\tfrac{7\\pi}{4}',
	330: '\\tfrac{11\\pi}{6}'
};

const neg = (s: string) => `-${s}`;

function build(): Special[] {
	const out: Special[] = [];
	for (const a of [30, 45, 60]) {
		const [s, c, t] = Q1[a];
		const push = (deg: number, sinPos: boolean, cosPos: boolean) =>
			out.push({
				deg,
				sin: sinPos ? s : neg(s),
				cos: cosPos ? c : neg(c),
				tan: sinPos === cosPos ? t : neg(t),
				rad: RAD[deg]
			});
		push(a, true, true);
		push(180 - a, true, false);
		push(180 + a, false, false);
		push(360 - a, false, true);
	}
	return out.sort((p, q) => p.deg - q.deg);
}

/** The 12 non-axis special angles with exact TeX values. Proven equal to Math.sin/cos/tan in tests. */
export const SPECIAL: readonly Special[] = build();

/** Entry for theta when it is (within 1e-9) one of the special angles, else null. */
export function exactFor(theta: number): Special | null {
	const t = norm(theta);
	return SPECIAL.find((s) => Math.abs((s.deg * Math.PI) / 180 - t) < 1e-9) ?? null;
}
