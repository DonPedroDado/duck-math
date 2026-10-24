import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type CBUser } from './steps.ts';
import { view, type CBView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.cb_step_intro_title(),
	'build-c': () => m.cb_step_build_c_title(),
	'build-b': () => m.cb_step_build_b_title(),
	'build-a': () => m.cb_step_build_a_title(),
	'build-d': () => m.cb_step_build_d_title(),
	order: () => m.cb_step_order_title(),
	explore: () => m.cb_step_explore_title()
};
const stepTitle = (i: number) => TITLES[STEP_IDS[i]]();

export default {
	steps: STEPS,
	policy: POLICY,
	stepDefaults,
	initialUser,
	view,
	stepTitle,
	Scene,
	Panel
} satisfies ConceptRuntime<CBUser, CBView>;
