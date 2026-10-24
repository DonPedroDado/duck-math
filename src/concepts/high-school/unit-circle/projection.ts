import { derive } from './derive.ts';

export interface Projection {
	cos: number;
	sin: number;
	showCos: boolean;
	showSin: boolean;
	cosLabelBelow: boolean;
	sinLabelLeft: boolean;
}

/** Pure cos/sin projection geometry: visibility and label sides. */
export function projection(theta: number): Projection {
	const { cos, sin } = derive(theta);
	return {
		cos,
		sin,
		showCos: Math.abs(cos) >= 1e-3,
		showSin: Math.abs(sin) >= 1e-3,
		cosLabelBelow: sin >= 0,
		sinLabelLeft: cos >= 0
	};
}
