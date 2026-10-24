/**
 * Limit examples as data (L-03, L-04, Pitfall 4). The limits are declared analytically and
 * f is never evaluated at a to get them: at a hole that gives 0/0, at a jump it gives one side.
 */

/** A one-sided limit: a number, ±Infinity, or 'osc' (keeps oscillating, no limit). */
export type Side = number | 'osc';
/** The two-sided limit, or 'dne' when the sides disagree or either has none. */
export type Limit = number | 'dne';

export interface Scenario {
	id: ScenarioId;
	f: (x: number) => number;
	/** Where x goes: a number, or 'infinity' (left handle → −∞, right handle → +∞). */
	at: number | 'infinity';
	/** Limit from the left (or as x → −∞) and from the right (or as x → +∞). */
	left: Side;
	right: Side;
	/** f(at) as a filled dot; undefined = no value there (hole, asymptote, outside the domain). */
	value?: number;
	/** Where the plot must split (jumps, vertical asymptotes). */
	breaks: readonly number[];
	/** Dashed asymptote lines. */
	vAsym: readonly number[];
	hAsym: readonly number[];
	/** Needs dense sampling (oscillation). */
	dense?: boolean;
	/** The formula as TeX (no words; shared by both locales). */
	tex: string;
}

export type ScenarioId = 'hole' | 'holeValue' | 'jump' | 'osc' | 'recip' | 'recipSq' | 'rational';

const hole = (x: number) => (x * x - 1) / (x - 1);

export const SCENARIOS: Record<ScenarioId, Scenario> = {
	hole: {
		id: 'hole',
		f: hole,
		at: 1,
		left: 2,
		right: 2,
		breaks: [],
		vAsym: [],
		hAsym: [],
		tex: 'f(x) = \\dfrac{x^2 - 1}{x - 1}'
	},
	holeValue: {
		id: 'holeValue',
		// Same curve; only the value at 1 is redefined, which the plot never samples.
		f: hole,
		at: 1,
		left: 2,
		right: 2,
		value: 3,
		breaks: [],
		vAsym: [],
		hAsym: [],
		tex: 'f(x) = \\begin{cases} \\dfrac{x^2 - 1}{x - 1} & x \\ne 1 \\\\[4pt] 3 & x = 1 \\end{cases}'
	},
	jump: {
		id: 'jump',
		f: (x) => (x < 1 ? x + 1 : x - 1),
		at: 1,
		left: 2,
		right: 0,
		value: 0,
		breaks: [1],
		vAsym: [],
		hAsym: [],
		tex: 'f(x) = \\begin{cases} x + 1 & x < 1 \\\\ x - 1 & x \\ge 1 \\end{cases}'
	},
	osc: {
		id: 'osc',
		f: (x) => Math.sin(1 / x),
		at: 0,
		left: 'osc',
		right: 'osc',
		breaks: [0],
		vAsym: [],
		hAsym: [],
		dense: true,
		tex: 'f(x) = \\sin\\!\\left(\\dfrac{1}{x}\\right)'
	},
	recip: {
		id: 'recip',
		f: (x) => 1 / x,
		at: 0,
		left: -Infinity,
		right: Infinity,
		breaks: [0],
		vAsym: [0],
		hAsym: [],
		tex: 'f(x) = \\dfrac{1}{x}'
	},
	recipSq: {
		id: 'recipSq',
		f: (x) => 1 / (x - 2) ** 2,
		at: 2,
		left: Infinity,
		right: Infinity,
		breaks: [2],
		vAsym: [2],
		hAsym: [],
		tex: 'f(x) = \\dfrac{1}{(x - 2)^2}'
	},
	rational: {
		id: 'rational',
		f: (x) => (2 * x + 1) / (x + 1),
		at: 'infinity',
		left: 2,
		right: 2,
		breaks: [-1],
		vAsym: [-1],
		hAsym: [2],
		tex: 'f(x) = \\dfrac{2x + 1}{x + 1}'
	}
};

/** The two-sided limit from the declared sides. */
export function limitOf(s: Pick<Scenario, 'left' | 'right'>): Limit {
	if (s.left === 'osc' || s.right === 'osc') return 'dne';
	return s.left === s.right ? s.left : 'dne';
}

/** Where f is plotted: everywhere except the approach point itself. */
export const definedAt = (s: Scenario) => (x: number) => typeof s.at !== 'number' || x !== s.at;
