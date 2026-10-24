import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type SGUser } from './steps.ts';
import { view, type SGView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.sg_step_intro_title(),
	unroll: () => m.sg_step_unroll_title(),
	sine: () => m.sg_step_sine_title(),
	cosine: () => m.sg_step_cosine_title(),
	periodic: () => m.sg_step_periodic_title(),
	explore: () => m.sg_step_explore_title()
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
	Panel,
	layout: 'below'
} satisfies ConceptRuntime<SGUser, SGView>;
