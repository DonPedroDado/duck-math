import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type LIUser } from './steps.ts';
import { view, type LIView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.li_step_intro_title(),
	predict: () => m.li_step_predict_title(),
	'both-up': () => m.li_step_both_up_title(),
	'at-infinity': () => m.li_step_at_infinity_title(),
	continuity: () => m.li_step_continuity_title()
};

export default {
	steps: STEPS,
	policy: POLICY,
	stepDefaults,
	initialUser,
	view,
	stepTitle: (i: number) => TITLES[STEP_IDS[i]](),
	Scene,
	Panel
} satisfies ConceptRuntime<LIUser, LIView>;
