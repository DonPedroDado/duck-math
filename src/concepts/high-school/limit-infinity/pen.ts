/**
 * The continuity summary (L-14): one function with all three ways to lift the pen.
 * A hole at −3.5, a jump at −1, a vertical asymptote at 3.
 */
export const PEN = {
	f: (x: number) => (x < -1 ? 0.5 * x + 2.5 : x < 3 ? 1 / (3 - x) - 1 : 1 - 1 / (x - 3)),
	breaks: [-3.5, -1, 3],
	/** Where the pen lifts, in order, and what kind of break it is. */
	lifts: [
		{ x: -3.5, kind: 'hole', y: 0.75 },
		{ x: -1, kind: 'jump', y: 2 },
		{ x: 3, kind: 'asym', y: 4.5 }
	],
	open: [
		[-3.5, 0.75],
		[-1, 2]
	],
	filled: [[-1, -0.75]],
	vAsym: [3],
	/** The pen travels the whole window. */
	from: -5,
	to: 5
} as const;

export type BreakKind = (typeof PEN.lifts)[number]['kind'];

/** Plotted everywhere except exactly at a break (the hole is not part of the graph). */
export const penDefined = (x: number) => !PEN.breaks.includes(x as never);
