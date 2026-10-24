import { m } from '#lib/paraglide/messages.js';
import type { ConceptRuntime } from '../../types';
import Panel from './Panel.svelte';
import Scene from './Scene.svelte';
import { STEP_IDS, type StepId } from './step-ids.ts';
import { STEPS, POLICY, stepDefaults, initialUser, type SRUser } from './steps.ts';
import { view, type SRView } from './view.ts';

const TITLES: Record<StepId, () => string> = {
	intro: () => m.sr_step_intro_title(),
	vertical: () => m.sr_step_vertical_title(),
	horizontal: () => m.sr_step_horizontal_title(),
	'reflect-x': () => m.sr_step_reflect_x_title(),
	'reflect-y': () => m.sr_step_reflect_y_title(),
	explore: () => m.sr_step_explore_title()
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
} satisfies ConceptRuntime<SRUser, SRView>;
