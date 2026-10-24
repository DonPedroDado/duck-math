import { m } from '#lib/paraglide/messages.js';
import type { LinkId } from './ids.ts';

/** Localized role names for aria-labels. Record<LinkId, ...> makes a missing role a compile error. */
export const ROLE_NAME: Record<LinkId, () => string> = {
	angle: m.link_role_angle,
	point: m.link_role_point,
	cos: m.link_role_cos,
	sin: m.link_role_sin,
	tan: m.link_role_tan,
	sec: m.link_role_sec,
	csc: m.link_role_csc,
	cot: m.link_role_cot,
	cos2: m.link_role_cos2,
	sin2: m.link_role_sin2,
	one: m.link_role_one,
	'ghost-neg': m.link_role_ghost_neg,
	'ghost-supp': m.link_role_ghost_supp,
	'ghost-comp': m.link_role_ghost_comp,
	radian: m.link_role_radian,
	a: m.link_role_a,
	b: m.link_role_b,
	c: m.link_role_c,
	d: m.link_role_d,
	f: m.link_role_f,
	ghost: m.link_role_ghost
};
