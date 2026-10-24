import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type LAUser } from './steps.ts';
import { view, type LAView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.la_step_intro_title(),
	predict: () => m.la_step_predict_title(),
	approach: () => m.la_step_approach_title(),
	zoom: () => m.la_step_zoom_title(),
	value: () => m.la_step_value_title(),
	jump: () => m.la_step_jump_title(),
	oscillate: () => m.la_step_oscillate_title()
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
} satisfies ConceptRuntime<LAUser, LAView>;
